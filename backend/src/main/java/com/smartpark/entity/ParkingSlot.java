package com.smartpark.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "parking_slots", indexes = {
    @Index(name = "idx_parking_slots_status", columnList = "status"),
    @Index(name = "idx_parking_slots_number", columnList = "slot_number", unique = true)
})
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_number", nullable = false, unique = true, length = 20)
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Column(length = 50)
    private String floor = "Ground Floor";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ParkingSlot() {
    }

    public ParkingSlot(String slotNumber, String floor) {
        this.slotNumber = slotNumber;
        this.floor = floor;
        this.status = SlotStatus.AVAILABLE;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public ParkingSlot(Long id, String slotNumber, SlotStatus status, String floor) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.status = status;
        this.floor = floor;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
