package authservice.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class TokenBlocklistService {

    private static final String BLOCKLIST_PREFIX = "blocklist:";

    private final StringRedisTemplate redisTemplate;

    public TokenBlocklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Adds the token to the blocklist with a TTL equal to its remaining valid lifetime.
     * Once the JWT would have expired naturally, the Redis key auto-expires too.
     */
    public void blockToken(String token, Date expiryDate) {
        long ttlMs = expiryDate.getTime() - System.currentTimeMillis();
        if (ttlMs > 0) {
            redisTemplate.opsForValue().set(
                    BLOCKLIST_PREFIX + token, "1", ttlMs, TimeUnit.MILLISECONDS);
        }
    }

    public boolean isBlocked(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLOCKLIST_PREFIX + token));
    }
}
