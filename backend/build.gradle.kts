plugins {
    kotlin("jvm") version "1.9.23"
}

group = "com.ultrawork"
version = "0.1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
