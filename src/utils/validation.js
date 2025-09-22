const Joi = require('joi');

const schemas = {
  customerId: Joi.number().integer().positive().required(),
  loanId: Joi.number().integer().positive().required(),
  customerSearch: Joi.object({
    search: Joi.string().min(1).max(100),
    limit: Joi.number().integer().min(1).max(100).default(50)
  }),
  loanFilter: Joi.object({
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'DEFAULTED').insensitive(),
    customerId: Joi.number().integer().positive(),
    limit: Joi.number().integer().min(1).max(100).default(50)
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query || req.params || req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

const validateParams = (paramName) => {
  return (req, res, next) => {
    const schema = schemas[paramName];
    if (!schema) {
      return next();
    }
    
    const { error } = schema.validate(req.params[paramName.replace('Id', '')]);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameter',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateParams
};