const express = require("express");
const { z } = require("zod");
const { verifyToken } = require("../middleware/auth");
const { Profile } = require("../models/Profile");
const { User } = require("../models/User");

const meRouter = express.Router();

meRouter.get("/", verifyToken, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
});

meRouter.put("/", verifyToken, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(80),
    });
    const input = schema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: input.name } },
      { new: true },
    ).select("_id name email role");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { meRouter };

