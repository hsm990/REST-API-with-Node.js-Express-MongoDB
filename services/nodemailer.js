const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use SMTP config
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // use App Password if Gmail
    },
});
async function sendVerificationEmail(toEmail, token) {
    const link = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Confirm your email',
        html: `
      <h2>Welcome!</h2>
      <p>Click the link to confirm your account:</p>
      <a href="${link}">${link}</a>
      <p>Expires in 1 minute.</p>
    `,
    });
}

module.exports = { sendVerificationEmail };