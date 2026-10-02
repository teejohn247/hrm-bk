import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import Otp from '../../model/Otp';
import AppraisalGroup from '../../model/AppraisalGroup';
import AuditTrail from '../../model/AuditTrail';
import utils from '../../config/utils';

dotenv.config();

/**
 * Step 3: Set Password
 * POST /api/v1/setPassword or /api/v1/set-password
 * Body: { email, password, confirmPassword, token }
 */
export const setPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        let token = req.body.token || req.headers.authorization;
        let email = req.body.email;

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        // Try extracting email from token if provided
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key');
                if (decoded && decoded.email) {
                    email = decoded.email;
                }
            } catch (err) {
                // If token was invalid and no email provided in body, return error
                if (!email) {
                    return res.status(401).json({
                        status: 401,
                        success: false,
                        error: 'Invalid or expired verification token. Please verify email again.',
                    });
                }
            }
        }

        if (req.decode && req.decode.email) {
            email = req.decode.email;
        }

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Email is required to set password',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Password must be at least 6 characters long',
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Passwords do not match',
            });
        }

        // Check if verified via OTP
        const otpRecord = await Otp.findOne({
            email: normalizedEmail,
            purpose: 'signup',
        }).sort({ createdAt: -1 });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let emp = await Employee.findOne({ email: normalizedEmail });
        let company = await Company.findOne({ email: normalizedEmail });

        if (emp && !company) {
            emp.password = hashedPassword;
            emp.activeStatus = true;
            emp.status = 'Active';
            emp.firstTimeLogin = false;
            if (otpRecord?.firstName) emp.firstName = otpRecord.firstName;
            if (otpRecord?.lastName) emp.lastName = otpRecord.lastName;
            await emp.save();

            if (otpRecord) {
                await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});
            }

            const authToken = utils.encodeToken(emp._id, false, emp.email, emp.companyId);
            const empData = emp.toObject();
            delete empData.password;

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Password set successfully',
                token: authToken,
                onboardingCompleted: false,
                onboardingStep: 1,
                data: empData,
            });
        }

        if (!emp && !company && (otpRecord?.accountType === 'Employee' || req.body.accountType === 'Employee')) {
            const currentYear = new Date().getFullYear();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const employeeCode = `EMP-${currentYear}-${randomCode}`;
            const fName = (otpRecord?.firstName || req.body.firstName || 'Employee').trim();
            const lName = (otpRecord?.lastName || req.body.lastName || 'User').trim();

            emp = new Employee({
                email: normalizedEmail,
                password: hashedPassword,
                companyId: req.body.companyId || otpRecord?.companyId || 'independent',
                companyName: req.body.companyName || otpRecord?.companyName || 'Independent',
                firstName: fName,
                lastName: lName,
                fullName: `${fName} ${lName}`,
                department: 'General',
                employmentType: 'Full-time',
                employeeCode,
                status: 'Active',
                activeStatus: true,
                firstTimeLogin: false,
                role: 'Staff',
            });
            await emp.save();

            if (otpRecord) {
                await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});
            }

            const authToken = utils.encodeToken(emp._id, false, emp.email, emp.companyId);
            const empData = emp.toObject();
            delete empData.password;

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Password set successfully',
                token: authToken,
                onboardingCompleted: false,
                onboardingStep: 1,
                data: empData,
            });
        }

        if (company) {
            company.password = hashedPassword;
            company.activeStatus = true;
            company.status = true;
            company.firstTimeLogin = true;
            company.isSuperAdmin = true;

            if (req.body.companyName && !company.companyName) {
                company.companyName = req.body.companyName.trim();
            } else if (otpRecord?.companyName && !company.companyName) {
                company.companyName = otpRecord.companyName.trim();
            }

            if (otpRecord?.accountType && !company.accountType) {
                company.accountType = otpRecord.accountType;
            }

            if (!company.onboardingStep) {
                company.onboardingStep = 1;
            }

            await company.save();
        } else {
            company = new Company({
                email: normalizedEmail,
                password: hashedPassword,
                companyName: (req.body.companyName || otpRecord?.companyName || 'My Company').trim(),
                accountType: req.body.accountType || otpRecord?.accountType || 'Company',
                firstTimeLogin: true,
                isSuperAdmin: true,
                activeStatus: true,
                status: true,
                onboardingStep: 1,
                onboardingCompleted: false,
            });

            await company.save();
        }

        // Create default appraisal groups if needed
        try {
            const generalGroup = await AppraisalGroup.findOne({
                companyId: company._id.toString(),
                groupName: 'General',
            });

            if (!generalGroup) {
                await new AppraisalGroup({
                    groupName: 'General',
                    companyId: company._id.toString(),
                    companyName: company.companyName || 'My Company',
                    description: 'General Group',
                }).save();
            }

            const specificGroup = await AppraisalGroup.findOne({
                companyId: company._id.toString(),
                groupName: 'Specific',
            });

            if (!specificGroup) {
                await new AppraisalGroup({
                    groupName: 'Specific',
                    companyId: company._id.toString(),
                    companyName: company.companyName || 'My Company',
                    description: 'Specific Group',
                }).save();
            }
        } catch (groupError) {
            console.warn('Non-fatal error creating appraisal groups:', groupError.message);
        }

        // Generate full authentication JWT token for company workspace
        const authToken = utils.encodeToken(company._id, company.isSuperAdmin, company.email, company._id);

        // Delete used OTP
        if (otpRecord) {
            await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});
        }

        // Create audit record
        try {
            await new AuditTrail({
                userId: company._id,
                userType: 'company',
                action: 'Set Account Password',
                details: `Password configured for ${company.email}`,
                timestamp: new Date(),
            }).save();
        } catch (auditErr) {
            console.warn('Audit trail error:', auditErr.message);
        }

        const companyData = company.toObject();
        delete companyData.password;

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Password set successfully',
            token: authToken,
            onboardingCompleted: company.onboardingCompleted !== undefined ? company.onboardingCompleted : false,
            onboardingStep: company.onboardingStep || 1,
            data: companyData,
        });
    } catch (error) {
        console.error('Error in setPassword:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred while setting password',
        });
    }
};

export default {
    setPassword,
};
