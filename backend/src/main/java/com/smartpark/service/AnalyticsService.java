package com.smartpark.service;

import com.smartpark.dto.AnalyticsSummaryResponse;
import com.smartpark.dto.DailyRevenueResponse;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.PaymentStatus;
import com.smartpark.entity.SlotStatus;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import com.smartpark.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PaymentRepository paymentRepository;
    private final ParkingSlotRepository slotRepository;
    private final BookingRepository bookingRepository;

    public AnalyticsService(PaymentRepository paymentRepository,
                            ParkingSlotRepository slotRepository,
                            BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Calculates aggregate revenue and transaction count for a specified calendar date in UTC.
     */
    public DailyRevenueResponse getRevenueByDate(LocalDate date) {
        if (date == null) {
            date = LocalDate.now(ZoneOffset.UTC);
        }

        Instant startOfDay = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal revenue = paymentRepository.sumRevenueByPaymentStatusAndDateRange(
                PaymentStatus.PAID, startOfDay, endOfDay
        );
        long count = paymentRepository.countPaidPaymentsByDateRange(
                PaymentStatus.PAID, startOfDay, endOfDay
        );

        return new DailyRevenueResponse(date, revenue, count);
    }

    /**
     * Returns holistic parking management statistics, occupancy rates, and revenue.
     */
    public AnalyticsSummaryResponse getSummary() {
        long totalSlots = slotRepository.count();
        long occupiedSlots = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long availableSlots = slotRepository.countByStatus(SlotStatus.AVAILABLE);

        double occupancyRate = 0.0;
        if (totalSlots > 0) {
            occupancyRate = BigDecimal.valueOf((double) occupiedSlots / totalSlots * 100.0)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByStatus(BookingStatus.ACTIVE);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);

        BigDecimal totalRevenue = paymentRepository.sumTotalRevenueByPaymentStatus(PaymentStatus.PAID);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant startOfToday = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfToday = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        BigDecimal todayRevenue = paymentRepository.sumRevenueByPaymentStatusAndDateRange(
                PaymentStatus.PAID, startOfToday, endOfToday
        );

        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();
        summary.setTotalSlots(totalSlots);
        summary.setAvailableSlots(availableSlots);
        summary.setOccupiedSlots(occupiedSlots);
        summary.setOccupancyRatePercentage(occupancyRate);
        summary.setTotalBookings(totalBookings);
        summary.setActiveBookings(activeBookings);
        summary.setCompletedBookings(completedBookings);
        summary.setTotalRevenue(totalRevenue);
        summary.setTodayRevenue(todayRevenue);
        summary.setCurrency("INR");

        return summary;
    }
}
