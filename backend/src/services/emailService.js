const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    return null;
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: '"PayUBlog Security" <no-reply@payublog.com>',
    to: email,
    subject: 'Password Reset Request — PayUBlog',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 15px;">We received a request to reset your password for your PayUBlog account.</p>
        <p style="color: #475569; font-size: 15px;">Click the button below to set a new password. This link will expire in 10 minutes:</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #059669;">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Password reset link sent to ${email}`);
      return true;
    } catch (err) {
      console.error('[Email Error]', err.message);
    }
  }

  console.log(`[Email Dev Output] Reset link for ${email}: ${resetUrl}`);
  return true;
};

module.exports = {
  sendPasswordResetEmail,
};
