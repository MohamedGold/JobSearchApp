// GraphQL middleware to check for authentication
export const graphAuthMiddleware = (resolve, parent, args, context, info) => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
  return resolve(parent, args, context, info);
};
