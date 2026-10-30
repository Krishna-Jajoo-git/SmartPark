package com.smartpark.exception;

public class InvalidBookingOperationException extends RuntimeException {
    public InvalidBookingOperationException(String message) {
        super(message);
    }
}
