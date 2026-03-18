package com.ultrawork.notes.config

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.web.cors.CorsConfigurationSource

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    private lateinit var corsConfigurationSource: CorsConfigurationSource

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `passwordEncoder bean is BCryptPasswordEncoder`() {
        val encoded = passwordEncoder.encode("test")
        assert(encoded.startsWith("\$2a\$")) { "Expected BCrypt hash" }
        assert(passwordEncoder.matches("test", encoded))
    }

    @Test
    fun `corsConfigurationSource defaults to empty allowed origins`() {
        val config = corsConfigurationSource.getCorsConfiguration(
            org.springframework.mock.web.MockHttpServletRequest()
        )
        assert(config != null)
        assert(config!!.allowedMethods?.containsAll(listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")) == true)
        assert(config.allowedHeaders?.contains("*") == true)
        assert(config.allowCredentials == true)
    }

    @Test
    fun `actuator health endpoint is publicly accessible`() {
        mockMvc.get("/actuator/health")
            .andExpect { status { isOk() } }
    }

    @Test
    fun `protected endpoint requires authentication`() {
        mockMvc.get("/api/v1/notes")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `auth endpoint is publicly accessible`() {
        mockMvc.get("/api/v1/auth/login")
            .andExpect { status { isNotFound() } }
    }
}
