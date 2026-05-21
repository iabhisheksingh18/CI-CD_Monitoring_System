# Stage 1: Build the Java Application
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app
# Copy pom.xml and download dependencies to cache them
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the execution image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Expose port 8080
EXPOSE 8080

# Copy the generated JAR file
COPY --from=build /app/target/*.jar app.jar

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]

