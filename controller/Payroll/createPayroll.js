
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Payroll from '../../model/Payroll';

// const csv = require('csvtojson');



// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);


// const createPayroll = async (req, res) => {

//     try {

//         console.log(req.file)
       
//         const { name, description} = req.body;

//         let company = await Company.findOne({ _id: req.payload.id });

//         csv()
//         .fromFile(req.file.path)
//         .then(async (jsonObj) => {
//         console.log({jsonObj})

//         jsonObj.map((data, index) => {
//             data.companyName = company.companyName;
//             data.companyId = req.payload.id;
//         })
//         for (const data of jsonObj) {
//             console.log({data})
//             let leave = new Payroll({
//                 fields: data
//                 })

//                 console.log({leave})
        
//                 await leave.save().then((adm) => {
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
// export default createPayroll;


import dotenv from 'dotenv';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import Payroll from '../../model/Payroll';
import csv from 'csvtojson';
import fs from 'fs';

dotenv.config();

/**
 * Create payroll records from CSV upload
 * @route POST /api/payroll/create
 */
const createPayroll = async (req, res) => {
    try {
        const { name, description } = req.body;
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
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Only CSV files are allowed'
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
                employee.permissions?.payrollManagement?.create_payroll === true;
        }

        if (!isAuthorized) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to create payroll records'
            });
        }

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

        console.log(`[CreatePayroll] Processing ${jsonData.length} records from CSV`);

        // Add company information to each record
        const payrollRecords = jsonData.map(data => ({
            ...data,
            companyName: userCompany.companyName,
            companyId: userCompany._id.toString(),
            createdBy: userId.toString()
        }));

        // Create payroll records in batch
        const createdRecords = [];
        const errors = [];

        for (let i = 0; i < payrollRecords.length; i++) {
            try {
                const payroll = new Payroll({
                    fields: payrollRecords[i]
                });

                const saved = await payroll.save();
                createdRecords.push(saved);
            } catch (error) {
                errors.push({
                    row: i + 1,
                    data: payrollRecords[i],
                    error: error.message
                });
                console.error(`[CreatePayroll] Error saving record ${i + 1}:`, error);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        console.log(`[CreatePayroll] Created ${createdRecords.length}/${jsonData.length} payroll records`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Successfully processed ${createdRecords.length} out of ${jsonData.length} records`,
            data: {
                totalRecords: jsonData.length,
                successfulRecords: createdRecords.length,
                failedRecords: errors.length,
                errors: errors.length > 0 ? errors : undefined
            }
        });

    } catch (error) {
        // Clean up file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('[CreatePayroll] Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while processing payroll'
        });
    }
};

export default createPayroll;