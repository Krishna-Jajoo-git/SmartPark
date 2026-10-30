package com.smartpark.controller;

import com.smartpark.dto.BookingRequest;
import com.smartpark.dto.BookingResponse;
import com.smartpark.dto.CheckoutResponse;
import com.smartpark.dto.FareEstimateResponse;
import com.smartpark.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Vehicle Booking and Billing APIs")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Allocate an available slot to a vehicle", description = "Allocates a slot to a vehicle. If slotId is omitted, auto-assigns first available slot.")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active bookings", description = "Retrieves all currently active/occupied vehicle parking bookings with live accrued fare.")
    public ResponseEntity<List<BookingResponse>> getActiveBookings() {
        return ResponseEntity.ok(bookingService.getActiveBookings());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Retrieves details of a booking by its primary ID.")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/vehicle/{number}")
    @Operation(summary = "Get booking by vehicle number", description = "Retrieves the active or most recent booking for a given vehicle registration number.")
    public ResponseEntity<BookingResponse> getBookingByVehicleNumber(@PathVariable("number") String vehicleNumber) {
        return ResponseEntity.ok(bookingService.getBookingByVehicleNumber(vehicleNumber));
    }

    @GetMapping("/{id}/fare")
    @Operation(summary = "Calculate current accrued fare", description = "Calculates the accrued fare in real time based on entry timestamp.")
    public ResponseEntity<FareEstimateResponse> getFareEstimate(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.calculateAccruedFare(id));
    }

    @PostMapping("/{id}/checkout")
    @Operation(summary = "Complete booking and process checkout", description = "Calculates final fare, marks booking as completed, releases the slot, and records payment.")
    public ResponseEntity<CheckoutResponse> checkout(
            @PathVariable("id") Long id,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod) {
        CheckoutResponse response = (paymentMethod != null && !paymentMethod.isBlank())
                ? bookingService.checkout(id, paymentMethod)
                : bookingService.checkout(id);
        return ResponseEntity.ok(response);
    }
}
