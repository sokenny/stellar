import rateLimit from 'express-rate-limit';

const generalRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after some time',
  standardHeaders: true,
  legacyHeaders: false,
});

export default generalRequestLimiter;
