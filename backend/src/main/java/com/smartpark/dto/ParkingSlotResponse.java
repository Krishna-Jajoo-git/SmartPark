package com.smartpark.dto;

import com.smartpark.entity.SlotStatus;

import java.time.Instant;

public class ParkingSlotResponse {

    private Long id;
    private String slotNumber;
    private SlotStatus status;
    private String floor;
    private Long currentBookingId;
    private String currentVehicleNumber;
    private Instant currentEntryTime;

    public ParkingSlotResponse() {
    }

    public ParkingSlotResponse(Long id, String slotNumber, SlotStatus status, String floor) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.status = status;
        this.floor = floor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public Long getCurrentBookingId() {
        return currentBookingId;
    }

    public void setCurrentBookingId(Long currentBookingId) {
        this.currentBookingId = currentBookingId;
    }

    public String getCurrentVehicleNumber() {
        return currentVehicleNumber;
    }

    public void setCurrentVehicleNumber(String currentVehicleNumber) {
        this.currentVehicleNumber = currentVehicleNumber;
    }

    public Instant getCurrentEntryTime() {
        return currentEntryTime;
    }

    public void setCurrentEntryTime(Instant currentEntryTime) {
        this.currentEntryTime = currentEntryTime;
    }
}
