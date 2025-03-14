import nodemailer from 'nodemailer';

export const sendEmail = async ({ to = [], cc = [], bcc = [], text = "", html = "", subject = "Notification", attachments = [] } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const info = await transporter.sendMail({
    from: `"Job Search App" <${process.env.EMAIL}>`,
    to,
    cc,
    bcc,
    text,
    html,
    subject,
    attachments
  });
  console.log("Email sent: %s", info.messageId);
};
