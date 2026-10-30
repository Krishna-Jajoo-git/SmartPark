package com.smartpark.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("FareCalculator Unit Tests")
class FareCalculatorTest {

    private FareCalculator fareCalculator;

    @BeforeEach
    void setUp() {
        fareCalculator = new FareCalculator();
    }

    @Test
    @DisplayName("Zero duration costs exactly 0.00")
    void testZeroDuration() {
        Instant now = Instant.parse("2026-10-27T10:00:00Z");
        BigDecimal fare = fareCalculator.calculateFare(now, now);
        assertEquals(new BigDecimal("0.00"), fare);

        BigDecimal fareDirect = fareCalculator.calculateFare(0L);
        assertEquals(new BigDecimal("0.00"), fareDirect);
    }

    @Test
    @DisplayName("Boundary: 1 second duration costs 50.00")
    void testOneSecondDuration() {
        BigDecimal fare = fareCalculator.calculateFare(1L);
        assertEquals(new BigDecimal("50.00"), fare);
    }

    @Test
    @DisplayName("Specification Example: 1 minute costs 50.00")
    void testOneMinuteDuration() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofMinutes(1));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("50.00"), fare);
    }

    @Test
    @DisplayName("Specification Example: 2 hours 15 minutes costs 50.00")
    void testTwoHoursFifteenMinutesDuration() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(2)).plus(Duration.ofMinutes(15));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("50.00"), fare);
    }

    @Test
    @DisplayName("Boundary: 10,799 seconds (1 second before 3 hours) costs 50.00")
    void testJustBeforeThreeHours() {
        BigDecimal fare = fareCalculator.calculateFare(10799L);
        assertEquals(new BigDecimal("50.00"), fare);
    }

    @Test
    @DisplayName("Specification Example & Boundary: Exactly 3 hours (10,800 seconds) costs 50.00")
    void testExactlyThreeHours() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(3));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("50.00"), fare);

        BigDecimal fareDirect = fareCalculator.calculateFare(10800L);
        assertEquals(new BigDecimal("50.00"), fareDirect);
    }

    @Test
    @DisplayName("Boundary: 10,801 seconds (3 hours + 1 second) costs 100.00")
    void testJustPastThreeHours() {
        BigDecimal fare = fareCalculator.calculateFare(10801L);
        assertEquals(new BigDecimal("100.00"), fare);
    }

    @Test
    @DisplayName("Specification Example: 3 hours 5 minutes costs 100.00")
    void testThreeHoursFiveMinutesDuration() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(3)).plus(Duration.ofMinutes(5));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("100.00"), fare);
    }

    @Test
    @DisplayName("Boundary: 21,599 seconds (1 second before 6 hours) costs 100.00")
    void testJustBeforeSixHours() {
        BigDecimal fare = fareCalculator.calculateFare(21599L);
        assertEquals(new BigDecimal("100.00"), fare);
    }

    @Test
    @DisplayName("Specification Example & Boundary: Exactly 6 hours (21,600 seconds) costs 100.00")
    void testExactlySixHours() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(6));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("100.00"), fare);

        BigDecimal fareDirect = fareCalculator.calculateFare(21600L);
        assertEquals(new BigDecimal("100.00"), fareDirect);
    }

    @Test
    @DisplayName("Specification Example: 6 hours 1 minute costs 150.00")
    void testSixHoursOneMinuteDuration() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(6)).plus(Duration.ofMinutes(1));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("150.00"), fare);
    }

    @Test
    @DisplayName("24 hours parking (8 blocks) costs 400.00")
    void testTwentyFourHoursDuration() {
        Instant entry = Instant.parse("2026-10-27T10:00:00Z");
        Instant exit = entry.plus(Duration.ofHours(24));
        BigDecimal fare = fareCalculator.calculateFare(entry, exit);
        assertEquals(new BigDecimal("400.00"), fare);
    }

    @Test
    @DisplayName("Validation: Throws IllegalArgumentException on null entry timestamp")
    void testNullEntryTimestampThrows() {
        Instant exit = Instant.now();
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fareCalculator.calculateFare(null, exit)
        );
        assertTrue(ex.getMessage().contains("cannot be null"));
    }

    @Test
    @DisplayName("Validation: Throws IllegalArgumentException on null exit timestamp")
    void testNullExitTimestampThrows() {
        Instant entry = Instant.now();
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fareCalculator.calculateFare(entry, null)
        );
        assertTrue(ex.getMessage().contains("cannot be null"));
    }

    @Test
    @DisplayName("Validation: Throws IllegalArgumentException when exit time is before entry time")
    void testExitBeforeEntryThrows() {
        Instant entry = Instant.parse("2026-10-27T12:00:00Z");
        Instant exit = Instant.parse("2026-10-27T11:00:00Z");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fareCalculator.calculateFare(entry, exit)
        );
        assertTrue(ex.getMessage().contains("cannot be earlier"));
    }

    @Test
    @DisplayName("Validation: Throws IllegalArgumentException on negative duration seconds")
    void testNegativeDurationThrows() {
        assertThrows(IllegalArgumentException.class, () ->
                fareCalculator.calculateFare(-50L)
        );
    }

    @ParameterizedTest(name = "Format duration {0}s -> {1}")
    @CsvSource({
            "0, '0s'",
            "45, '45s'",
            "60, '1m 0s'",
            "3600, '1h 0m 0s'",
            "8130, '2h 15m 30s'"
    })
    void testFormatDuration(long seconds, String expected) {
        assertEquals(expected, fareCalculator.formatDuration(seconds));
    }
}
