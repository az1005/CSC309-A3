function requireClearance(minimumRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const rolesOrder = {
            regular: 1,
            cashier: 2,
            manager: 3,
            superuser: 4,
        };

        if (rolesOrder[req.user.role] < rolesOrder[minimumRole]) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
}

const rateLimitMap = {};

function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    // use a mapping between IP addresses and last time we ran
    // this function
    if (rateLimitMap[ip] && now - rateLimitMap[ip] < 60000) {
        // 60 000 ms = 60 seconds
        return res.status(429).json({ error: 'Too Many Requests' });
    }

    // record the timestamp for this IP only if we return a success
    // listen for when the response finishes
    res.on('finish', () => {
        if (res.statusCode === 202) {
            rateLimitMap[ip] = now;
        }
    });
    next();
}

module.exports = { requireClearance, rateLimiter };