const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const EventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    category: { type: String, enum: ["Workshop", "Seminar", "Hackathon", "Club Activity", "Sports", "Other"], default: "Other" },
    date: { type: Date, required: true },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    registrations: { type: [RegistrationSchema], default: [] },
    reminders: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };

