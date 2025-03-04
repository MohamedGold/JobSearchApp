import * as dbService from "../../../DB/db.service.js";
import { Chat } from "../../../DB/Models/Chat.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const getChatHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const chat = await dbService.findOne({
    model: Chat,
    filter: {
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    },
    populate: [
      { path: "senderId", select: "firstName lastName profilePic" },
      { path: "receiverId", select: "firstName lastName profilePic" },
      { path: "messages.senderId", select: "firstName lastName profilePic" }
    ]
  });
  return successResponse({ res, data: chat });
});
