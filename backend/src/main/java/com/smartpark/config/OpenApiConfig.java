package com.smartpark.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartParkOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartPark Smart Parking Management API")
                        .description("Production-grade RESTful API for parking slot management, vehicle bookings, live billing, simulated checkout, and revenue analytics.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SmartPark Engineering Team")
                                .email("support@smartpark.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
