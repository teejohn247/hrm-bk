import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from 'cloudinary';

dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Temporary storage for files before uploading to cloudinary
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/temp';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
        return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
}).array('screenshots', 10); // Allow up to 10 screenshot files

/**
 * Helper function to upload a file to Cloudinary
 * @param {string} filePath - Path to the local file
 * @returns {Promise<string>} - URL of the uploaded file on Cloudinary
 */
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            folder: "complaints"
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Controller for creating a new user complaint
 * @route POST /api/complaints
 */
const createComplaint = async (req, res) => {
    // Handle file upload with multer
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            return res.status(400).json({
                status: 400,
                success: false,
                error: `File upload error: ${err.message}`
            });
        } else if (err) {
            // An unknown error occurred
            return res.status(400).json({
                status: 400,
                success: false,
                error: err.message
            });
        }
        
        // Keep track of temporary files to clean up later
        const tempFiles = req.files ? [...req.files] : [];
        
        try {
            const { description, issueCategory } = req.body;
            
            // Validate required fields
            if (!description || !issueCategory) {
                // Clean up temp files if validation failed
                if (tempFiles.length > 0) {
                    tempFiles.forEach(file => {
                        fs.unlink(file.path, (err) => {
                            if (err) console.error(`Error deleting file ${file.path}:`, err);
                        });
                    });
                }
                
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Description and issue category are required'
                });
            }
            
            // Get user information based on the payload id
            let user;
            let company;
            let companyId;
            let companyName;
            let userId = req.payload.id;
            let userFullName;
            let userEmail;
            let isAdmin = false;
            let isSuperAdmin = false;
            let userRole = 'employee'; // Default role
            
            // Check if the requester is a company account or an employee
            const companyCheck = await Company.findOne({ _id: userId });
            
            if (companyCheck) {
                // This is a company account
                company = companyCheck;
                companyId = company._id;
                companyName = company.companyName;
                userFullName = company.companyName; // For company accounts, use company name
                userEmail = company.email;
                isAdmin = true;
                isSuperAdmin = company.isSuperAdmin || false;
                userRole = isSuperAdmin ? 'superadmin' : 'admin';
            } else {
                // This is an employee
                user = await Employee.findOne({ _id: userId });
                
                if (!user) {
                    // Clean up temp files if user not found
                    if (tempFiles.length > 0) {
                        tempFiles.forEach(file => {
                            fs.unlink(file.path, (err) => {
                                if (err) console.error(`Error deleting file ${file.path}:`, err);
                            });
                        });
                    }
                    
                    return res.status(404).json({
                        status: 404,
                        success: false,
                        error: 'User not found'
                    });
                }
                
                companyId = user.companyId;
                companyName = user.companyName;
                userFullName = user.fullName || `${user.firstName} ${user.lastName}`;
                userEmail = user.email;
                
                // Check if employee is a super admin
                if (user.isSuperAdmin) {
                    isSuperAdmin = true;
                    isAdmin = true;
                    userRole = 'superadmin';
                }
                // Check if employee is an admin
                else if (user.permissions?.appraisalManagement?.createKPIGroup || 
                    user.roleName === 'Admin' || 
                    user.role === 'Admin') {
                    isAdmin = true;
                    userRole = 'admin';
                }
            }
            
            // Process screenshots if files were uploaded
            let screenshotPaths = [];
            if (tempFiles.length > 0) {
                // Upload each file to Cloudinary
                const uploadPromises = tempFiles.map(file => uploadToCloudinary(file.path));
                screenshotPaths = await Promise.all(uploadPromises);
                
                // Clean up temporary files after successful Cloudinary upload
                tempFiles.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Error deleting temporary file ${file.path}:`, err);
                    });
                });
            }
            
            // Create new complaint
            const newComplaint = new UserComplaint({
                userId,
                userFullName,
                userEmail,
                companyId,
                companyName,
                description,
                issueCategory,
                screenshots: screenshotPaths, // Array of Cloudinary URLs
                status: 'pending',
                createdByRole: userRole
            });
            
            // Save the complaint
            await newComplaint.save();
            
            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Complaint submitted successfully',
                data: {
                    id: newComplaint._id,
                    userFullName,
                    userEmail,
                    companyName,
                    description,
                    issueCategory,
                    screenshots: screenshotPaths,
                    createdAt: newComplaint.createdAt,
                    status: newComplaint.status,
                    userRole
                }
            });
            
        } catch (error) {
            // Clean up temp files if an error occurs
            if (tempFiles.length > 0) {
                tempFiles.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Error deleting temporary file ${file.path}:`, err);
                    });
                });
            }
            
            console.error('Error creating complaint:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                error: error.message || 'An error occurred while creating the complaint'
            });
        }
    });
};

export default createComplaint; 