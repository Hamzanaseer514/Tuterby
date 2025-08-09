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
        },
      },
    ],
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentProfile",
      default: null,
    },
    // Array of tutors with status
    hired_tutors: [
      {
        tutor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TutorProfile",
          default: null,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        hired_at: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
