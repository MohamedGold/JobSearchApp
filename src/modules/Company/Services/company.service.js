import * as dbService from "../../../DB/db.service.js";
import { Company } from "../../../DB/Models/Company.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { roleTypes, User } from "../../../DB/Models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";






export const addCompany = asyncHandler(async (req, res, next) => {

  const { companyName, description, industry, address, numberOfEmployees, companyEmail, HRs } = req.body;

  const existing = await dbService.findOne({ model: Company, filter: { $or: [{ companyName }, { companyEmail }] } });

  if (existing) return next(new Error("Company already exists", { cause: 409 }));

  const companyData = { companyName, description, industry, address, numberOfEmployees, companyEmail, createdBy: req.user._id };

  if (HRs) {
    // Check that each HR exists in the User collection and is not the company owner
    for (const hrId of HRs) {
      if (hrId.toString() === req.user._id.toString()) {
        return next(new Error("Company owner cannot be listed as an HR", { cause: 400 }));
      }
      const hrUser = await dbService.findOne({ model: User, filter: { _id: hrId } });
      if (!hrUser) {
        return next(new Error("HR not found", { cause: 404 }));
      }
    }
    companyData.HRs = HRs;
  }

  const company = await dbService.create({
    model: Company,
    data: companyData
  });

  return successResponse({ res, status: 201, data: company });

});



export const updateCompany = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;

  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  if (company.createdBy.toString() !== req.user._id.toString()) return next(new Error("Not authorized", { cause: 403 }));

  const updated = await dbService.findOneAndUpdate({ model: Company, filter: { _id: companyId }, data: req.body, option: { new: true } });

  return successResponse({ res, data: updated });
});


export const softDeleteCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  // Allow deletion if the requester is the company owner or an admin
  if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleTypes.admin) {
    return next(new Error("Not authorized", { cause: 403 }));
  }

  const updatedCompany = await dbService.findOneAndUpdate({
    model: Company,
    filter: { _id: companyId },
    data: { deletedAt: new Date() },
    option: { new: true }
  });

  return successResponse({ res, data: { message: "Company deleted", company: updatedCompany } });
});


export const getCompanyWithJobs = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;

  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  await company.populate('jobs');

  return successResponse({ res, data: company });


});


export const searchCompany = asyncHandler(async (req, res, next) => {
  const { name } = req.query;
  const companies = await dbService.find({ model: Company, filter: { companyName: new RegExp(name, 'i') } });
  return successResponse({ res, data: companies });
});

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;
  // Find the company
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("Not authorized", { cause: 403 }));
  }

  // Upload the image to Cloudinary
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `JobSearchApp/company/${companyId}/logo` });
  // Update the company document with the new logo details
  const updatedCompany = await dbService.findOneAndUpdate({
    model: Company,
    filter: { _id: companyId },
    data: { logo: { secure_url, public_id } },
    option: { new: true }
  });
  return successResponse({ res, data: updatedCompany });

});


export const uploadCompanyCover = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;
  // Find the company
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));
  // Check if the logged-in user is the owner or an admin
  if (company.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("Not authorized", { cause: 403 }));
  }
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `JobSearchApp/company/${companyId}/cover` });
  const updatedCompany = await dbService.findOneAndUpdate({
    model: Company,
    filter: { _id: companyId },
    data: { coverPic: { secure_url, public_id } },
    option: { new: true }
  });
  return successResponse({ res, data: updatedCompany });

});


export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;
  // Find the company
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));
  // Allow deletion only if the requester is the company owner or an admin
  if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleTypes.admin) {
    return next(new Error("Not authorized", { cause: 403 }));
  }

  if (!company.logo || !company.logo.secure_url) {
    return next(new Error("Company logo already deleted", { cause: 401 }));
  }


  company.logo = undefined;
  await company.save();
  return successResponse({ res, data: { message: "Company logo deleted" } });

});


export const deleteCompanyCover = asyncHandler(async (req, res, next) => {

  const { companyId } = req.params;
  // Find the company
  const company = await dbService.findOne({ model: Company, filter: { _id: companyId } });
  if (!company) return next(new Error("Company not found", { cause: 404 }));
  // Check if the logged-in user is the owner or an admin
  if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleTypes.admin) {
    return next(new Error("Not authorized", { cause: 403 }));
  }

  if (!company.coverPic || !company.coverPic.secure_url) {
    return next(new Error("Company cover already deleted", { cause: 401 }));
  }


  company.coverPic = undefined;
  await company.save();
  return successResponse({ res, data: { message: "Company cover deleted" } });

});

