import cron from 'node-cron';
import * as dbService from "../../DB/db.service.js";
import { User } from "../../DB/Models/User.model.js";

cron.schedule('0 */6 * * *', async () => {
  console.log("Cron job is running..."); 

  const now = new Date();
  console.log("Current time:", now);

  // Check how many OTPs are currently expired
  const users = await dbService.find({ model: User });
  users.forEach(u => {
    u.OTP.forEach(o => {
      const isExpired = new Date(o.expiresIn) < now;
      console.log(`User: ${u.email}, OTP type: ${o.type}, expiresIn: ${o.expiresIn}, isExpired: ${isExpired}`);
    });
  });

  // Attempt to remove expired OTPs
  const result = await dbService.updateMany({
    model: User,
    filter: { "OTP.expiresIn": { $lt: now } },
    data: { $pull: { OTP: { expiresIn: { $lt: now } } } }
  });

  // Log the result of updateMany to see how many documents were modified
  console.log("Expired OTPs deleted =>", result);

  console.log("----- CRON JOB FINISHED -----\n");
});

