import Joi from 'joi';

export const envConfig = () => ({
  port: parseInt(process.env.PORT, 10),
});

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().required(),
});
