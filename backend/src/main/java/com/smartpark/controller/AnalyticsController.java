package com.smartpark.controller;

import com.smartpark.dto.AnalyticsSummaryResponse;
import com.smartpark.dto.DailyRevenueResponse;
import com.smartpark.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Parking Statistics and Revenue Reporting APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/revenue")
    @Operation(summary = "Calculate aggregate revenue for a date", description = "Aggregates revenue and transaction counts for a specified date (YYYY-MM-DD).")
    public ResponseEntity<DailyRevenueResponse> getRevenueByDate(
            @Parameter(description = "Date in YYYY-MM-DD format (defaults to current UTC date if omitted)", example = "2026-10-27")
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(analyticsService.getRevenueByDate(date));
    }

    @GetMapping("/summary")
    @Operation(summary = "Overall parking statistics and revenue", description = "Returns total/available/occupied slots, occupancy rate, total bookings, and aggregate revenue.")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}
