const express = require("express");
const { z } = require("zod");

const { verifyToken, checkRole } = require("../middleware/auth");
const { Event } = require("../models/Event");

const eventsRouter = express.Router();

eventsRouter.get("/", verifyToken, async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Vary", "Authorization");

    const filter = {};
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    const events = await Event.find(filter).sort({ date: 1 }).limit(50).lean();
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/", verifyToken, async (req, res, next) => {
  try {
    const schema = z.object({
      eventName: z.string().min(2).max(120),
      category: z.enum(["Workshop", "Seminar", "Hackathon", "Club Activity", "Sports", "Other"]).optional(),
      date: z.string().datetime(),
      location: z.string().max(200).optional(),
      description: z.string().max(2000).optional(),
    });
    const input = schema.parse(req.body);
    const status = req.user.role === "admin" ? "approved" : "pending";

    const event = await Event.create({
      eventName: input.eventName,
      category: input.category || "Other",
      date: new Date(input.date),
      location: input.location || "",
      description: input.description || "",
      createdBy: req.user._id,
      status,
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/register", verifyToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Not found" });
    if (event.status !== "approved" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Event not approved yet" });
    }

    const me = String(req.user._id);
    const already = event.registrations.some((r) => String(r.userId) === me);
    if (!already) {
      event.registrations.push({ userId: req.user._id });
      await event.save();
    }

    res.json({ registered: true, registrationCount: event.registrations.length });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/status", verifyToken, checkRole("admin"), async (req, res, next) => {
  try {
    const schema = z.object({ status: z.enum(["approved", "rejected"]) });
    const { status } = schema.parse(req.body);

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $set: { status } },
      { new: true },
    );
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/reminder", verifyToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Not found" });
    if (event.status !== "approved" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Event not approved yet" });
    }

    const me = String(req.user._id);
    const existingIndex = event.reminders.findIndex((id) => String(id) === me);
    if (existingIndex !== -1) {
      event.reminders.splice(existingIndex, 1);
    } else {
      event.reminders.push(req.user._id);
    }
    await event.save();
    
    res.json({ toggled: true, remindersCount: event.reminders.length });
  } catch (err) {
    next(err);
  }
});

module.exports = { eventsRouter };

