package com.ultrawork.notes.config

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.env.Environment
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringBootTest
@ActiveProfiles("test")
class ApplicationConfigTest {

    @Autowired
    private lateinit var environment: Environment

    @Value("\${app.cors.allowed-origins}")
    private lateinit var corsAllowedOrigins: String

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    @Value("\${app.jwt.access-token-expiration}")
    private var accessTokenExpiration: Long = 0

    @Value("\${app.jwt.refresh-token-expiration}")
    private var refreshTokenExpiration: Long = 0

    @Value("\${app.cache.ttl}")
    private var cacheTtl: Long = 0

    @Test
    fun `context loads with application config`() {
        assertNotNull(environment)
    }

    @Test
    fun `server port is configured`() {
        assertNotNull(environment.getProperty("server.port"))
    }

    @Test
    fun `datasource properties are configured`() {
        assertNotNull(environment.getProperty("spring.datasource.url"))
        assertNotNull(environment.getProperty("spring.datasource.username"))
        assertNotNull(environment.getProperty("spring.datasource.driver-class-name"))
    }

    @Test
    fun `jpa properties are configured`() {
        assertNotNull(environment.getProperty("spring.jpa.hibernate.ddl-auto"))
        assertEquals("false", environment.getProperty("spring.jpa.open-in-view"))
    }

    @Test
    fun `flyway properties are configured`() {
        assertNotNull(environment.getProperty("spring.flyway.enabled"))
    }

    @Test
    fun `redis properties are configured`() {
        assertNotNull(environment.getProperty("spring.data.redis.host"))
        assertNotNull(environment.getProperty("spring.data.redis.port"))
    }

    @Test
    fun `cache type is configured`() {
        assertNotNull(environment.getProperty("spring.cache.type"))
    }

    @Test
    fun `management endpoints are configured`() {
        assertNotNull(environment.getProperty("management.endpoints.web.exposure.include"))
        assertNotNull(environment.getProperty("management.endpoint.health.show-details"))
    }

    @Test
    fun `app cors properties are configured`() {
        assertEquals("http://localhost:3000", corsAllowedOrigins)
    }

    @Test
    fun `app jwt properties are configured`() {
        assertNotNull(jwtSecret)
        assertEquals(900000L, accessTokenExpiration)
        assertEquals(604800000L, refreshTokenExpiration)
    }

    @Test
    fun `app cache ttl is configured`() {
        assertEquals(3600L, cacheTtl)
    }

    @Test
    fun `springdoc properties are defined in main config`() {
        assertNotNull(environment.getProperty("springdoc.api-docs.path"))
        assertNotNull(environment.getProperty("springdoc.swagger-ui.path"))
    }
}
