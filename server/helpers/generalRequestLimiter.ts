import rateLimit from 'express-rate-limit';

const maxRequests = process.env.NODE_ENV === 'development' ? 1000 : 200;

const generalRequestLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again after some time',
  standardHeaders: true,
  legacyHeaders: false,
});

export default generalRequestLimiter;
