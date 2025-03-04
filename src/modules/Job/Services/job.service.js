import * as dbService from "../../../DB/db.service.js";
import { Job } from "../../../DB/Models/Job.model.js";
import { Application } from "../../../DB/Models/Application.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { getIo } from "../../../modules/Socket/socket.controller.js";
import { sendEmail } from "../../../utils/email/send.email.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { paginate } from "../../../utils/pagination.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";





export const addJob = asyncHandler(async (req, res, next) => {

  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, companyId } = req.body;

  // Find the company to validate authorization
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Check if the requester is the company owner or one of the HRs
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = company.HRs && company.HRs.map(id => id.toString()).includes(req.user._id.toString());
  if (!isOwner && !isHR) {
    return next(new Error("Not authorized. Only company owner or HR can add a job", { cause: 403 }));
  }

  const job = await dbService.create({
    model: Job,
    data: {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy: req.user._id,
      companyId
    }
  });

  return successResponse({ res, status: 201, data: job });

});


export const updateJob = asyncHandler(async (req, res, next) => {

  const { jobId } = req.params;
  const job = await dbService.findOne({ model: Job, filter: { _id: jobId } });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  // Find the company associated with the job
  const company = await dbService.findOne({ model: Company, filter: { _id: job.companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Check if the current user is the company owner
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("Not authorized. Only the company owner can update the job", { cause: 403 }));
  }


  // If companyId is being updated, verify the new company exists and is owned by the same user
  if (req.body.companyId) {
    const newCompany = await dbService.findOne({ model: Company, filter: { _id: req.body.companyId } });
    if (!newCompany) {
      return next(new Error("The provided companyId does not exist", { cause: 404 }));
    }
    if (newCompany.createdBy.toString() !== req.user._id.toString()) {
      return next(new Error("Not authorized. The provided companyId does not belong to you", { cause: 403 }));
    }
  }

  const updatedJob = await dbService.findOneAndUpdate({
    model: Job,
    filter: { _id: jobId },
    data: req.body,
    option: { new: true }
  });

  return successResponse({ res, data: updatedJob });

});



export const deleteJob = asyncHandler(async (req, res, next) => {

  const { jobId } = req.params;
  // Find the job
  const job = await dbService.findOne({ model: Job, filter: { _id: jobId } });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  // Find the company associated with the job
  const company = await dbService.findOne({ model: Company, filter: { _id: job.companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Check if the logged-in user is one of the HRs for the company
  const isHR = company.HRs && company.HRs.map(id => id.toString()).includes(req.user._id.toString());
  if (!isHR) {
    return next(new Error("Not authorized. Only company HR can delete the job", { cause: 403 }));
  }

  if (job.deletedAt) {
    return next(new Error("Job has already been deleted", { cause: 409 }));
  }

  // Soft delete the job by setting the deletedAt field
  const deletedJob = await dbService.findOneAndUpdate({
    model: Job,
    filter: { _id: jobId },
    data: { deletedAt: new Date() },
    option: { new: true }
  });

  return successResponse({ res, data: { message: "Job deleted", job: deletedJob } });

});


export const getJobs = asyncHandler(async (req, res, next) => {

  const { companyId, companyName, page, size, sort } = req.query;
  let filter = { deletedAt: { $exists: false } };

  // If companyId is provided, use it; otherwise, if companyName is provided, look up the company
  if (companyId) {
    filter.companyId = companyId;
  } else if (companyName) {
    const company = await dbService.findOne({
      model: Company,
      filter: { companyName: new RegExp(companyName, 'i') }
    });
    if (company) {
      filter.companyId = company._id;
    } else {
      // If no company matches the given name, return an empty result set
      return successResponse({
        res,
        data: { data: [], page: 1, size: parseInt(size) || parseInt(process.env.SIZE), count: 0 }
      });
    }
  }

  // Default sorting by createdAt descending if sort is not provided
  const sortOption = sort ? JSON.parse(sort) : { createdAt: -1 };

  const data = await paginate({ page, size, model: Job, filter, sort: sortOption });
  return successResponse({ res, data });

});



export const searchJobs = asyncHandler(async (req, res, next) => {

  const { jobTitle, workingTime, jobLocation, seniorityLevel, technicalSkills, page, size, sort } = req.query;
  let filter = { deletedAt: { $exists: false } };

  // Filter by job title (case-insensitive)
  if (jobTitle) filter.jobTitle = new RegExp(jobTitle, 'i');
  // Filter by working time
  if (workingTime) filter.workingTime = workingTime;
  // Filter by job location
  if (jobLocation) filter.jobLocation = jobLocation;
  // Filter by seniority level
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  // Filter by technical skills (expects comma separated values)
  if (technicalSkills)
    filter.technicalSkills = { $in: technicalSkills.split(',').map(s => s.trim()) };

  // Set default sort by createdAt descending if not provided; sort should be a JSON string if provided.
  const sortOption = sort ? JSON.parse(sort) : { createdAt: -1 };

  // Use pagination to get jobs with skip, limit, sort, and total count
  const data = await paginate({ page, size, model: Job, filter, sort: sortOption });
  return successResponse({ res, data });

});


export const getJobApplications = asyncHandler(async (req, res, next) => {

  const { jobId } = req.params;

  // Retrieve the job document
  const job = await dbService.findOne({ model: Job, filter: { _id: jobId } });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  // Retrieve the company associated with the job
  const company = await dbService.findOne({ model: Company, filter: { _id: job.companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Check authorization: only company owner or one of the HRs can view job applications
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = company.HRs && company.HRs.map(id => id.toString()).includes(req.user._id.toString());
  if (!isOwner && !isHR) {
    return next(new Error("Not authorized to view job applications", { cause: 403 }));
  }

  // Get applications with pagination, sorting by createdAt descending, and populate user data
  const data = await paginate({
    page: req.query.page,
    size: req.query.size,
    model: Application,
    filter: { jobId },
    populate: [{
      path: "userId",
      select: "firstName lastName email profilePic" // Adjust fields as needed
    }],
    sort: { createdAt: -1 }
  });

  return successResponse({ res, data });

});


export const applyToJob = asyncHandler(async (req, res, next) => {

  // Ensure that only users (role "user") can apply to a job
  if (req.user.role !== roleTypes.user) {
    return next(new Error("Only users can apply for jobs", { cause: 403 }));
  }

  const { jobId } = req.params;

  // 1) Fetch the job
  const job = await dbService.findOne({ model: Job, filter: { _id: jobId } });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  // Check if the job is closed
  if (job.closed) {
    return next(new Error("Job is closed", { cause: 400 }));
  }

  // 2) Fetch the company that owns the job
  const company = await dbService.findOne({ model: Company, filter: { _id: job.companyId } });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  // 3) Check if the current user is the company owner or one of the HRs
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isHR = (company.HRs || []).map(id => id.toString()).includes(req.user._id.toString());

  // 4) If the user is either the owner or an HR, prevent them from applying
  if (isOwner || isHR) {
    return next(new Error("You cannot apply to a job posted by your own company", { cause: 400 }));
  }


  // 5) Check if the user has already applied for this job
  const existingApplication = await dbService.findOne({ model: Application, filter: { jobId, userId: req.user._id } });
  if (existingApplication) {
    return next(new Error("You already applied", { cause: 400 }));
  }

  // 6) If everything is valid, handle CV upload if provided
  let userCV = {};
  if (req.file) {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `JobSearchApp/applications/${req.user._id}` });
    userCV = { secure_url, public_id };
  }

  // 7) Create the application document
  const application = await dbService.create({
    model: Application,
    data: { jobId, userId: req.user._id, userCV }
  });

  // 8) Emit socket event to notify HR that a new application has been submitted
  getIo().emit("jobApplication", { jobId, userId: req.user._id });

  return successResponse({ res, status: 201, data: application });

});


export const reviewApplication = asyncHandler(async (req, res, next) => {

  const { jobId, applicationId } = req.params;
  const { status = "viewed" } = req.body;

  // Retrieve the job document
  const job = await dbService.findOne({ model: Job, filter: { _id: jobId } });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  // Retrieve the company associated with the job
  const company = await dbService.findOne({ model: Company, filter: { _id: job.companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Authorization: ensure that only HR members of the company can review applications
  const isHR = (company.HRs || []).map(id => id.toString()).includes(req.user._id.toString());
  if (!isHR) {
    return next(new Error("Not authorized. Only company HR can review applications", { cause: 403 }));
  }

  // Update the application status
  const application = await dbService.findOneAndUpdate({
    model: Application,
    filter: { _id: applicationId, jobId },
    data: { status },
    option: { new: true }
  });
  if (!application) return next(new Error("Application not found", { cause: 404 }));

  // Send email notification to the applicant
  const applicant = await dbService.findOne({ model: User, filter: { _id: application.userId } });

  if (applicant) {
    // Map status to corresponding email subject
    const subjectMap = {
      accepted: "Application Accepted",
      viewed: "Application Viewed",
      "in consideration": "Application In Consideration",
      rejected: "Application Rejected"
    };

    const subject = subjectMap[status] || "Application Update";

    // Send email notification with the appropriate subject
    await sendEmail({
      to: applicant.email,
      subject,
      html: `<p>Your application has been ${status}</p>`
    });
  }
  return successResponse({ res, data: application });

});
