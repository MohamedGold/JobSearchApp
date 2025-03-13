import jwt from 'jsonwebtoken';
import * as dbService from '../../DB/db.service.js';
import { User } from '../../DB/Models/User.model.js';

const checkAdmin = async (token) => {
  // Ensure the token starts with "System "
  if (!token.startsWith("System ")) {
    throw new Error("Admin only");
  }
  // Remove the "System " prefix to get the actual token
  const realToken = token.replace("System ", "");

  // Verify the token using the admin access token secret
  let decoded;
  try {
    decoded = jwt.verify(realToken, process.env.ADMIN_ACCESS_TOKEN);
  } catch (err) {
    throw new Error("Invalid token");
  }

  if (!decoded?.id) {
    throw new Error("Invalid token payload");
  }

  // Retrieve the user from the database using the decoded id
  const user = await dbService.findOne({
    model: User,
    filter: { _id: decoded.id }
  });

  if (!user || user.role.toLowerCase() !== "admin") {
    throw new Error("Admin only");
  }
};

export default checkAdmin;
