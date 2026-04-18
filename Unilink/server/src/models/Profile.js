const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    age: { type: String, default: "" },
    collegeName: { type: String, default: "" },
    collegeLocation: { type: String, default: "" },
    graduationYear: { type: String, default: "" },
    department: { type: String, default: "" },
    year: { type: String, default: "" },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = { Profile };

