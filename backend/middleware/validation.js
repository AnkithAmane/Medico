const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      statusCode: 400,
    });
  }
  next();
};

const authValidation = {
  register: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('contact').matches(/^[0-9]{10}$|^\+91[0-9]{10}$/).withMessage('Valid phone number required'),
    validate,
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
};

const patientValidation = {
  update: [
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be 0-150'),
    body('height').optional().isFloat({ min: 0 }).withMessage('Height must be positive'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood group'),
    validate,
  ],
};

const appointmentValidation = {
  book: [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
    validate,
  ],
};

const cartValidation = {
  addToCart: [
    body('itemType').isIn(['medicine', 'test']).withMessage('Invalid item type'),
    body('itemId').notEmpty().withMessage('Item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
  ],
};

const orderValidation = {
  create: [
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
    validate,
  ],
};

module.exports = { authValidation, patientValidation, appointmentValidation, cartValidation, orderValidation };
