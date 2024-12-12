const nodemailer = require("nodemailer");

const sendLoginEmail = async (userEmail, name) => {
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
      subject: "Login Notification",
      text: `Hi ${name} !!! You have successfully logged in!`,
      html: "<p>You have <strong>successfully logged in</strong>!</p>",
    };

    await transporter.sendMail(mailOptions);
    console.log("Login email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendLoginEmail;
