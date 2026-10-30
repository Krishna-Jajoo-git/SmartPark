package com.smartpark.service;

import com.smartpark.dto.ParkingSlotResponse;
import com.smartpark.entity.ParkingSlot;
import com.smartpark.entity.SlotStatus;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SlotService Unit Tests")
class SlotServiceTest {

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private SlotService slotService;

    private ParkingSlot slot1;
    private ParkingSlot slot2;

    @BeforeEach
    void setUp() {
        slot1 = new ParkingSlot(1L, "A-01", SlotStatus.AVAILABLE, "Ground Floor");
        slot2 = new ParkingSlot(2L, "A-02", SlotStatus.OCCUPIED, "Ground Floor");
    }

    @Test
    @DisplayName("Get all slots returns mapped responses")
    void testGetAllSlots() {
        when(slotRepository.findAllByOrderBySlotNumberAsc()).thenReturn(List.of(slot1, slot2));
        when(bookingRepository.findByStatusOrderByEntryTimeDesc(any())).thenReturn(Collections.emptyList());

        List<ParkingSlotResponse> results = slotService.getAllSlots();

        assertEquals(2, results.size());
        assertEquals("A-01", results.get(0).getSlotNumber());
        assertEquals(SlotStatus.AVAILABLE, results.get(0).getStatus());
        assertEquals("A-02", results.get(1).getSlotNumber());
        assertEquals(SlotStatus.OCCUPIED, results.get(1).getStatus());
    }

    @Test
    @DisplayName("Get available slots filters only AVAILABLE")
    void testGetAvailableSlots() {
        when(slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.AVAILABLE)).thenReturn(List.of(slot1));

        List<ParkingSlotResponse> results = slotService.getAvailableSlots();

        assertEquals(1, results.size());
        assertEquals("A-01", results.get(0).getSlotNumber());
        assertEquals(SlotStatus.AVAILABLE, results.get(0).getStatus());
    }

    @Test
    @DisplayName("Get slot by ID returns specific slot")
    void testGetSlotByIdSuccess() {
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot1));

        ParkingSlotResponse result = slotService.getSlotById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("A-01", result.getSlotNumber());
    }

    @Test
    @DisplayName("Get slot by ID throws ResourceNotFoundException if absent")
    void testGetSlotByIdNotFound() {
        when(slotRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                slotService.getSlotById(999L)
        );
    }
}
