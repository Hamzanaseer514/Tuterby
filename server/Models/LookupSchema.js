const mongoose =  require("mongoose")


const EducationLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
  },
});

const EducationLevel = mongoose.model("EducationLevel", EducationLevelSchema);


const SubjectsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

const Subject = mongoose.model("Subject", SubjectsSchema);
module.exports = {Subject,EducationLevel};