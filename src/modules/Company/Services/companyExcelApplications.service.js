import * as dbService from "../../../DB/db.service.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { Job } from "../../../DB/Models/Job.model.js";
import { Application } from "../../../DB/Models/Application.model.js";
import ExcelJS from "exceljs";
import { asyncHandler } from "../../../utils/response/error.response.js";

export const exportCompanyApplicationsExcel = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { date } = req.query; // expected format: YYYY-MM-DD
  if (!date) {
    return next(new Error("Date query parameter is required", { cause: 400 }));
  }

  // Define the start and end boundaries for the given day
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  // Fetch all jobs for the company
  const jobs = await dbService.find({ model: Job, filter: { companyId } });
  const jobIds = jobs.map(job => job._id);

  // Fetch applications for those jobs within the specified day
  const applications = await dbService.find({
    model: Application,
    filter: {
      jobId: { $in: jobIds },
      createdAt: { $gte: startDate, $lt: endDate }
    },
    populate: [
      { path: "userId", select: "firstName lastName email" },
      { path: "jobId", select: "jobTitle" }
    ]
  });

  // Create an Excel workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Applications");

  // Define worksheet columns
  worksheet.columns = [
    { header: "Application ID", key: "applicationId", width: 25 },
    { header: "Job Title", key: "jobTitle", width: 25 },
    { header: "Applicant Name", key: "applicantName", width: 25 },
    { header: "Applicant Email", key: "applicantEmail", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Applied At", key: "appliedAt", width: 25 }
  ];

  // Add rows for each application
  applications.forEach(app => {
    worksheet.addRow({
      applicationId: app._id.toString(),
      jobTitle: app.jobId.jobTitle,
      applicantName: app.userId ? `${app.userId.firstName} ${app.userId.lastName}` : "",
      applicantEmail: app.userId ? app.userId.email : "",
      status: app.status,
      appliedAt: app.createdAt.toISOString()
    });
  });

  // Set headers to prompt file download
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=applications_${companyId}_${date}.xlsx`);

  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});
