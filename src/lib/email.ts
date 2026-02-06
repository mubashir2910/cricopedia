import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
    const mailOptions = {
        from: `"Predict Game 🏏" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: 'Your OTP for Predict Game Signup',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🏏 Predict Game</h1>
                </div>
                <div style="background: #1e293b; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p style="color: #94a3b8; font-size: 16px; margin-bottom: 20px;">
                        Welcome! Here's your verification code:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto; border-spacing: 8px;">
                            <tr>
                                ${otp.split('').map((digit) => `
                                    <td style="background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 32px; width: 50px; height: 60px; text-align: center; border-radius: 8px; font-weight: bold;">
                                        ${digit}
                                    </td>
                                `).join('')}
                            </tr>
                        </table>
                    </div>
                    <p style="color: #64748b; font-size: 14px; text-align: center;">
                        This code expires in <strong style="color: #f59e0b;">10 minutes</strong>
                    </p>
                    <hr style="border: none; border-top: 1px solid #334155; margin: 25px 0;" />
                    <p style="color: #475569; font-size: 12px; text-align: center;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendWarningEmail(to: string, warningNumber: number): Promise<void> {
    const mailOptions = {
        from: `"Predict Game 🏏" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: '⚠️ Account Flagged - Predict Game',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Warning #${warningNumber}</h1>
                </div>
                <div style="background: #1e293b; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p style="color: #fbbf24; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
                        Your account has been flagged for potential multi-accounting.
                    </p>
                    <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
                        Our system detected suspicious activity that suggests multiple accounts may be operating together.
                    </p>
                    <div style="background: #0f172a; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #e2e8f0; margin: 0; font-size: 14px;">
                            <strong>What this means:</strong><br/>
                            If you win any prize, you will be <strong style="color: #f59e0b;">thoroughly verified</strong> using your phone number and ID before receiving the prize.
                        </p>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">
                        If you believe this is a mistake, continue playing normally. Fair players have nothing to worry about! 🏏
                    </p>
                    <hr style="border: none; border-top: 1px solid #334155; margin: 25px 0;" />
                    <p style="color: #475569; font-size: 12px; text-align: center;">
                        This is warning #${warningNumber}. Repeated flags may result in disqualification.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}
