import jwt from 'jsonwebtoken';
import { User } from '../../DB/Models/User.model.js';
import * as dbService from '../../DB/db.service.js';

export const tokenTypes = {
  access: "access",
  refresh: "refresh"
};

export const generateToken = ({ payload = {}, signature = process.env.USER_ACCESS_TOKEN, expiresIn = process.env.EXPIRESIN } = {}) => {
  return jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn) });
};

export const verifyToken = ({ token, signature = process.env.USER_ACCESS_TOKEN } = {}) => {
  return jwt.verify(token, signature);
};

export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access, next = () => { } } = {}) => {
  const [bearer, token] = authorization?.split(' ') || [];
  if (!bearer || !token) {
    throw new Error("Missing token");
  }
  let access_signature = '', refresh_signature = '';
  switch (bearer) {
    case "System":
      access_signature = process.env.ADMIN_ACCESS_TOKEN;
      refresh_signature = process.env.ADMIN_REFRESH_TOKEN;
      break;
    case "Bearer":
      access_signature = process.env.USER_ACCESS_TOKEN;
      refresh_signature = process.env.USER_REFRESH_TOKEN;
      break;
    default:
      throw new Error("Invalid Bearer type");
  }
  const decoded = verifyToken({ token, signature: tokenType === tokenTypes.access ? access_signature : refresh_signature });
  if (!decoded?.id) {
    throw new Error("Invalid token payload");
  }
  const user = await dbService.findOne({
    model: User, filter: {
      _id: decoded.id,
      deletedAt: { $exists: false },
      bannedAt: { $exists: false}
    }
  });
  if (!user) {
    throw new Error("User not found or deleted or banned");
  }
  if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
    throw new Error("Invalid refresh token. Please log in again");
  }
  return user;
};
