function createRateLimiter({ windowMs, max, message }) {
    const buckets = new Map()

    const cleanup = setInterval(() => {
        const now = Date.now()
        for (const [key, bucket] of buckets.entries()) {
            if (bucket.resetAt <= now) buckets.delete(key)
        }
    }, Math.min(windowMs, 60_000))
    if (typeof cleanup.unref === 'function') cleanup.unref()

    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown'
        const now = Date.now()
        let bucket = buckets.get(key)

        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs }
            buckets.set(key, bucket)
        }

        bucket.count += 1
        res.setHeader('RateLimit-Limit', String(max))
        res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)))
        res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

        if (bucket.count > max) {
            return res.status(429).json({ success: false, message })
        }

        return next()
    }
}

module.exports = createRateLimiter
