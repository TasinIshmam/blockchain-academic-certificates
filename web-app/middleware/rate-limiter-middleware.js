
const {RateLimiterMemory} = require('rate-limiter-flexible');
const logger = require('../services/logger');


const opts = {
    points: 20, // Each request consumes 1 point.
    duration: 1,
};


const rateLimiter = new RateLimiterMemory(opts);

const rateLimiterMiddlewareInMemory = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch((err) => {
            logger.error("ERROR: Too many request coming in from IP: " + req.ip);
            logger.error(err);
            return res.status(429).send('Too Many Requests');
        });
};


module.exports = {rateLimiterMiddlewareInMemory};
