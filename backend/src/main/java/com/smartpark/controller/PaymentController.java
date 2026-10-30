package com.smartpark.controller;

import com.smartpark.dto.PaymentResponse;
import com.smartpark.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Payment Records and Receipt APIs")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details", description = "Retrieves payment receipt details by payment ID.")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
}
