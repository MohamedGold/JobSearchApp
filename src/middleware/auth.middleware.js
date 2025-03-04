import { decodedToken } from "../utils/security/token.security.js";

export const authentication = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      req.user = await decodedToken({ authorization });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorization = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new Error("Not Authorized", { cause: 403 }));
    }
    next();
  };
};
