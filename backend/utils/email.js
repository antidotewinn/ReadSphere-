const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"ReadSphere Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code - ReadSphere',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:40px;background:linear-gradient(135deg,#1a1a1a,#111);">
                    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;font-weight:300;letter-spacing:-0.5px;">ReadSphere</h1>
<p style="color:#666;margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">eBook Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#aaa;font-size:16px;margin:0 0 24px;">Hi ${name},</p>
                    <p style="color:#aaa;font-size:15px;margin:0 0 32px;line-height:1.6;">Use the code below to verify your account. It expires in <strong style="color:#fff;">10 minutes</strong>.</p>
                    <div style="text-align:center;margin:0 0 32px;">
                      <span style="background:#1a1a1a;border:1px solid #333;color:#f0c060;font-size:40px;font-weight:700;letter-spacing:12px;padding:20px 32px;border-radius:12px;display:inline-block;">${otp}</span>
                    </div>
                    <p style="color:#555;font-size:13px;margin:0;line-height:1.6;">If you didn't request this, please ignore this email. Your account remains secure.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPurchaseConfirmationEmail = async (email, name, bookTitle, amount) => {
  const mailOptions = {
    from: `"ReadSphere Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Purchase Confirmed: ${bookTitle}`,

    html: `
      <div style="font-family:sans-serif;background:#0a0a0a;padding:40px;color:#aaa;">
        <h2 style="color:#fff;">Purchase Confirmed!</h2>
        <p>Hi ${name}, your purchase of <strong style="color:#f0c060;">${bookTitle}</strong> for ₹${amount} was successful.</p>
        <p>Head to your library to start reading.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendPurchaseConfirmationEmail };
