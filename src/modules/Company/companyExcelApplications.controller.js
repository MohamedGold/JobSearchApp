import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { exportCompanyApplicationsExcel } from "./Services/companyExcelApplications.service.js";

const companyExcelController = Router();

// Endpoint: GET /company/:companyId/applications/excel?date=YYYY-MM-DD
companyExcelController.get("/:companyId/applications/excel", authentication(), exportCompanyApplicationsExcel);

export default companyExcelController;
