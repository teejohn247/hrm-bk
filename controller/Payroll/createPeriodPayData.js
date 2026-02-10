
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Payroll from '../../model/Payroll';
// import PeriodPayData from '../../model/PeriodPayData';
// import Credits from '../../model/Credits';
// import Debits from '../../model/Debit';

// const csv = require('csvtojson');



// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);


// const createPeriodPayData = async (req, res) => {

//     try {

//         console.log(req.file)
//         let company = await Company.findOne({ _id: req.payload.id });

//         let credits = await Credits.find({ companyId: company._id });
//         let debits = await Debits.find({ _id: company._id });

//         const deletePromises = [
//             await PeriodPayData.deleteMany({ payrollPeriodId: req.params.id }),
//           ]

//           await Promise.all(deletePromises)



//         csv()
//         .fromFile(req.file.path)
//         .then(async (jsonObj) => {
//         console.log({jsonObj})


//         console.log({jsonObj})

//         const jsonObjKeys = Object.keys(jsonObj[0]);

//         console.log({jsonObjKeys})

//         // Gather all unique keys from credits and debits
//           const allKeys = new Set();
//           credits.forEach((credit) => {
//           allKeys.add(credit.name);
//           });
//           debits.forEach((debit) => {
//           allKeys.add(debit.name);
//           });

// // Convert Set to array
// const allKeysArray = Array.from(allKeys);

// console.log({allKeysArray})

// // Check for missing keys
// const missingKeys = allKeysArray.filter(key => !jsonObjKeys.includes(key));

//         if (missingKeys.length === 0) {
//         console.log('All keys exist in the CSV file headers!');
//         // Proceed with further processing
//         } else {
//         console.log('Missing keys in the CSV file headers:', missingKeys.join(', '));

//         res.status(400).json({
//             status: 400,
//             success: false,
//             error: `Missing keys in the CSV file headers:', ${missingKeys.join(', ')}`
//         })
//         return
//         // Handle missing keys as needed
//         }

//         jsonObj.map((data, index) => {
//             data.companyName = company.companyName;
//             data.companyId = req.payload.id;

          
//         })
//         for (const data of jsonObj) {
//             const dynamicFields = {};
//             for (const key of allKeysArray) {
//               dynamicFields[key] = data[key] || 0;
//             }
//             const newPeriodPayData = new PeriodPayData({
//                 payrollPeriodId: req.params.id,
//                 employeeId: data.employeeIdId && data.employeeIdId,
//                 firstName: data.firstName,
//                 lastName: data.lastName,
//                 fullName:data.fullName,
//                 profilePic: data.profilePic,
//                 department: data.department,
//                 designation: data.designation,
//                 role: data.role, // Assigning role field from Employee model
//                 dynamicFields: dynamicFields,
//                 netEarnings: data.netEarnings,
//                 totalEarnings: data.totalEarnings,
//                 deductions: data.deductions,
//                 status: data.status, // Default status
//               });
        
//                 await newPeriodPayData.save().then((adm) => {
//                     console.log({adm});
                  
//                 }).catch((err) => {
//                         console.error(err)
//                         res.status(400).json({
//                             status: 400,
//                             success: false,
//                             error: err
//                         })
//                     })
//             }
//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: jsonObj
//             })
//         })
      

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default createPeriodPayData;


import dotenv from 'dotenv';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import PeriodPayData from '../../model/PeriodPayData';
import PayrollPeriod from '../../model/PayrollPeriod';
import Credits from '../../model/Credits';
import Debits from '../../model/Debit';
import csv from 'csvtojson';
import fs from 'fs';

dotenv.config();

/**
 * Create period pay data from CSV upload
 * Validates CSV headers match company credits/debits
 * @route POST /api/payroll/period/:id/pay-data
 */
const createPeriodPayData = async (req, res) => {
    try {
        const periodId = req.params.id;
        const userId = req.payload.id;

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'CSV file is required'
            });
        }

        // Validate file type
        if (!req.file.originalname.endsWith('.csv')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Only CSV files are allowed'
            });
        }

        // Validate period ID
        if (!periodId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Payroll period ID is required'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let userCompany;
        let isAuthorized = false;

        if (isCompanyAccount) {
            userCompany = company;
            isAuthorized = true;
        } else {
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            userCompany = await Company.findOne({ _id: employee.companyId });

            if (!userCompany) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found'
                });
            }

            isAuthorized = 
                employee.isManager === true ||
                employee.isSuperAdmin === true ||
                employee.role === 'Manager' ||
                employee.roleName === 'Manager' ||
                employee.permissions?.payrollManagement?.create_period_pay_data === true;
        }

        if (!isAuthorized) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to create period pay data'
            });
        }

        // Verify payroll period exists
        const payrollPeriod = await PayrollPeriod.findOne({ 
            _id: periodId,
            companyId: userCompany._id.toString()
        });

        if (!payrollPeriod) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Payroll period not found or does not belong to your company'
            });
        }

        // Get company credits and debits
        const [credits, debits] = await Promise.all([
            Credits.find({ companyId: userCompany._id.toString() }),
            Debits.find({ companyId: userCompany._id.toString() })
        ]);

        // Gather all expected field names
        const expectedFields = new Set();
        credits.forEach(credit => expectedFields.add(credit.name));
        debits.forEach(debit => expectedFields.add(debit.name));

        const expectedFieldsArray = Array.from(expectedFields);

        console.log(`[CreatePeriodPayData] Expected fields:`, expectedFieldsArray);

        // Parse CSV file
        let jsonData;
        try {
            jsonData = await csv().fromFile(req.file.path);
        } catch (csvError) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Failed to parse CSV file',
                details: csvError.message
            });
        }

        // Validate CSV has data
        if (!jsonData || jsonData.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'CSV file is empty'
            });
        }

        // Get CSV headers
        const csvHeaders = Object.keys(jsonData[0]);
        console.log(`[CreatePeriodPayData] CSV headers:`, csvHeaders);

        // Check for missing required fields
        const missingFields = expectedFieldsArray.filter(field => !csvHeaders.includes(field));

        if (missingFields.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'CSV file is missing required columns',
                missingColumns: missingFields,
                expectedColumns: expectedFieldsArray
            });
        }

        // Delete existing pay data for this period
        const deletedCount = await PeriodPayData.deleteMany({ 
            payrollPeriodId: periodId 
        });

        console.log(`[CreatePeriodPayData] Deleted ${deletedCount.deletedCount} existing records`);

        // Process CSV data
        const payDataRecords = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
            try {
                const row = jsonData[i];

                // Build dynamic fields from credits/debits
                const dynamicFields = {};
                expectedFieldsArray.forEach(field => {
                    dynamicFields[field] = parseFloat(row[field]) || 0;
                });

                const newRecord = new PeriodPayData({
                    payrollPeriodId: periodId,
                    companyId: userCompany._id.toString(),
                    companyName: userCompany.companyName,
                    employeeId: row.employeeId || row.employeeIdId || '',
                    firstName: row.firstName || '',
                    lastName: row.lastName || '',
                    fullName: row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim(),
                    profilePic: row.profilePic || '',
                    department: row.department || '',
                    designation: row.designation || '',
                    role: row.role || '',
                    dynamicFields: dynamicFields,
                    netEarnings: parseFloat(row.netEarnings) || 0,
                    totalEarnings: parseFloat(row.totalEarnings) || 0,
                    deductions: parseFloat(row.deductions) || 0,
                    status: row.status || 'Pending',
                    createdBy: userId.toString()
                });

                const saved = await newRecord.save();
                payDataRecords.push(saved);
            } catch (error) {
                errors.push({
                    row: i + 1,
                    data: jsonData[i],
                    error: error.message
                });
                console.error(`[CreatePeriodPayData] Error saving record ${i + 1}:`, error);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        console.log(`[CreatePeriodPayData] Created ${payDataRecords.length}/${jsonData.length} pay data records`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Successfully processed ${payDataRecords.length} out of ${jsonData.length} records`,
            data: {
                periodId: periodId,
                periodName: payrollPeriod.payrollPeriodName,
                totalRecords: jsonData.length,
                successfulRecords: payDataRecords.length,
                failedRecords: errors.length,
                deletedOldRecords: deletedCount.deletedCount,
                errors: errors.length > 0 ? errors : undefined
            }
        });

    } catch (error) {
        // Clean up file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('[CreatePeriodPayData] Error:', {
            error: error.message,
            stack: error.stack,
            periodId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid period ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while processing period pay data'
        });
    }
};

export default createPeriodPayData;