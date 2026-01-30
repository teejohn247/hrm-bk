import { body, validationResult } from 'express-validator';

const userValidationRules = () => {
  return [
    // username must be an email
    body('firstName').isString().notEmpty().withMessage("First Name field is a required field"),
    // body('email').isEmail().withMessage("Email is a required field"),
    body('personalEmail').isEmail().withMessage("Personal Name is a required field"),
    body('dateOfBirth').notEmpty().withMessage("Date of Birth field is a required field"),
    body('phoneNumber').notEmpty().withMessage("Phone number field is a required field"),
    body('gender').notEmpty().withMessage("Gender field is a required field"),
    body('role').notEmpty().withMessage("Role field is a required field"),
    body('department').notEmpty().withMessage("Department field is a required field"),

  
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  userValidationRules,
  validate,
}