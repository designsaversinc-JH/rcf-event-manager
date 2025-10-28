const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    message: 'Validation failed',
    details: errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    })),
  });
};

module.exports = validateRequest;
