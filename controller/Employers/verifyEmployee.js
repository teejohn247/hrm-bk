import dotenv from 'dotenv';
import Company from '../../model/Employees';
import Admin from '../../model/Company';

import bcrypt from 'bcrypt';
import HTTP_STATUS from 'http-status-codes';
import jwt_decode from 'jwt-decode';
import AppraisalGroup from '../../model/AppraisalGroup';
import utils from '../../config/utils';
import Employee from '../../model/Employees';

const sgMail = require('@sendgrid/mail')
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const verifyEmployee = async (req, res) => {

    try {
        // Log the incoming request for debugging
        console.log("=== Verify Employee Request ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        console.log("Decoded token:", JSON.stringify(req.decode, null, 2));
       
        const {password} = req.body;

        console.log("Looking up employee with email:", req.decode.email);

        let emp = await Company.findOne({ email: req.decode.email });
        let adm = await Admin.findOne({ email: req.decode.email });

        console.log("Employee lookup result:", emp ? {
            id: emp._id,
            email: emp.email,
            companyId: emp.companyId,
            activeStatus: emp.activeStatus,
            firstTimeLogin: emp.firstTimeLogin
        } : "Not found");
        
        console.log("Admin lookup result:", adm ? {
            id: adm._id,
            email: adm.email
        } : "Not found");

        if(emp){
            if(password.length < 1){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    error: 'empty password'
                });
        
                return;
             }
    
            if(!emp){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    error: 'wrong token'
                });
        
                return;
             }
        
           
    
                let employee = await Company.findOne({ email: req.decode.email });
    
                console.log("Employee details:", {
                    id: employee?._id,
                    email: employee?.email,
                    companyId: employee?.companyId
                });
    
                if (!employee) {
        
                    res.status(400).json({
                        status: 400,
                        error: `User with email: ${req.decode.email} does not exist`
                    });
                    return;
                }
                
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(password, salt);
        
                console.log("Password hashed successfully");
                
                try {
                    await employee.updateOne({
                        password: password && hashed,
                        activeStatus: true
                    });
                    
                    await employee.save();
                    
                    console.log("Employee password and status updated");
                } catch (updateError) {
                    console.error("Error updating employee:", updateError.message);
                    res.status(500).json({
                        status: 500,
                        success: false,
                        error: updateError.message
                    });
                    return;
                }
    
                try {
                    if (employee.firstTimeLogin === undefined) {
                        await employee.updateOne({
                            firstTimeLogin: true, 
                        });
                        console.log("Set firstTimeLogin to true (initial login)");
                    } else if (employee.firstTimeLogin === true) {
                        await employee.updateOne({
                            firstTimeLogin: false, 
                        });
                        console.log("Updated firstTimeLogin from true to false");
                    }
                    else if (employee.firstTimeLogin === false) {
                        await employee.updateOne({
                            firstTimeLogin: false, 
                        });
                        console.log("Maintained firstTimeLogin as false");
                    }
                } catch (loginFlagError) {
                    console.error("Error updating firstTimeLogin flag:", loginFlagError.message);
                    // Not critical - continue the process
                }
    
                // Get the companyId to include in the token
                const companyId = employee.companyId;
                if (!companyId) {
                    console.warn("Warning: Employee has no companyId assigned");
                }
                
                // Update token generation to include companyId
                // Assumption: encodeToken should accept companyId as a parameter
                // If utils.encodeToken doesn't accept companyId, you'll need to update the utils.js file
                let token;
                try {
                    // Try to use companyId if available - adjust parameters as needed based on your utils.encodeToken implementation
                    token = utils.encodeToken(employee._id, false, employee.email, companyId);
                    console.log("Generated new token for employee with companyId");
                } catch (tokenError) {
                    console.error("Error generating token with companyId, falling back to basic token:", tokenError.message);
                    token = utils.encodeToken(employee._id, false, employee.email);
                    console.log("Generated basic token for employee without companyId");
                }

                // Modified handling of appraisal groups using async/await instead of callbacks
                try {
                    // Skip appraisal operations if companyId is missing
                    if (!companyId) {
                        console.warn("Skipping appraisal operations - employee has no companyId");
                    } else {
                        console.log(`Looking for General appraisal group for company: ${companyId}`);
                        const appraisals = await AppraisalGroup.findOne(
                            {companyId: companyId, groupName: "General"}, 
                            {_id: 1, groupName: 1, groupKpis: 1, description: 1}
                        );
                        
                        if (!appraisals) {
                            console.log("No General appraisal group found for this company, skipping appraisal assignments");
                        } else {
                            console.log("Appraisal group found, proceeding with assignments");
                            
                            // First update: Add employee to appraisal group
                            try {
                                await AppraisalGroup.findOneAndUpdate(
                                    {companyId: companyId, groupName: "General"}, 
                                    { 
                                        $push: { 
                                            assignedEmployees: {
                                                employee_id: employee._id,
                                                employee_name: employee.fullName || employee.name || "Unknown"
                                            }
                                        }
                                    },
                                    { upsert: true }
                                );
                                console.log("Employee added to appraisal group successfully");
                            } catch (groupUpdateError) {
                                console.error("Error adding employee to appraisal group:", groupUpdateError.message);
                                // Continue as this isn't critical
                            }
                            
                            // Second update: Add appraisal to employee record
                            try {
                                await Employee.findOneAndUpdate(
                                    { _id: employee._id }, 
                                    { $push: { appraisals } },
                                    { upsert: true }
                                );
                                console.log("Appraisal added to employee record successfully");
                            } catch (employeeUpdateError) {
                                console.error("Error adding appraisal to employee:", employeeUpdateError.message);
                                // Continue as this isn't critical
                            }
                        }
                    }
                } catch (appraisalError) {
                    console.error("Error in appraisal processing:", appraisalError.message);
                    // Continue the process as this is not critical
                }

                let registered = await Company.findOne({ email: req.decode.email });
                console.log("Returning successful response with token");
        
                res.status(200).json({
                    status: 200,
                    data: registered,
                    token: token,
                });
                return;

        } else if (adm){
            let admin = await Admin.findOne({ email: req.decode.email });


            if(password.length < 1){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    error: 'empty password'
                });
        
                return;
             }
    
             console.log("Admin details:", {
                id: admin?._id,
                email: admin?.email
             });

            if(!admin){
                console.log('Admin not found after second lookup');

                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    error: 'wrong token'
                });
        
                return;
             }
                
                if (!admin) {
                    res.status(400).json({
                        status: 400,
                        error: `User with email: ${req.decode.email} does not exist`
                    });
                    return;
                }
                
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(password, salt);
            
                    console.log("Admin password hashed successfully");
                    
                    await admin.updateOne({
                        password: password && hashed
                    });
                    
                    await admin.save();
                    console.log("Admin password updated successfully");
                } catch (adminUpdateError) {
                    console.error("Error updating admin password:", adminUpdateError.message);
                    res.status(500).json({
                        status: 500,
                        success: false,
                        error: adminUpdateError.message
                    });
                    return;
                }
    
                // Note: For admin we likely don't need to include companyId in the token
                let registered = await Admin.findOne({ email: req.decode.email });
                console.log("Admin registered successfully");
        
                const token = utils.encodeToken(admin._id, true, admin.email);
                console.log("Generated new token for admin");
        
                res.status(200).json({
                    status: 200,
                    data: registered,
                    token: token,
                });
                return;
        } else {
            // Handle case where neither employee nor admin was found
            console.log("No matching employee or admin found for email:", req.decode.email);
            res.status(404).json({
                status: 404,
                success: false,
                error: "No matching employee or admin account found"
            });
            return;
        }
          
    } catch (error) {
        console.error("CRITICAL ERROR in verifyEmployee:", error);
        
        // Provide a more detailed error response
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || "Unknown server error",
            errorDetails: {
                name: error.name,
                stack: process.env.NODE_ENV === 'development' ? error.stack : null
            }
        });
    }
}
export default verifyEmployee;



