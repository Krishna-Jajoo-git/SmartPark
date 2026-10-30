package com.smartpark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.TimeZone;

@SpringBootApplication
@EnableTransactionManagement
public class SmartParkApplication {

    public static void main(String[] args) {
        // Enforce consistent UTC timezone strategy across the application
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(SmartParkApplication.class, args);
    }
}
