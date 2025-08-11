const mongoose =  require("mongoose")


const EducationLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
  },
});

const EducationLevel = mongoose.model("EducationLevel", EducationLevelSchema);
module.exports = EducationLevel;
