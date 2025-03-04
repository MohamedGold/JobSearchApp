import { Router } from "express";
import * as chatService from "./Services/chat.service.js";
import { authentication } from "../../Middleware/auth.middleware.js";

const chatController = Router();

// Get chat history with a specific user
chatController.get('/:userId', authentication(), chatService.getChatHistory);

export default chatController;
