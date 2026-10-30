package com.smartpark.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryResponse {

    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private double occupancyRatePercentage;
    private long totalBookings;
    private long activeBookings;
    private long completedBookings;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private String currency = "INR";

    public AnalyticsSummaryResponse() {
    }

    public long getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(long totalSlots) {
        this.totalSlots = totalSlots;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(long availableSlots) {
        this.availableSlots = availableSlots;
    }

    public long getOccupiedSlots() {
        return occupiedSlots;
    }

    public void setOccupiedSlots(long occupiedSlots) {
        this.occupiedSlots = occupiedSlots;
    }

    public double getOccupancyRatePercentage() {
        return occupancyRatePercentage;
    }

    public void setOccupancyRatePercentage(double occupancyRatePercentage) {
        this.occupancyRatePercentage = occupancyRatePercentage;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
