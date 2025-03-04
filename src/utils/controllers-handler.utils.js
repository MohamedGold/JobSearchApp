import authController from "../modules/Auth/auth.controller.js";
import userController from "../modules/User/user.controller.js";
import companyController from "../modules/Company/company.controller.js";
import jobController from "../modules/Job/job.controller.js";
import chatController from "../modules/Chat/chat.controller.js";
import companyExcelController from "../modules/Company/companyExcelApplications.controller.js";

export function controllerHandler(app) {
  app.use('/auth', authController);
  app.use('/user', userController);
  app.use('/company', companyController);
  // company Excel endpoint
  app.use('/company', companyExcelController);
  app.use('/job', jobController);
  app.use('/chat', chatController);
  app.all("*", (req, res, next) => {
    res.status(404).json({ message: "Invalid Routing Request" });
  });
}
