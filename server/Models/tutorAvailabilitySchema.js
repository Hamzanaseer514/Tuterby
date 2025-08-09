// const mongoose = require('mongoose');

// // Schema for recurring availability (e.g., every Monday 3-5pm)
// const recurringAvailabilitySchema = new mongoose.Schema({
//   day_of_week: {
//     type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
//     required: true,
//     min: 0,
//     max: 6
//   },
//   start_time: {
//     type: String, // Format: "HH:MM" (24-hour)
//     required: true,
//     match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
//   },
//   end_time: {
//     type: String, // Format: "HH:MM" (24-hour)
//     required: true,
//     match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   }
// });



// // Schema for blackout dates (when tutor is unavailable)
// const blackoutDateSchema = new mongoose.Schema({
//   start_date: {
//     type: Date,
//     required: true
//   },
//   end_date: {
//     type: Date,
//     required: true
//   },
//   reason: {
//     type: String,
//     default: ''
//   },
//   is_active: {
//     type: Boolean,
//     default: true
//   }
// });

// // Main availability schema
// const tutorAvailabilitySchema = new mongoose.Schema({
//   tutor_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'TutorProfile',
//     required: true,
//     unique: true
//   },
//   // General availability settings
//   general_availability: {
//     monday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
//     tuesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
//     wednesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
//     thursday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
//     friday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
//     saturday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: false } },
//     sunday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: false } }
//   },
//   // Minimum notice period (in hours) before a session can be booked
//   minimum_notice_hours: {
//     type: Number,
//     default: 2,
//     min: 0
//   },
//   // Maximum booking advance (in days) for sessions
//   maximum_advance_days: {
//     type: Number,
//     default: 30,
//     min: 1
//   },
//   // Session duration options (in minutes)
//   session_durations: {
//     type: [Number],
//     default: [30, 60, 90, 120], // 30min, 1hr, 1.5hr, 2hr
//     validate: {
//       validator: function(v) {
//         return v.length > 0 && v.every(duration => duration > 0 && duration <= 480); // Max 8 hours
//       },
//       message: 'Session durations must be positive and not exceed 8 hours'
//     }
//   },

//   // Blackout dates
//   blackout_dates: [blackoutDateSchema],
//   // Whether the tutor is currently accepting bookings
//   is_accepting_bookings: {
//     type: Boolean,
//     default: true
//   }
// }, { timestamps: true });

// // Index for efficient queries
// tutorAvailabilitySchema.index({ tutor_id: 1 });
// tutorAvailabilitySchema.index({ 'blackout_dates.start_date': 1, 'blackout_dates.end_date': 1 });

// // Method to check if a specific date/time is available
// tutorAvailabilitySchema.methods.isAvailable = function(date, durationMinutes = 60) {
//   const checkDate = new Date(date);
//   const dayOfWeek = checkDate.getDay();
//   const timeString = checkDate.toTimeString().slice(0, 5); // "HH:MM" format
  

  
  
//   // Check if tutor is accepting bookings
//   if (!this.is_accepting_bookings) {
//     return false;
//   }
  
//   // Check blackout dates
//   const isBlackedOut = this.blackout_dates.some(blackout => 
//     blackout.is_active &&
//     checkDate >= blackout.start_date &&
//     checkDate <= blackout.end_date
//   );
  
//   if (isBlackedOut) {
//     console.log('❌ Date is blacked out');
//     return false;
//   }
  
//   // Check general availability for the day
//   const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//   const dayAvailability = this.general_availability[dayNames[dayOfWeek]];

  
//   if (!dayAvailability.available) {
//     return false;
//   }
  
//   // Check if time falls within general availability hours
//   console.log('Time check:', timeString, '>=', dayAvailability.start, '&&', timeString, '<=', dayAvailability.end);
//   if (timeString < dayAvailability.start || timeString > dayAvailability.end) {
//     return false;
//   }
  

  

//   return true;
// };

// // Method to get available slots for a specific date
// tutorAvailabilitySchema.methods.getAvailableSlots = function(date, durationMinutes = 60) {
//   const checkDate = new Date(date);
//   const dayOfWeek = checkDate.getDay();
//   const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//   const dayAvailability = this.general_availability[dayNames[dayOfWeek]];
  
//   if (!dayAvailability.available) {
//     return [];
//   }
  
