# Use official OpenJDK image with Maven for building Java
FROM maven:3.9-eclipse-temurin-17 AS java-builder

WORKDIR /app/java-utils

# Copy pom.xml first for better layer caching
COPY java-utils/pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy Java source files
COPY java-utils/src ./src

# Build the JAR file
RUN mvn clean package -DskipTests -B

# Use Node.js for TypeScript and runtime
FROM node:20-slim AS node-builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    maven \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* tsconfig.json ./

# Install Node.js dependencies
RUN npm ci

# Copy source files
COPY src ./src

# Copy built JAR from java-builder
COPY --from=java-builder /app/java-utils/target/sm2-service-1.0.0.jar ./java-utils/target/

# Build TypeScript
RUN npm run build:typescript

# Final runtime image
FROM node:20-slim

WORKDIR /app

# Install Java runtime only (no JDK/Maven needed at runtime)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install production dependencies only (if any)
RUN npm ci --only=production || npm install --production

# Copy built files
COPY --from=node-builder /app/lib ./lib
COPY --from=java-builder /app/java-utils/target/sm2-service-1.0.0.jar ./java-utils/target/

# Set working directory
WORKDIR /app

# Expose port if your application needs it (optional)
# EXPOSE 3000

# Default command - can be overridden
CMD ["node", "lib/index.js"]

