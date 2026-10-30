package com.smartpark.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class FareEstimateResponse {

    private Long bookingId;
    private String vehicleNumber;
    private String slotNumber;
    private Instant entryTime;
    private Instant currentTime;
    private long durationInSeconds;
    private String durationFormatted;
    private BigDecimal accruedFare;

    public FareEstimateResponse() {
    }

    public FareEstimateResponse(Long bookingId, String vehicleNumber, String slotNumber, Instant entryTime, Instant currentTime, long durationInSeconds, String durationFormatted, BigDecimal accruedFare) {
        this.bookingId = bookingId;
        this.vehicleNumber = vehicleNumber;
        this.slotNumber = slotNumber;
        this.entryTime = entryTime;
        this.currentTime = currentTime;
        this.durationInSeconds = durationInSeconds;
        this.durationFormatted = durationFormatted;
        this.accruedFare = accruedFare;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public Instant getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(Instant entryTime) {
        this.entryTime = entryTime;
    }

    public Instant getCurrentTime() {
        return currentTime;
    }

    public void setCurrentTime(Instant currentTime) {
        this.currentTime = currentTime;
    }

    public long getDurationInSeconds() {
        return durationInSeconds;
    }

    public void setDurationInSeconds(long durationInSeconds) {
        this.durationInSeconds = durationInSeconds;
    }

    public String getDurationFormatted() {
        return durationFormatted;
    }

    public void setDurationFormatted(String durationFormatted) {
        this.durationFormatted = durationFormatted;
    }

    public BigDecimal getAccruedFare() {
        return accruedFare;
    }

    public void setAccruedFare(BigDecimal accruedFare) {
        this.accruedFare = accruedFare;
    }
}
