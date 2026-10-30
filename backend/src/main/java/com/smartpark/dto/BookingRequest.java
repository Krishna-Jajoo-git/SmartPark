package com.smartpark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class BookingRequest {

    @Schema(description = "Vehicle registration number", example = "MH12AB1234")
    @NotBlank(message = "Vehicle registration number is required")
    @Pattern(regexp = "^[A-Za-z0-9 -]{4,15}$", message = "Vehicle number must contain 4 to 15 alphanumeric characters")
    private String vehicleNumber;

    @Schema(description = "Optional specific slot ID. If omitted, the first available slot is automatically assigned", example = "1")
    private Long slotId;

    public BookingRequest() {
    }

    public BookingRequest(String vehicleNumber, Long slotId) {
        this.vehicleNumber = vehicleNumber;
        this.slotId = slotId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }
}
