// GraphQL middleware for validating incoming arguments with a Joi schema
export const graphValidationMiddleware = (schema) => {
  return async (resolve, parent, args, context, info) => {
    const { error } = schema.validate(args);
    if (error) {
      throw new Error("Validation Error: " + error.details[0].message);
    }
    return resolve(parent, args, context, info);
  };
};
