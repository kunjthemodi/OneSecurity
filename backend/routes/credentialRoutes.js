const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const credentialsController = require('../controllers/credentialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET all
router.get('/', credentialsController.getCredentials);

// Create
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      website: Joi.string().uri().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  credentialsController.createCredential
);

// Update
router.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ id: Joi.number().integer().required() }),
    [Segments.BODY]: Joi.object().keys({
      website: Joi.string().uri().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  credentialsController.updateCredential
);

// Delete
router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ id: Joi.number().integer().required() }),
  }),
  credentialsController.deleteCredential
);

module.exports = router;
