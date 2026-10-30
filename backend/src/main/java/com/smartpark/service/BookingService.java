package com.smartpark.service;

import com.smartpark.dto.*;
import com.smartpark.entity.*;
import com.smartpark.exception.*;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import com.smartpark.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final PaymentRepository paymentRepository;
    private final FareCalculator fareCalculator;

    public BookingService(BookingRepository bookingRepository,
                          ParkingSlotRepository slotRepository,
                          PaymentRepository paymentRepository,
                          FareCalculator fareCalculator) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.paymentRepository = paymentRepository;
        this.fareCalculator = fareCalculator;
    }

    /**
     * Allocates an available slot to a vehicle with pessimistic write locking
     * to strictly prevent simultaneous double bookings.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse createBooking(BookingRequest request) {
        String cleanVehicle = request.getVehicleNumber().trim().toUpperCase();

        // Business Rule: A vehicle cannot have multiple active bookings simultaneously
        if (bookingRepository.existsByVehicleNumberAndStatus(cleanVehicle, BookingStatus.ACTIVE)) {
            throw new VehicleAlreadyParkedException("Vehicle " + cleanVehicle + " is already parked with an active booking");
        }

        ParkingSlot slot;
        if (request.getSlotId() != null) {
            slot = slotRepository.findByIdWithLock(request.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + request.getSlotId()));

            // Business Rule: A slot cannot have more than one active booking
            if (slot.getStatus() == SlotStatus.OCCUPIED || bookingRepository.existsBySlotIdAndStatus(slot.getId(), BookingStatus.ACTIVE)) {
                throw new SlotAlreadyOccupiedException("Parking slot " + slot.getSlotNumber() + " is already occupied");
            }
        } else {
            // Auto-allocate first available slot
            List<ParkingSlot> availableSlots = slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.AVAILABLE);
            if (availableSlots.isEmpty()) {
                throw new SlotAlreadyOccupiedException("No available parking slots found. Parking facility is full.");
            }
            // Acquire pessimistic lock on the chosen slot
            slot = slotRepository.findByIdWithLock(availableSlots.get(0).getId())
                    .orElseThrow(() -> new SlotAlreadyOccupiedException("Failed to secure an available parking slot."));
            if (slot.getStatus() == SlotStatus.OCCUPIED) {
                throw new SlotAlreadyOccupiedException("The selected slot was just occupied. Please try again.");
            }
        }

        // Mark slot as occupied
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        // Create active booking
        Booking booking = new Booking(cleanVehicle, slot, Instant.now());
        Booking savedBooking = bookingRepository.save(booking);

        return toBookingResponse(savedBooking, BigDecimal.ZERO);
    }

    /**
     * Retrieves currently occupied/active bookings with live accrued fare calculation.
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getActiveBookings() {
        List<Booking> activeBookings = bookingRepository.findByStatusOrderByEntryTimeDesc(BookingStatus.ACTIVE);
        Instant now = Instant.now();
        return activeBookings.stream()
                .map(b -> {
                    BigDecimal accrued = fareCalculator.calculateFare(b.getEntryTime(), now);
                    return toBookingResponse(b, accrued);
                })
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a booking by its primary ID.
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        BigDecimal fare = (booking.getStatus() == BookingStatus.ACTIVE)
                ? fareCalculator.calculateFare(booking.getEntryTime(), Instant.now())
                : booking.getTotalAmount();

        return toBookingResponse(booking, fare);
    }

    /**
     * Retrieves the active or latest booking by vehicle registration number.
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingByVehicleNumber(String vehicleNumber) {
        String cleanVehicle = vehicleNumber.trim().toUpperCase();

        // Check active first
        Booking booking = bookingRepository.findByVehicleNumberAndStatus(cleanVehicle, BookingStatus.ACTIVE)
                .or(() -> bookingRepository.findFirstByVehicleNumberOrderByEntryTimeDesc(cleanVehicle))
                .orElseThrow(() -> new ResourceNotFoundException("No booking found for vehicle number: " + cleanVehicle));

        BigDecimal fare = (booking.getStatus() == BookingStatus.ACTIVE)
                ? fareCalculator.calculateFare(booking.getEntryTime(), Instant.now())
                : booking.getTotalAmount();

        return toBookingResponse(booking, fare);
    }

    /**
     * Calculates accrued fare for a booking without altering state.
     */
    @Transactional(readOnly = true)
    public FareEstimateResponse calculateAccruedFare(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        Instant refTime = (booking.getStatus() == BookingStatus.ACTIVE) ? Instant.now() : booking.getExitTime();
        if (refTime == null) {
            refTime = Instant.now();
        }

        long durationSec = Duration.between(booking.getEntryTime(), refTime).getSeconds();
        if (durationSec < 0) durationSec = 0;
        BigDecimal fare = fareCalculator.calculateFare(durationSec);

        return new FareEstimateResponse(
                booking.getId(),
                booking.getVehicleNumber(),
                booking.getSlot().getSlotNumber(),
                booking.getEntryTime(),
                refTime,
                durationSec,
                fareCalculator.formatDuration(durationSec),
                fare
        );
    }

    /**
     * Completes booking, calculates final fee, persists simulated payment, releases slot.
     * Guaranteed transactionally consistent.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CheckoutResponse checkout(Long id) {
        return checkout(id, "UPI/CASH");
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CheckoutResponse checkout(Long id, String paymentMethod) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BookingAlreadyCompletedException("Booking " + id + " has already been checked out and completed");
        }

        Instant exitTime = Instant.now();
        long durationSec = Duration.between(booking.getEntryTime(), exitTime).getSeconds();
        if (durationSec < 0) durationSec = 0;
        BigDecimal finalAmount = fareCalculator.calculateFare(durationSec);

        // Update booking state
        booking.setExitTime(exitTime);
        booking.setTotalAmount(finalAmount);
        booking.setStatus(BookingStatus.COMPLETED);

        // Release parking slot
        ParkingSlot slot = booking.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        // Record simulated payment
        String method = (paymentMethod != null && !paymentMethod.isBlank()) ? paymentMethod.trim().toUpperCase() : "UPI/CASH";
        String txnRef = "TXN-" + System.currentTimeMillis() + "-" + booking.getId();
        Payment payment = new Payment(
                booking,
                finalAmount,
                PaymentStatus.PAID,
                exitTime,
                method,
                txnRef
        );
        Payment savedPayment = paymentRepository.save(payment);
        booking.setPayment(savedPayment);
        bookingRepository.save(booking);

        // Assemble response
        CheckoutResponse response = new CheckoutResponse();
        response.setBookingId(booking.getId());
        response.setVehicleNumber(booking.getVehicleNumber());
        response.setSlotId(slot.getId());
        response.setSlotNumber(slot.getSlotNumber());
        response.setSlotFloor(slot.getFloor());
        response.setEntryTime(booking.getEntryTime());
        response.setExitTime(exitTime);
        response.setDurationInSeconds(durationSec);
        response.setDurationFormatted(fareCalculator.formatDuration(durationSec));
        response.setFinalAmount(finalAmount);
        response.setPaymentId(savedPayment.getId());
        response.setPaymentStatus(savedPayment.getPaymentStatus());
        response.setPaymentTime(savedPayment.getPaymentTime());
        response.setPaymentMethod(savedPayment.getPaymentMethod());
        response.setTransactionReference(savedPayment.getTransactionReference());

        return response;
    }

    private BookingResponse toBookingResponse(Booking booking, BigDecimal accruedFare) {
        BookingResponse resp = new BookingResponse();
        resp.setId(booking.getId());
        resp.setVehicleNumber(booking.getVehicleNumber());
        resp.setSlotId(booking.getSlot().getId());
        resp.setSlotNumber(booking.getSlot().getSlotNumber());
        resp.setSlotFloor(booking.getSlot().getFloor());
        resp.setEntryTime(booking.getEntryTime());
        resp.setExitTime(booking.getExitTime());
        resp.setTotalAmount(booking.getTotalAmount());
        resp.setStatus(booking.getStatus());
        resp.setAccruedFare(accruedFare);
        if (booking.getPayment() != null) {
            resp.setPaymentId(booking.getPayment().getId());
        }
        return resp;
    }
}
