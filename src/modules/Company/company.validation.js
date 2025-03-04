import Joi from "joi";

export const companyValidation = {
  addCompany: Joi.object({
    companyName: Joi.string().required(),
    description: Joi.string().optional(),
    industry: Joi.string().optional(),
    address: Joi.string().optional(),
    numberOfEmployees: Joi.string()
      .pattern(/^\d+-\d+$/)
      .required()
      .custom((value, helpers) => {
        const [min, max] = value.split('-').map(Number);
        if (min >= max) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "Employee range validation"),
    companyEmail: Joi.string().email().required(),
    HRs: Joi.array().items(Joi.string()).optional()
  }),


};

export const updateCompany = Joi.object({
  companyId: Joi.string().required(),
  companyName: Joi.string(),
  description: Joi.string().optional(),
  industry: Joi.string().optional(),
  address: Joi.string().optional(),
  numberOfEmployees: Joi.string()
    .pattern(/^\d+-\d+$/)
    .custom((value, helpers) => {
      const [min, max] = value.split('-').map(Number);
      if (min >= max) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "Employee range validation"),
  companyEmail: Joi.string().email(),
  HRs: Joi.array().items(Joi.string()).optional()
});
