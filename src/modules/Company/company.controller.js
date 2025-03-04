import { Router } from "express";
import * as companyService from "./Services/company.service.js";
import * as validators from "./company.validation.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidations } from "../../utils/multer/local.multer.js";

const companyController = Router();

// Add company
companyController.post('/', authentication(), validation(validators.companyValidation.addCompany), companyService.addCompany);

// Update company (only owner)
companyController.patch('/:companyId', authentication(), validation(validators.updateCompany), companyService.updateCompany);

// Soft delete company (admin or owner)
companyController.delete('/:companyId', authentication(), companyService.softDeleteCompany);

// Get specific company with related jobs
companyController.get('/:companyId', authentication(), companyService.getCompanyWithJobs);

// Search company by name
companyController.get('/', authentication(), companyService.searchCompany);

// Upload company logo
companyController.patch('/:companyId/logo', authentication(), uploadCloudFile(fileValidations.image).single("attachment"), companyService.uploadCompanyLogo);

// Upload company cover pic
companyController.patch('/:companyId/cover', authentication(), uploadCloudFile(fileValidations.image).single("attachment"), companyService.uploadCompanyCover);

// Delete company logo
companyController.delete('/:companyId/logo', authentication(), companyService.deleteCompanyLogo);

// Delete company cover pic
companyController.delete('/:companyId/cover', authentication(), companyService.deleteCompanyCover);

export default companyController;
