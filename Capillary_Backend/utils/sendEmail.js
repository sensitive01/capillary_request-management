const nodemailer = require("nodemailer");

const sendLoginEmail = async (userEmail,subject,textContent,htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"Your App" <your-email@example.com>',
      to: userEmail,
      subject:subject,
      text:textContent,
      html:htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Login email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendLoginEmail;
