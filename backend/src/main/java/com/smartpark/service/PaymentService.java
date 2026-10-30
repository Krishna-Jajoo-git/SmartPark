package com.smartpark.service;

import com.smartpark.dto.PaymentResponse;
import com.smartpark.entity.Payment;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with id: " + id));

        PaymentResponse resp = new PaymentResponse();
        resp.setId(payment.getId());
        resp.setBookingId(payment.getBooking().getId());
        resp.setVehicleNumber(payment.getBooking().getVehicleNumber());
        resp.setSlotNumber(payment.getBooking().getSlot().getSlotNumber());
        resp.setAmount(payment.getAmount());
        resp.setPaymentStatus(payment.getPaymentStatus());
        resp.setPaymentTime(payment.getPaymentTime());
        resp.setPaymentMethod(payment.getPaymentMethod());
        resp.setTransactionReference(payment.getTransactionReference());
        return resp;
    }
}
