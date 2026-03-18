package com.ultrawork.notes.config

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertInstanceOf
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.cache.CacheManager
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.StringRedisSerializer
import java.time.Duration

class RedisConfigTest {

    private val objectMapper = ObjectMapper().findAndRegisterModules()
    private val connectionFactory = LettuceConnectionFactory()

    private val config = RedisConfig().apply {
        defaultTtl = Duration.parse("PT1H")
        keyPrefix = "notes:"
    }

    @Test
    fun `redisTemplate uses StringRedisSerializer for keys`() {
        val template = config.redisTemplate(connectionFactory, objectMapper)
        assertInstanceOf(StringRedisSerializer::class.java, template.keySerializer)
    }

    @Test
    fun `redisTemplate uses GenericJackson2JsonRedisSerializer for values`() {
        val template = config.redisTemplate(connectionFactory, objectMapper)
        assertInstanceOf(GenericJackson2JsonRedisSerializer::class.java, template.valueSerializer)
    }

    @Test
    fun `redisTemplate uses StringRedisSerializer for hash keys`() {
        val template = config.redisTemplate(connectionFactory, objectMapper)
        assertInstanceOf(StringRedisSerializer::class.java, template.hashKeySerializer)
    }

    @Test
    fun `redisTemplate uses GenericJackson2JsonRedisSerializer for hash values`() {
        val template = config.redisTemplate(connectionFactory, objectMapper)
        assertInstanceOf(GenericJackson2JsonRedisSerializer::class.java, template.hashValueSerializer)
    }

    @Test
    fun `cacheManager is RedisCacheManager`() {
        val cacheManager = config.cacheManager(connectionFactory, objectMapper)
        assertInstanceOf(RedisCacheManager::class.java, cacheManager)
    }

    @Test
    fun `cacheManager is not null`() {
        val cacheManager = config.cacheManager(connectionFactory, objectMapper)
        assertNotNull(cacheManager)
    }

    @Test
    fun `cacheManager works with custom TTL and prefix`() {
        val customConfig = RedisConfig().apply {
            defaultTtl = Duration.parse("PT30M")
            keyPrefix = "custom:"
        }
        val cacheManager = customConfig.cacheManager(connectionFactory, objectMapper)
        assertInstanceOf(RedisCacheManager::class.java, cacheManager)
    }
}
