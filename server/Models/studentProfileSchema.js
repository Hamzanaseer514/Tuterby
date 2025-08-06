const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academic_level: {
      type: String,
      default: "",
    },
    learning_goals: {
      type: String,
      default: "",
    },
    preferred_subjects: {
      type: [String],
      default: [],
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: function () {
            return this.role === "student";
          },
        },
        duration: {
          type: String,
          enum: [
            "1-2 hours",
            "3-4 hours",
            "4-5 hours",
            "5-6 hours",
            "6+ hours",
          ],
          required: function () {
            return this.role === "student";
          },
        },
      },
    ],
    // New fields for dashboard functionality
    assignments: [
      {
        title: String,
        description: String,
        subject: String,
        due_date: Date,
        tutor_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: [
      {
        title: String,
        content: String,
        subject: String,
        tutor_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      preferred_session_duration: {
        type: String,
        enum: ["30 minutes", "1 hour", "1.5 hours", "2 hours"],
        default: "1 hour",
      },
      preferred_learning_style: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "reading/writing"],
        default: "visual",
      },
      notification_preferences: {
        email_notifications: { type: Boolean, default: true },
        session_reminders: { type: Boolean, default: true },
        assignment_updates: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
