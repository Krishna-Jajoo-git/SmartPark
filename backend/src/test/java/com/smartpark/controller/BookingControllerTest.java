package com.smartpark.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.dto.BookingRequest;
import com.smartpark.dto.BookingResponse;
import com.smartpark.dto.CheckoutResponse;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.PaymentStatus;
import com.smartpark.exception.GlobalExceptionHandler;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.exception.SlotAlreadyOccupiedException;
import com.smartpark.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingController Integration & Validation Tests")
class BookingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("POST /api/bookings returns 201 Created on valid request")
    void testCreateBookingSuccess() throws Exception {
        BookingRequest request = new BookingRequest("MH12AB1234", 1L);

        BookingResponse response = new BookingResponse();
        response.setId(10L);
        response.setVehicleNumber("MH12AB1234");
        response.setSlotId(1L);
        response.setSlotNumber("A-01");
        response.setStatus(BookingStatus.ACTIVE);
        response.setEntryTime(Instant.now());

        when(bookingService.createBooking(any(BookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.vehicleNumber").value("MH12AB1234"))
                .andExpect(jsonPath("$.slotNumber").value("A-01"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("POST /api/bookings returns 409 Conflict when slot is already occupied")
    void testCreateBookingSlotOccupiedConflict() throws Exception {
        BookingRequest request = new BookingRequest("MH12AB1234", 1L);

        when(bookingService.createBooking(any(BookingRequest.class)))
                .thenThrow(new SlotAlreadyOccupiedException("Parking slot A-01 is already occupied"));

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Parking slot A-01 is already occupied"));
    }

    @Test
    @DisplayName("GET /api/bookings/active returns list of active bookings")
    void testGetActiveBookings() throws Exception {
        BookingResponse b1 = new BookingResponse();
        b1.setId(1L);
        b1.setVehicleNumber("MH12AB1234");
        b1.setSlotNumber("A-01");
        b1.setStatus(BookingStatus.ACTIVE);
        b1.setAccruedFare(BigDecimal.valueOf(50.00));

        when(bookingService.getActiveBookings()).thenReturn(List.of(b1));

        mockMvc.perform(get("/api/bookings/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vehicleNumber").value("MH12AB1234"))
                .andExpect(jsonPath("$[0].accruedFare").value(50.00));
    }

    @Test
    @DisplayName("POST /api/bookings/{id}/checkout completes booking and returns receipt info")
    void testCheckoutSuccess() throws Exception {
        CheckoutResponse response = new CheckoutResponse();
        response.setBookingId(1L);
        response.setVehicleNumber("MH12AB1234");
        response.setSlotNumber("A-01");
        response.setFinalAmount(BigDecimal.valueOf(50.00));
        response.setPaymentStatus(PaymentStatus.PAID);
        response.setDurationFormatted("1h 15m 0s");

        when(bookingService.checkout(1L)).thenReturn(response);

        mockMvc.perform(post("/api/bookings/1/checkout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(1))
                .andExpect(jsonPath("$.finalAmount").value(50.00))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} returns 404 when booking not found")
    void testGetBookingNotFound() throws Exception {
        when(bookingService.getBookingById(999L))
                .thenThrow(new ResourceNotFoundException("Booking not found with id: 999"));

        mockMvc.perform(get("/api/bookings/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
