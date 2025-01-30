const nodemailer = require("nodemailer");

const sendLoginEmail = async (from,userEmail, subject, textContent, htmlContent) => {
  try {
    console.log("process.env.EMAIL_ADDRESS",process.env.EMAIL_ADDRESS)
    console.log("process.env.EMAIL_PASSWORD",process.env.EMAIL_PASSWORD)

 

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Capillary Technology" ${process.env.EMAIL_ADDRESS}`,
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };
    console.log("Mail options",mailOptions)

    await transporter.sendMail(mailOptions);
    console.log("Login email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendLoginEmail;
