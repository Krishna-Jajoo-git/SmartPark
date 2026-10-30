package com.smartpark.repository;

import com.smartpark.entity.Payment;
import com.smartpark.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status AND p.paymentTime >= :startOfDay AND p.paymentTime < :endOfDay")
    BigDecimal sumRevenueByPaymentStatusAndDateRange(@Param("status") PaymentStatus status,
                                                     @Param("startOfDay") Instant startOfDay,
                                                     @Param("endOfDay") Instant endOfDay);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumTotalRevenueByPaymentStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status AND p.paymentTime >= :startOfDay AND p.paymentTime < :endOfDay")
    long countPaidPaymentsByDateRange(@Param("status") PaymentStatus status,
                                      @Param("startOfDay") Instant startOfDay,
                                      @Param("endOfDay") Instant endOfDay);
}
