package com.smartpark.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

/**
 * Dedicated Fare Calculation Service.
 *
 * Fee Specification:
 * - Charge INR 50 for every 3 hours (10,800 seconds) or fraction thereof.
 * - Formula: ceil(duration in seconds / 10800.0) * 50.
 * - Zero duration costs zero.
 * - Any positive duration costs at least INR 50.
 */
@Component
public class FareCalculator {

    public static final long SECONDS_PER_BLOCK = 10800L; // 3 hours
    public static final BigDecimal RATE_PER_BLOCK = BigDecimal.valueOf(50.00);

    /**
     * Calculates the accrued parking fare between entry and exit timestamps.
     *
     * @param entryTime Entry timestamp (UTC)
     * @param exitTime  Exit timestamp (UTC)
     * @return Calculated fare in INR
     * @throws IllegalArgumentException if timestamps are null or exit is before entry
     */
    public BigDecimal calculateFare(Instant entryTime, Instant exitTime) {
        if (entryTime == null || exitTime == null) {
            throw new IllegalArgumentException("Entry time and exit time cannot be null");
        }
        if (exitTime.isBefore(entryTime)) {
            throw new IllegalArgumentException("Exit time cannot be earlier than entry time");
        }

        long durationSeconds = Duration.between(entryTime, exitTime).getSeconds();
        return calculateFare(durationSeconds);
    }

    /**
     * Calculates fare based on duration in seconds.
     *
     * @param durationSeconds Duration in seconds
     * @return Calculated fare in INR
     * @throws IllegalArgumentException if duration is negative
     */
    public BigDecimal calculateFare(long durationSeconds) {
        if (durationSeconds < 0) {
            throw new IllegalArgumentException("Duration cannot be negative");
        }
        if (durationSeconds == 0) {
            return BigDecimal.ZERO.setScale(2);
        }

        // ceil(durationSeconds / 10800.0)
        long blocks = (durationSeconds + SECONDS_PER_BLOCK - 1) / SECONDS_PER_BLOCK;
        return RATE_PER_BLOCK.multiply(BigDecimal.valueOf(blocks)).setScale(2);
    }

    /**
     * Formats duration in seconds to a human-readable string (e.g., "2h 15m 30s").
     */
    public String formatDuration(long durationSeconds) {
        if (durationSeconds < 0) {
            return "0s";
        }
        long hours = durationSeconds / 3600;
        long minutes = (durationSeconds % 3600) / 60;
        long seconds = durationSeconds % 60;

        StringBuilder sb = new StringBuilder();
        if (hours > 0) {
            sb.append(hours).append("h ");
        }
        if (minutes > 0 || hours > 0) {
            sb.append(minutes).append("m ");
        }
        sb.append(seconds).append("s");
        return sb.toString().trim();
    }
}
