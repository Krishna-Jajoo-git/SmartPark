package com.smartpark.dto;

import com.smartpark.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class BookingResponse {

    private Long id;
    private String vehicleNumber;
    private Long slotId;
    private String slotNumber;
    private String slotFloor;
    private Instant entryTime;
    private Instant exitTime;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private Long paymentId;
    private BigDecimal accruedFare;

    public BookingResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getSlotFloor() {
        return slotFloor;
    }

    public void setSlotFloor(String slotFloor) {
        this.slotFloor = slotFloor;
    }

    public Instant getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(Instant entryTime) {
        this.entryTime = entryTime;
    }

    public Instant getExitTime() {
        return exitTime;
    }

    public void setExitTime(Instant exitTime) {
        this.exitTime = exitTime;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public BigDecimal getAccruedFare() {
        return accruedFare;
    }

    public void setAccruedFare(BigDecimal accruedFare) {
        this.accruedFare = accruedFare;
    }
}
