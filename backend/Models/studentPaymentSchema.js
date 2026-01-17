const mongoose = require('mongoose');

const studentPaymentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academic_level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationLevel',
    required: true
  },
  
  // Payment Type and Amount Details
  payment_type: {
    type: String,
    enum: ['monthly', 'hourly'],
    required: true
  },
  base_amount: {
    type: Number,
    required: true,
    min: 0
  },

  discount_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isParentPayment: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: ''
  },
  // Monthly Package Details (if payment_type is 'monthly')
  monthly_amount: {
    type: Number,
    min: 0
  },
  total_sessions_per_month: {
    type: Number,
    min: 1
  },

  
  // Validity and Session Limits
  validity_start_date: {
    type: Date,
    required: true
  },
  validity_end_date: {
    type: Date,
    required: true
  },
  


  sessions_remaining: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Status
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Validity Status
  validity_status: {
    type: String,
    enum: ['pending','active', 'expired'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal'],
    default: 'card'
  },
  payment_date: {
    type: Date
  },
  
  // Request Details
  request_date: {
    type: Date,
    default: Date.now
  },
  request_notes: {
    type: String,
    default: ''
  },
  
  // Access Control
  academic_level_paid: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  
  // Additional Details
  currency: {
    type: String,
    default: 'GBP'
  },
  gateway_transaction_id: {
    type: String
  },
  gateway_response: {
    type: Object
  },

  // Renewal tracking fields
  is_renewal: {
    type: Boolean,
    default: false
  },
  original_payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentPayment'
  }

}, { 
  timestamps: true 
});

// Indexes for better performance
studentPaymentSchema.index({ student_id: 1, payment_status: 1 });
studentPaymentSchema.index({ tutor_id: 1, payment_status: 1 });
studentPaymentSchema.index({ subject: 1, academic_level: 1 });
studentPaymentSchema.index({ payment_status: 1, academic_level_paid: 1 });
studentPaymentSchema.index({ validity_end_date: 1, is_active: 1 });
studentPaymentSchema.index({ payment_type: 1, payment_status: 1 });



// Enhanced isValid method for session validation with validity status
studentPaymentSchema.methods.isValid = function() {
  const now = Date.now();

  // Check expiry by date
  const isExpiredByDate = this.validity_end_date ? (new Date(this.validity_end_date).getTime() <= now) : false;
  // Check expiry by sessions exhausted
  const isExhausted = typeof this.sessions_remaining === 'number' && this.sessions_remaining <= 0;

  // If expired by date or exhausted by sessions, ensure status fields reflect that
  if ((isExpiredByDate || isExhausted) && this.validity_status === 'active') {
    this.validity_status = 'expired';
    this.is_active = false;
    this.academic_level_paid = false;
    // Mark payment as expired when exhausted
    if (isExhausted) this.validity_status = 'expired';
    // Persist changes (fire-and-forget to avoid blocking callers)
    try {
      this.save();
    } catch (err) {
      // ignore save errors here; higher-level code can handle consistency
    }
  }

  return this.is_active &&
         this.payment_status === 'paid' &&
         this.validity_status === 'active' &&
         !isExpiredByDate &&
         this.sessions_remaining > 0;
};

// Method to check if payment is expired
studentPaymentSchema.methods.isExpired = function() {
  const now = Date.now();
  return this.validity_end_date ? (new Date(this.validity_end_date).getTime() <= now) : false;
};

// Method to get payment status with validity
studentPaymentSchema.methods.getPaymentStatus = function() {
  if (this.payment_status !== 'paid') {
    return this.payment_status;
  }
  
  if (this.isExpired()) {
    return 'expired';
  }
  
  return 'active';
};

// Ensure payments with zero sessions are marked expired/inactive on save
studentPaymentSchema.pre('save', function(next) {
  try {
    if (typeof this.sessions_remaining === 'number' && this.sessions_remaining <= 0) {
      this.validity_status = 'expired';
      this.is_active = false;
      this.academic_level_paid = false;
      // Optionally set validity_end_date to now if not already expired
      if (!this.validity_end_date || new Date(this.validity_end_date).getTime() > Date.now()) {
        this.validity_end_date = new Date();
      }
    }
  } catch (err) {
    // ignore
  }
  next();
});

module.exports = mongoose.model('StudentPayment', studentPaymentSchema);
