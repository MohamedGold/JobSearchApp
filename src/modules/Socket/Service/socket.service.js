import { authentication } from "../../../middleware/Socket/auth.socket.middleware.js";
import { socketConnection } from "../../../DB/Models/User.model.js";
import { Chat } from "../../../DB/Models/Chat.model.js";
import * as dbService from "../../../DB/db.service.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { getIo } from "../socket.controller.js";




export const registerSocket = async (socket) => {
  const { data, valid } = await authentication({ socket });
  if (!valid) {
    socket.emit("socket_Error", data);
    return;
  }
  socketConnection.set(data.user._id.toString(), socket.id);
};

export const logOutSocketId = async (socket) => {
  socket.on("disconnect", async () => {
    const { data, valid } = await authentication({ socket });
    if (!valid) {
      socket.emit("socket_Error", data);
      return;
    }
    socketConnection.delete(data.user._id.toString());
  });
};

export const sendMessage = async (socket) => {
  socket.on("sendMessage", async (messageData) => {
    const { data, valid } = await authentication({ socket });
    if (!valid) {
      socket.emit("socket_Error", data);
      return;
    }
    const { message, destId } = messageData;
    const senderId = data.user._id;

    const senderName =
      data.user.firstName && data.user.lastName
        ? `${data.user.firstName} ${data.user.lastName}`
        : data.user.username || "Unknown";

    let chat = await dbService.findOne({
      model: Chat,
      filter: {
        $or: [
          { senderId, receiverId: destId },
          { senderId: destId, receiverId: senderId }
        ]
      }
    });

    const newMessage = {
      message,
      senderId,
      createdAt: new Date()
    };

    if (chat) {
      // Update existing chat: push the new message into the messages array
      await dbService.updateOne({
        model: Chat,
        filter: { _id: chat._id },
        data: { $push: { messages: newMessage } }
      });
      // Re-fetch the updated chat to send back the latest state (optional)
      chat = await dbService.findOne({
        model: Chat,
        filter: { _id: chat._id },
        populate: [
          { path: "senderId", select: "firstName lastName profilePic" },
          { path: "receiverId", select: "firstName lastName profilePic" },
          { path: "messages.senderId", select: "firstName lastName profilePic" }
        ]
      });
    } else {
      // Create a new chat document if it doesn't exist
      chat = await dbService.create({
        model: Chat,
        data: {
          senderId,
          receiverId: destId,
          messages: [newMessage]
        }
      });
    }

    const targetSocketId = socketConnection.get(destId.toString());
    if (targetSocketId) {
      getIo().to(targetSocketId).emit("newMessage", { message, senderName, chat });
    }

    socket.emit("successMessage", { message: "Message sent", chat });
  });
};


export const kickUser = async (socket) => {
  socket.on("kickUser", async (data) => {
    // 'data' should include targetUserId and companyId.
    const { targetUserId, companyId } = data;

    // Authenticate the sender via socket
    const { data: authData, valid } = await authentication({ socket });
    if (!valid) {
      socket.emit("socket_Error", authData);
      return;
    }
    const senderId = authData.user._id.toString();

    // Retrieve the company details
    const company = await dbService.findOne({
      model: Company,
      filter: { _id: companyId }
    });
    if (!company) {
      socket.emit("socket_Error", { message: "Company not found", status: 404 });
      return;
    }

    // Check if the sender is the company owner or one of the HRs
    const isOwner = company.createdBy.toString() === senderId;
    const isHR = (company.HRs || []).map(id => id.toString()).includes(senderId);
    if (!isOwner && !isHR) {
      socket.emit("socket_Error", { message: "Not authorized to kick users", status: 403 });
      return;
    }

    // Get the target user's socket id from the socketConnection map
    const targetSocketId = socketConnection.get(targetUserId);
    if (targetSocketId) {
      // Emit a "kicked" event to the target user
      socket.to(targetSocketId).emit("kicked", {
        message: "You have been kicked out by company owner/HR"
      });
    } else {
      socket.emit("socket_Error", { message: "Target user is not connected", status: 404 });
      return;
    }

    getIo().sockets.sockets.get(targetSocketId)?.disconnect();

    socket.emit("successMessage", { message: "User kicked out successfully" });
  });
};



export const jobApplication = async (socket) => {
  socket.on("jobApplication", async (appData) => {
    // Authenticate the socket user
    const { data, valid } = await authentication({ socket });
    if (!valid) {
      socket.emit("socket_Error", data);
      return;
    }
    // Do something with the job application data
    // For instance, confirm receipt or forward to HR

    // Emit back to the sender (or to specific HRs if you have their socket IDs)
    socket.emit("jobApplicationReceived", {
      message: "Application event received by server",
      applicationData: appData,
    });
  });
};
