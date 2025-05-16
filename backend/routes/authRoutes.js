// backend/routes/authRoutes.js
const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const cookieParser = require('cookie-parser');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware
router.use(express.json());
router.use(cookieParser());

// Public routes
router.post(
  '/register',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  authController.register
);
router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  authController.login
);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(authMiddleware);
router.post(
  '/change-password',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required(),
    }),
  }),
  authController.changePassword
);
router.get('/totp-status', authController.totpStatus);
router.post('/totp-enable', authController.totpEnable);
router.post(
  '/totp-verify',
  celebrate({
    [Segments.BODY]: Joi.object().keys({ code: Joi.string().length(6).required() }),
  }),
  authController.totpVerify
);
router.post(
  '/totp-disable',
  celebrate({
    [Segments.BODY]: Joi.object().keys({ code: Joi.string().length(6).required() }),
  }),
  authController.totpDisable
);

module.exports = router;