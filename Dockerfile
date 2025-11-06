# ========= Build stage =========
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# Copy entire context (optimized by .dockerignore) and build
COPY . .
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

# ========= Run stage =========
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy fat jar
COPY --from=build /workspace/target/*.jar /app/app.jar

# Health + port
ENV PORT=8081
EXPOSE 8081

# JVM ergonomics
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

