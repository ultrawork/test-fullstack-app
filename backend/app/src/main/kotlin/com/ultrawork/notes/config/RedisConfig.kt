package com.ultrawork.notes.config

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer
import java.time.Duration

/**
 * Redis configuration for caching and template operations.
 *
 * Provides [RedisTemplate] with JSON serialization and [CacheManager]
 * with configurable TTL and key prefix.
 */
@Configuration
@EnableCaching
class RedisConfig {

    @Value("\${app.cache.default-ttl:PT1H}")
    lateinit var defaultTtl: Duration

    @Value("\${app.cache.key-prefix:notes:}")
    lateinit var keyPrefix: String

    /**
     * Configures [RedisTemplate] with [StringRedisSerializer] for keys
     * and [GenericJackson2JsonRedisSerializer] for values.
     */
    @Bean
    fun redisTemplate(
        connectionFactory: RedisConnectionFactory,
        objectMapper: ObjectMapper,
    ): RedisTemplate<String, Any> {
        val jsonSerializer = GenericJackson2JsonRedisSerializer(objectMapper)
        val stringSerializer = StringRedisSerializer()

        return RedisTemplate<String, Any>().apply {
            this.connectionFactory = connectionFactory
            keySerializer = stringSerializer
            valueSerializer = jsonSerializer
            hashKeySerializer = stringSerializer
            hashValueSerializer = jsonSerializer
            afterPropertiesSet()
        }
    }

    /**
     * Configures [RedisCacheManager] with TTL from `app.cache.default-ttl`
     * and key prefix from `app.cache.key-prefix`.
     */
    @Bean
    fun cacheManager(
        connectionFactory: RedisConnectionFactory,
        objectMapper: ObjectMapper,
    ): CacheManager {
        val jsonSerializer = GenericJackson2JsonRedisSerializer(objectMapper)

        val cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(defaultTtl)
            .prefixCacheNameWith(keyPrefix)
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)
            )

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(cacheConfig)
            .build()
    }
}
