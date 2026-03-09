# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew

# Pre-download dependencies so this layer is cached when only source changes
RUN ./gradlew dependencies --no-daemon -Dorg.gradle.java.installations.auto-download=false 2>/dev/null || true

COPY src src

RUN ./gradlew bootJar -x test --no-daemon -Dorg.gradle.java.installations.auto-download=false

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
