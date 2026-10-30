# Lightweight Production Runtime Dockerfile for SmartPark Backend
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root system user
RUN addgroup -S smartpark && adduser -S smartpark -G smartpark
USER smartpark:smartpark

# Copy pre-compiled production Spring Boot JAR
COPY target/smartpark-backend-*.jar app.jar

EXPOSE 8080

ENV DB_URL=jdbc:postgresql://postgres:5432/smartpark
ENV DB_USERNAME=smartpark
ENV DB_PASSWORD=smartpark_secret

ENTRYPOINT ["java", "-jar", "app.jar"]