//   const slots = [];
//   const startTime = new Date(`2000-01-01T${dayAvailability.start}:00`);
//   const endTime = new Date(`2000-01-01T${dayAvailability.end}:00`);
  
//   // Generate slots based on session durations
//   this.session_durations.forEach(duration => {
//     let currentTime = new Date(startTime);
    
//     while (currentTime < endTime) {
//       const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
//       if (slotEnd <= endTime) {
//         const slotDate = new Date(checkDate);
//         slotDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
        
//         // Check if this specific slot is available
//         if (this.isAvailable(slotDate, duration)) {
//           slots.push({
//             start: slotDate,
//             end: new Date(slotDate.getTime() + duration * 60000),
//             duration: duration
//           });
//         }
//       }
      
//       currentTime = new Date(currentTime.getTime() + 30 * 60000); // Move by 30 minutes
//     }
//   });
  
//   return slots;
// };

// module.exports = mongoose.model('TutorAvailability', tutorAvailabilitySchema); 

const mongoose = require('mongoose');

// Schema for blackout dates (when tutor is unavailable)
const blackoutDateSchema = new mongoose.Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  reason: { type: String, default: '' },
  is_active: { type: Boolean, default: true }
});

// Main availability schema
const tutorAvailabilitySchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile',
    required: true,
    unique: true
  },

  // General availability (per weekday)
  general_availability: {
    monday:    { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
    tuesday:   { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
    wednesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
    thursday:  { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
    friday:    { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: true } },
    saturday:  { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: false } },
    sunday:    { start: { type: String, default: "09:00" }, end: { type: String, default: "17:00" }, available: { type: Boolean, default: false } }
  },

  // Booking rules
  minimum_notice_hours: { type: Number, default: 2, min: 0 },
  maximum_advance_days: { type: Number, default: 30, min: 1 },

  // Session duration options (in minutes)
  session_durations: {
    type: [Number],
    default: [30, 60, 90, 120],
    validate: {
      validator: function (v) {
        return v.length > 0 && v.every(d => d > 0 && d <= 480);
      },
      message: 'Session durations must be positive and ≤ 8 hours'
    }
  },

  // Blackout dates
  blackout_dates: [blackoutDateSchema],

  // Whether the tutor is accepting bookings
  is_accepting_bookings: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
// tutorAvailabilitySchema.index({ tutor_id: 1 });
tutorAvailabilitySchema.index({ 'blackout_dates.start_date': 1, 'blackout_dates.end_date': 1 });

// Method to check if a specific date/time is available
tutorAvailabilitySchema.methods.isAvailable = function (date, durationMinutes = 60) {
  const checkDate = new Date(date);
  const dayOfWeek = checkDate.getDay();
  const timeString = checkDate.toTimeString().slice(0, 5); // "HH:MM"

  // 1. Accepting bookings?
  if (!this.is_accepting_bookings) return false;

  // 2. Check blackout dates
  if (this.blackout_dates.some(b =>
    b.is_active &&
    checkDate >= b.start_date &&
    checkDate <= b.end_date
  )) return false;

  // 3. Get day availability
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayAvailability = this.general_availability[dayNames[dayOfWeek]];
  if (!dayAvailability?.available) return false;

  // 4. Check time within availability window
  if (timeString < dayAvailability.start || timeString > dayAvailability.end) return false;

  return true;
};

// Method to get all available slots for a specific day
tutorAvailabilitySchema.methods.getAvailableSlots = function (date) {
  const checkDate = new Date(date);
  const dayOfWeek = checkDate.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayAvailability = this.general_availability[dayNames[dayOfWeek]];

  if (!dayAvailability?.available) return [];

  const slots = [];
  const startTime = new Date(`2000-01-01T${dayAvailability.start}:00`);
  const endTime = new Date(`2000-01-01T${dayAvailability.end}:00`);

  this.session_durations.forEach(duration => {
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);

      if (slotEnd <= endTime) {
        const slotDate = new Date(checkDate);
        slotDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);

        if (this.isAvailable(slotDate, duration)) {
          slots.push({
            start: slotDate,
            end: new Date(slotDate.getTime() + duration * 60000),
            duration
          });
        }
      }
      currentTime = new Date(currentTime.getTime() + 30 * 60000); // step 30 mins
    }
  });

  return slots;
};

module.exports = mongoose.model('TutorAvailability', tutorAvailabilitySchema);
