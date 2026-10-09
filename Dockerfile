# Estágio 1: Build com Maven e Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache das dependências
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia código-fonte e compila gerando o JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final leve de execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]