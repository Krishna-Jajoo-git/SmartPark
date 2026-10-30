package com.smartpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyRevenueResponse {

    private LocalDate date;
    private BigDecimal totalRevenue;
    private long paidTransactionsCount;
    private String currency = "INR";

    public DailyRevenueResponse() {
    }

    public DailyRevenueResponse(LocalDate date, BigDecimal totalRevenue, long paidTransactionsCount) {
        this.date = date;
        this.totalRevenue = totalRevenue;
        this.paidTransactionsCount = paidTransactionsCount;
        this.currency = "INR";
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getPaidTransactionsCount() {
        return paidTransactionsCount;
    }

    public void setPaidTransactionsCount(long paidTransactionsCount) {
        this.paidTransactionsCount = paidTransactionsCount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
