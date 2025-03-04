import { Router } from "express";
import * as jobService from "./Services/job.service.js";
import * as validators from "./job.validation.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js";

const jobController = Router();

// Add Job
jobController.post('/', authentication(), validation(validators.jobValidation.addJob), jobService.addJob);

// Update Job
jobController.patch('/:jobId', authentication(), validation(validators.jobValidation.updateJob), jobService.updateJob);

// Delete Job
jobController.delete('/:jobId', authentication(), jobService.deleteJob);

// Get all Jobs or filter by company (with pagination)
jobController.get('/', authentication(), jobService.getJobs);

// Get Jobs with filters
jobController.get('/search', authentication(), jobService.searchJobs);

// Get all applications for a specific Job
jobController.get('/:jobId/applications', authentication(), jobService.getJobApplications);

// Apply to Job
jobController.post('/:jobId/apply',
  authentication(),
  uploadCloudFile(fileValidations.document).single("cv"),
  jobService.applyToJob);

// Accept or Reject an Applicant
jobController.patch('/:jobId/applications/:applicationId', authentication(), validation(validators.jobValidation.reviewApplication), jobService.reviewApplication);

export default jobController;
