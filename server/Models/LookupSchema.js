const mongoose =  require("mongoose")


const EducationLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    trim: true
  },
  hourlyRate: {
    type: Number,
    default:0,
    min: 0
  },
  totalSessionsPerMonth: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number, 
    default: 0,
    min: 0
  },
  monthlyRate: {
    type: Number,
    min: 0
  },
  isTutorCanChangeRate: {
    type: Boolean,
    default: false
  },
  maxSession:{
    type:Number,
    default:0,
    min:0
  },
  minSession:{
    type:Number,
    default:0,
    min:0
  },
});

EducationLevelSchema.pre('save', function (next) {
  const gross = this.hourlyRate * this.totalSessionsPerMonth;
  const discountAmount = (gross * this.discount) / 100;
  this.monthlyRate = gross - discountAmount;
  next();
});
const EducationLevel = mongoose.model("EducationLevel", EducationLevelSchema);


const SubjectsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
    trim: true
  },
});

const Subject = mongoose.model("Subject", SubjectsSchema);
module.exports = {Subject,EducationLevel};