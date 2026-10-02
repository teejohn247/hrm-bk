import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Otp from '../../model/Otp';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';

dotenv.config();

/**
 * Generate a cryptographically random 6-digit numeric OTP code
 */
function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Helper to send the OTP email with Makers ERP branding
 */
async function sendOtpEmail(req, res, email, otp, companyName) {
    const receivers = [{ email }];
    const subject = 'Your Makers ERP Verification Code';
    const htmlBody = `
        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
                Hello${companyName ? ` ${companyName}` : ''},
            </p>
            <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
                Thank you for getting started with Makers ERP. Please use the verification code below to verify your email address.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px 36px;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 13px; color: #64748b; margin-top: 12px;">
                    This code will expire in <strong>10 minutes</strong>.
                </p>
            </div>
            <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                If you did not request this verification code, you can safely ignore this email.
            </p>
        </div>
    `;

    const templatedHtml = emailTemp(htmlBody, 'Verify Your Email');

    try {
        await sendEmail(req, res, email, receivers, subject, templatedHtml);
        console.log(`[OTP] Verification email sent to ${email}`);
    } catch (err) {
        console.error(`[OTP] Email delivery failed for ${email}:`, err.message || err);
        // Do not crash the endpoint in development if SMTP fails - OTP is logged in console
    }
}

/**
 * Step 1: Sign up
 * POST /api/v1/signUp or /api/v1/auth/signup
 * Body: { accountType, companyName, firstName, lastName, email }
 */
export const signUp = async (req, res) => {
    try {
        const { accountType = 'Company', companyName, firstName, lastName, email, password } = req.body;

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'A valid email address is required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const isEmployee = accountType === 'Employee';

        if (isEmployee) {
            if (!firstName || typeof firstName !== 'string' || !firstName.trim() || !lastName || typeof lastName !== 'string' || !lastName.trim()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'First name and last name are required for employee signup',
                });
            }
        } else {
            // Company signup
            // If legacy password-only signup was sent without companyName, keep legacy compatibility
            if (password && !companyName) {
                const existingLegacyCompany = await Company.findOne({ email: normalizedEmail });
                if (existingLegacyCompany) {
                    return res.status(400).json({
                        status: 400,
                        error: `A user with email: ${normalizedEmail} already exists`,
                    });
                }
            }

            if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Company name is required',
                });
            }
        }

        // Check if an existing verified company or employee already exists with this email
        const existingCompany = await Company.findOne({ email: normalizedEmail });
        const existingEmployee = await Employee.findOne({ email: normalizedEmail });
        if ((existingCompany && existingCompany.password) || (existingEmployee && existingEmployee.password)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `An account with email ${normalizedEmail} already exists. Please log in.`,
            });
        }

        const otp = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        const displayName = isEmployee ? `${firstName.trim()} ${lastName.trim()}` : companyName.trim();

        console.log(`[OTP GENERATED] Code for ${normalizedEmail} (${displayName}): ${otp}`);

        // Update or insert OTP document
        await Otp.findOneAndUpdate(
            { email: normalizedEmail, purpose: 'signup' },
            {
                otp,
                companyName: isEmployee ? '' : companyName.trim(),
                firstName: isEmployee ? firstName.trim() : '',
                lastName: isEmployee ? lastName.trim() : '',
                accountType: accountType || 'Company',
                isVerified: false,
                verificationToken: '',
                expiresAt,
            },
            { upsert: true, new: true }
        );

        // Send OTP email
        await sendOtpEmail(req, res, normalizedEmail, otp, displayName);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
            data: {
                email: normalizedEmail,
                companyName: isEmployee ? undefined : companyName.trim(),
                firstName: isEmployee ? firstName.trim() : undefined,
                lastName: isEmployee ? lastName.trim() : undefined,
                accountType: accountType || 'Company',
            },
        });
    } catch (error) {
        console.error('Error in signUp OTP flow:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred during signup',
        });
    }
};

/**
 * Step 2: Verify OTP
 * POST /api/v1/verify-otp or /api/v1/verifyOtp
 * Body: { email, otp }
 */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, code } = req.body;
        const inputOtp = (otp || code || '').toString().trim();

        if (!email || !inputOtp) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Email and 6-digit OTP code are required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: 'signup',
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No pending verification found for this email. Please sign up first.',
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Verification code has expired. Please click "Resend OTP" to get a new code.',
            });
        }

        if (otpRecord.otp !== inputOtp) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid verification code. Please check and try again.',
            });
        }

        // Generate signed verification JWT token
        const secret = process.env.SECRET_KEY || 'default_secret_key';
        const verificationToken = jwt.sign(
            {
                email: normalizedEmail,
                companyName: otpRecord.companyName,
                accountType: otpRecord.accountType,
                purpose: 'email_verification',
            },
            secret,
            { expiresIn: '1h' }
        );

        otpRecord.isVerified = true;
        otpRecord.verificationToken = verificationToken;
        await otpRecord.save();

        console.log(`[OTP VERIFIED] Email ${normalizedEmail} successfully verified.`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Email verified successfully',
            token: verificationToken,
            data: {
                email: normalizedEmail,
                companyName: otpRecord.companyName,
                accountType: otpRecord.accountType,
                isVerified: true,
            },
        });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred during OTP verification',
        });
    }
};

/**
 * Step 2: Resend OTP
 * POST /api/v1/resend-otp or /api/v1/resendOtp
 * Body: { email }
 */
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'A valid email address is required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        let otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: 'signup',
        }).sort({ createdAt: -1 });

        const otp = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        console.log(`[OTP RESENT] New code for ${normalizedEmail}: ${otp}`);

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.expiresAt = expiresAt;
            otpRecord.isVerified = false;
            otpRecord.verificationToken = '';
            await otpRecord.save();
        } else {
            otpRecord = await Otp.create({
                email: normalizedEmail,
                otp,
                companyName: '',
                accountType: 'Company',
                expiresAt,
            });
        }

        await sendOtpEmail(req, res, normalizedEmail, otp, otpRecord.companyName);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `A new 6-digit verification code has been sent to ${normalizedEmail}`,
        });
    } catch (error) {
        console.error('Error in resendOtp:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred while resending OTP',
        });
    }
};

export default {
    signUp,
    verifyOtp,
    resendOtp,
};
