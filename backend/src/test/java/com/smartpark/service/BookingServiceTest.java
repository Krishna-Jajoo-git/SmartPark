package com.smartpark.service;

import com.smartpark.dto.BookingRequest;
import com.smartpark.dto.BookingResponse;
import com.smartpark.dto.CheckoutResponse;
import com.smartpark.dto.FareEstimateResponse;
import com.smartpark.entity.*;
import com.smartpark.exception.*;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import com.smartpark.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit & Business Rule Tests")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Spy
    private FareCalculator fareCalculator = new FareCalculator();

    @InjectMocks
    private BookingService bookingService;

    private ParkingSlot testSlot;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        testSlot = new ParkingSlot(1L, "A-01", SlotStatus.AVAILABLE, "Ground Floor");
        testBooking = new Booking("MH12AB1234", testSlot, Instant.now().minus(Duration.ofHours(2)));
        testBooking.setId(100L);
    }

    @Test
    @DisplayName("Allocate slot: Success with specific slot ID")
    void testCreateBookingSuccessWithSpecificSlot() {
        BookingRequest request = new BookingRequest("MH12AB1234", 1L);

        when(bookingRepository.existsByVehicleNumberAndStatus("MH12AB1234", BookingStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testSlot));
        when(bookingRepository.existsBySlotIdAndStatus(1L, BookingStatus.ACTIVE)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(101L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("MH12AB1234", response.getVehicleNumber());
        assertEquals("A-01", response.getSlotNumber());
        assertEquals(SlotStatus.OCCUPIED, testSlot.getStatus());
        verify(slotRepository).save(testSlot);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Allocate slot: Success with auto-allocation when slotId is null")
    void testCreateBookingSuccessAutoAllocation() {
        BookingRequest request = new BookingRequest("KA01CD5678", null);

        when(bookingRepository.existsByVehicleNumberAndStatus("KA01CD5678", BookingStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.AVAILABLE)).thenReturn(List.of(testSlot));
        when(slotRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testSlot));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(102L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(102L, response.getId());
        assertEquals("KA01CD5678", response.getVehicleNumber());
        assertEquals(SlotStatus.OCCUPIED, testSlot.getStatus());
    }

    @Test
    @DisplayName("Business Rule: Reject booking if vehicle already has an active booking")
    void testCreateBookingFailsIfVehicleAlreadyParked() {
        BookingRequest request = new BookingRequest("MH12AB1234", 1L);
        when(bookingRepository.existsByVehicleNumberAndStatus("MH12AB1234", BookingStatus.ACTIVE)).thenReturn(true);

        assertThrows(VehicleAlreadyParkedException.class, () ->
                bookingService.createBooking(request)
        );

        verify(slotRepository, never()).findByIdWithLock(anyLong());
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Business Rule: Reject booking if slot is already occupied")
    void testCreateBookingFailsIfSlotOccupied() {
        testSlot.setStatus(SlotStatus.OCCUPIED);
        BookingRequest request = new BookingRequest("DL04EF9999", 1L);

        when(bookingRepository.existsByVehicleNumberAndStatus("DL04EF9999", BookingStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testSlot));

        assertThrows(SlotAlreadyOccupiedException.class, () ->
                bookingService.createBooking(request)
        );

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Checkout: Successfully completes booking, releases slot and creates payment")
    void testCheckoutSuccess() {
        testSlot.setStatus(SlotStatus.OCCUPIED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(testBooking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(500L);
            return p;
        });

        CheckoutResponse response = bookingService.checkout(100L);

        assertNotNull(response);
        assertEquals(100L, response.getBookingId());
        assertEquals("MH12AB1234", response.getVehicleNumber());
        assertEquals("A-01", response.getSlotNumber());
        assertEquals(BookingStatus.COMPLETED, testBooking.getStatus());
        assertEquals(SlotStatus.AVAILABLE, testSlot.getStatus());
        assertEquals(PaymentStatus.PAID, response.getPaymentStatus());
        assertEquals(new BigDecimal("50.00"), response.getFinalAmount());
        assertNotNull(response.getPaymentId());
        assertNotNull(response.getTransactionReference());

        verify(slotRepository).save(testSlot);
        verify(paymentRepository).save(any(Payment.class));
        verify(bookingRepository).save(testBooking);
    }

    @Test
    @DisplayName("Business Rule: Reject checkout if booking is already completed")
    void testCheckoutFailsIfAlreadyCompleted() {
        testBooking.setStatus(BookingStatus.COMPLETED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(testBooking));

        assertThrows(BookingAlreadyCompletedException.class, () ->
                bookingService.checkout(100L)
        );

        verify(slotRepository, never()).save(any(ParkingSlot.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    @DisplayName("Calculate Fare: Accrued fare estimation")
    void testCalculateAccruedFare() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(testBooking));

        FareEstimateResponse estimate = bookingService.calculateAccruedFare(100L);

        assertNotNull(estimate);
        assertEquals(100L, estimate.getBookingId());
        assertEquals("MH12AB1234", estimate.getVehicleNumber());
        assertEquals("A-01", estimate.getSlotNumber());
        assertEquals(new BigDecimal("50.00"), estimate.getAccruedFare());
        assertTrue(estimate.getDurationInSeconds() > 7000);
    }
}
