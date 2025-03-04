import Joi from "joi";

export const jobValidation = {
  addJob: Joi.object({
    jobTitle: Joi.string().required(),
    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid").required(),
    workingTime: Joi.string().valid("part-time", "full-time").required(),
    seniorityLevel: Joi.string().valid("fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO").required(),
    jobDescription: Joi.string().required(),
    technicalSkills: Joi.array().items(Joi.string()),
    softSkills: Joi.array().items(Joi.string()),
    companyId: Joi.string().required()
  }),

  updateJob: Joi.object({
    jobId: Joi.string().required(),
    jobTitle: Joi.string(),
    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid"),
    workingTime: Joi.string().valid("part-time", "full-time"),
    seniorityLevel: Joi.string().valid("fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"),
    jobDescription: Joi.string(),
    technicalSkills: Joi.array().items(Joi.string()),
    softSkills: Joi.array().items(Joi.string()),
    companyId: Joi.string()
  }),

  reviewApplication: Joi.object({
    status: Joi.string()
      .valid("accepted", "in consideration", "rejected")
      .default("viewed"),

    jobId: Joi.string().required(),
    applicationId: Joi.string().required(),
  })
};

