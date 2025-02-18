import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
} from "../controllers/channelController.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channles", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);

export default channelRoutes;
