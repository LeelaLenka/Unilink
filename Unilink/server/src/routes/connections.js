const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const { verifyToken } = require("../middleware/auth");
const { ConnectionRequest } = require("../models/ConnectionRequest");
const { User } = require("../models/User");

const connectionsRouter = express.Router();

connectionsRouter.get("/requests/incoming", verifyToken, async (req, res, next) => {
  try {
    const requests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const fromIds = requests.map((r) => r.fromUserId);
    const users = await User.find({ _id: { $in: fromIds } }).select("_id name email");
    const byId = new Map(users.map((u) => [String(u._id), u]));

    res.json({
      requests: requests.map((r) => ({
        ...r,
        fromUser: byId.get(String(r.fromUserId)) || null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

connectionsRouter.post("/request", verifyToken, async (req, res, next) => {
  try {
    const schema = z.object({ toUserId: z.string().min(1) });
    const input = schema.parse(req.body);
    if (!mongoose.isValidObjectId(input.toUserId)) return res.status(400).json({ error: "Invalid toUserId" });
    if (String(input.toUserId) === String(req.user._id)) return res.status(400).json({ error: "Cannot connect to yourself" });

    const toUser = await User.findById(input.toUserId).select("_id");
    if (!toUser) return res.status(404).json({ error: "User not found" });

    await ConnectionRequest.findOneAndUpdate(
      { fromUserId: req.user._id, toUserId: input.toUserId },
      { $setOnInsert: { status: "pending" } },
      { upsert: true, new: true },
    );

    res.status(201).json({ sent: true });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: "Request already exists" });
    next(err);
  }
});

connectionsRouter.post("/requests/:requestId/respond", verifyToken, async (req, res, next) => {
  try {
    const schema = z.object({ action: z.enum(["accept", "reject"]) });
    const input = schema.parse(req.body);

    const request = await ConnectionRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: "Not found" });
    if (String(request.toUserId) !== String(req.user._id)) return res.status(403).json({ error: "Forbidden" });
    if (request.status !== "pending") return res.status(400).json({ error: "Already handled" });

    request.status = input.action === "accept" ? "accepted" : "rejected";
    await request.save();

    res.json({ status: request.status });
  } catch (err) {
    next(err);
  }
});

connectionsRouter.get("/", verifyToken, async (req, res, next) => {
  try {
    const accepted = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const otherIds = accepted.map((r) =>
      String(r.fromUserId) === String(req.user._id) ? r.toUserId : r.fromUserId,
    );
    const users = await User.find({ _id: { $in: otherIds } }).select("_id name email");
    const byId = new Map(users.map((u) => [String(u._id), u]));

    res.json({
      connections: otherIds.map((id) => byId.get(String(id))).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { connectionsRouter };

