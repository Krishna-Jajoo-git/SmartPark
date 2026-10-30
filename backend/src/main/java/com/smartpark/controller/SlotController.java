package com.smartpark.controller;

import com.smartpark.dto.ParkingSlotResponse;
import com.smartpark.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@Tag(name = "Slots", description = "Parking Slot Management APIs")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping
    @Operation(summary = "Get all parking slots", description = "Retrieves all parking slots along with their current status and active bookings.")
    public ResponseEntity<List<ParkingSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/available")
    @Operation(summary = "Get available slots", description = "Retrieves all slots that are currently available for parking.")
    public ResponseEntity<List<ParkingSlotResponse>> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get slot by ID", description = "Retrieves detailed information for a specific parking slot.")
    public ResponseEntity<ParkingSlotResponse> getSlotById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }
}
