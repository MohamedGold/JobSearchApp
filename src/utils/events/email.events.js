import { EventEmitter } from 'events';
import { customAlphabet } from 'nanoid';
import { generateHash } from '../security/hash.security.js';
import { User } from '../../DB/Models/User.model.js';
import { sendEmail } from '../email/send.email.js';
import { verifyAccountTemplate } from '../email/template/verifyAccount.template.js';
import * as dbService from '../../DB/db.service.js';

export const emailEvent = new EventEmitter();

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  updateEmail: "Update Your Email"
};

export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {
  const { id, email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const hashOTP = generateHash({ plainText: otp });
  const now = new Date();
  let updateData = {};

  // Use $push operator to add a new OTP entry while keeping existing ones.
  switch (subject) {
    case emailSubject.confirmEmail:
      updateData = {
        $push: {
          OTP: {
            code: hashOTP,
            type: 'confirmEmail',
            expiresIn: new Date(now.getTime() + 10 * 60 * 1000)
          }
        }
      };
      break;
    case emailSubject.resetPassword:
      updateData = {
        $push: {
          OTP: {
            code: hashOTP,
            type: 'forgetPassword',
            expiresIn: new Date(now.getTime() + 10 * 60 * 1000)
          }
        }
      };
      break;
    case emailSubject.updateEmail:
      updateData = {
        $push: {
          OTP: {
            code: hashOTP,
            type: 'updateEmail',
            expiresIn: new Date(now.getTime() + 10 * 60 * 1000)
          }
        }
      };
      break;
    default:
      break;
  }

  await dbService.updateOne({ model: User, filter: { _id: id }, data: updateData });
  const html = verifyAccountTemplate({ code: otp });
  await sendEmail({ to: email, subject, html });
};

emailEvent.on("sendConfirmEmail", async (data) => {
  await sendCode({ data, subject: emailSubject.confirmEmail });
});

emailEvent.on("updateEmail", async (data) => {
  await sendCode({ data, subject: emailSubject.updateEmail });
});

emailEvent.on("forgotPassword", async (data) => {
  await sendCode({ data, subject: emailSubject.resetPassword });
});
