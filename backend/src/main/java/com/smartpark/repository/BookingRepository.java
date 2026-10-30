package com.smartpark.repository;

import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStatusOrderByEntryTimeDesc(BookingStatus status);

    Optional<Booking> findByVehicleNumberAndStatus(String vehicleNumber, BookingStatus status);

    Optional<Booking> findFirstByVehicleNumberOrderByEntryTimeDesc(String vehicleNumber);

    Optional<Booking> findBySlotIdAndStatus(Long slotId, BookingStatus status);

    boolean existsByVehicleNumberAndStatus(String vehicleNumber, BookingStatus status);

    boolean existsBySlotIdAndStatus(Long slotId, BookingStatus status);

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE UPPER(b.vehicleNumber) = UPPER(:vehicleNumber) ORDER BY b.entryTime DESC")
    List<Booking> findAllByVehicleNumberIgnoreCase(@Param("vehicleNumber") String vehicleNumber);
}
