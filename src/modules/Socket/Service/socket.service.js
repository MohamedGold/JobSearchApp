import { authentication } from "../../../middleware/Socket/auth.socket.middleware.js";
import { socketConnection } from "../../../DB/Models/User.model.js";

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
    socket.emit("successMessage", { message });
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
