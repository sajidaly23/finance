import nodemailer from "nodemailer";

export const sendSalaryEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gulbazkachoo3032@gmail.com",       //  Use real Gmail
      pass: "adxb pqzw xqvo avhz"          //  Use App Password from Google
    }
  });

  await transporter.sendMail({
    from: 'HR Dept imxfinanceofficer@gmail.com',
    to,
    subject,
    text
  });
};
