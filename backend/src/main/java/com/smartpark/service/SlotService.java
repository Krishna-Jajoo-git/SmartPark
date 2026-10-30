package com.smartpark.service;

import com.smartpark.dto.ParkingSlotResponse;
import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.ParkingSlot;
import com.smartpark.entity.SlotStatus;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SlotService {

    private final ParkingSlotRepository slotRepository;
    private final BookingRepository bookingRepository;

    public SlotService(ParkingSlotRepository slotRepository, BookingRepository bookingRepository) {
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<ParkingSlotResponse> getAllSlots() {
        List<ParkingSlot> slots = slotRepository.findAllByOrderBySlotNumberAsc();
        // Load active bookings to enrich slot responses with current vehicle details
        List<Booking> activeBookings = bookingRepository.findByStatusOrderByEntryTimeDesc(BookingStatus.ACTIVE);
        Map<Long, Booking> slotToActiveBooking = activeBookings.stream()
                .collect(Collectors.toMap(b -> b.getSlot().getId(), b -> b, (b1, b2) -> b1));

        return slots.stream()
                .map(slot -> toResponse(slot, slotToActiveBooking.get(slot.getId())))
                .collect(Collectors.toList());
    }

    public List<ParkingSlotResponse> getAvailableSlots() {
        List<ParkingSlot> slots = slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.AVAILABLE);
        return slots.stream()
                .map(slot -> toResponse(slot, null))
                .collect(Collectors.toList());
    }

    public ParkingSlotResponse getSlotById(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        Booking activeBooking = null;
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            activeBooking = bookingRepository.findBySlotIdAndStatus(slot.getId(), BookingStatus.ACTIVE).orElse(null);
        }
        return toResponse(slot, activeBooking);
    }

    public ParkingSlot findEntityById(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
    }

    private ParkingSlotResponse toResponse(ParkingSlot slot, Booking activeBooking) {
        ParkingSlotResponse resp = new ParkingSlotResponse(
                slot.getId(),
                slot.getSlotNumber(),
                slot.getStatus(),
                slot.getFloor()
        );
        if (activeBooking != null) {
            resp.setCurrentBookingId(activeBooking.getId());
            resp.setCurrentVehicleNumber(activeBooking.getVehicleNumber());
            resp.setCurrentEntryTime(activeBooking.getEntryTime());
        }
        return resp;
    }
}
