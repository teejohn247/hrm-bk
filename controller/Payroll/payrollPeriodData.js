// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Leave from '../../model/Expense';
// import PayrollPeriod from '../../model/PayrollPeriod';
// import Employee from '../../model/Employees';
// import PeriodPayData from '../../model/PeriodPayData';
// import Credits from '../../model/Credits';
// import Debits from '../../model/Debit';
// import SalaryScale from '../../model/SalaryScale';

// const sgMail = require('@sendgrid/mail')

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// //Convert string to camel case
// function toCamelCase(str){
//     return str.split(' ').map(function(word,index){
//       // If it is the first word make sure to lowercase all the chars.
//       if(index == 0){
//         return word.toLowerCase();
//       }
//       // If it is not the first word only upper case the first char and lowercase the rest.
//       return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//     }).join('');
//   }

// const createPayrollPeriod = async (req, res) => {

//     try {
       
//         const { payrollPeriodName, description, startDate, endDate, approvers } = req.body;

//         let company = await Company.findOne({ _id: req.payload.id });


//         let appraisal = await PayrollPeriod.findOne({ companyId:company._id,  payrollPeriodName: payrollPeriodName });
//         let employees = await Employee.find({ companyId: req.payload.id }, {_id: 1, companyRole:1, salaryLevel: 1, salaryScale: 1, companyId: 1, companyName: 1, firstName:1, lastName: 1, role:1, designationName:1, department: 1, fullName: 1, profilePic: 1})

       

//         if (!company.companyName) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'No company has been created for this account'
//             })
//             return;
//         }


//         if (appraisal) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'This period name already exist'
//             })
//             return;
//         }
//         let total = await PayrollPeriod.find();

//         const d = new Date();
//         let year = d.getFullYear();
//         let month = d.getMonth();
//         let day = d.getDay();

//         // Find employees who are assigned as approvers
//         const employeeApprovers = await Employee.find({
//             _id: { $in: approvers }
//         }).select('_id firstName lastName profilePic');

//         if (employeeApprovers.length !== approvers.length) {
//             return res.status(400).json({
//                 status: 400,
//                 error: 'One or more approver IDs are invalid'
//             });
//         }

//         let group = new PayrollPeriod({
//             companyId: req.payload.id,
//             companyName: company.companyName,
//             payrollPeriodName,
//             reference: `PAY-${month}${day}-${total.length + 1}`,
//             description, 
//             startDate, 
//             endDate,
//             approvers: employeeApprovers.map(emp => ({
//                 approverId: emp._id,
//                 approvalFullName: `${emp.firstName} ${emp.lastName}`,
//                 approvalProfilePic: emp.profilePic || ''
//             }))
//         });

//         console.log({group})

//         let dynamicFields = {};

//         // credits.length > 0 && credits.map((credit) => {
//         //     if (credit.name && typeof credit.name === 'string') {
//         //       dynamicFields[toCamelCase(credit.name)] = 0;
//         //     }
//         //   });

//         //   debits.length > 0 &&  debits.map((debit) => {
//         //     if (debit.name && typeof debit.name === 'string') {
//         //       dynamicFields[toCamelCase(debit.name)] = 0;
//         //     }
//         //   })
//         //   ;
//         // console.log({ dynamicFields });

//         // Fetch the employee with the populated salary scale and level
//         let allEmployeesDynamicFields = {};

//         // Helper function to find the exact value by refId from the database
//         const findExactValueById = async (refId) => {
//           console.log({refId})
//           const exactCredit = await Credits.findById(refId);
//           if (exactCredit) return exactCredit.value;
    
//           const exactDebit = await Debits.findById(refId);
//           if (exactDebit) return exactDebit.value;
    
//           return 0;
//         };


//         const allCredits = await Credits.find({companyId: req.payload.id})
//         const allDebits = await Debits.find({companyId: req.payload.id})

    
//         // Process each employee
//         for (const employee of employees) {


          
//           // Fetch the salary scale using employee.salaryScaleId
//           let salaryScale = await SalaryScale.findById(employee.salaryScale); // Assuming SalaryScale is the model for the salary scale data

//           console.log({salaryScale})
//           // Use payrollCredits and payrollDebits from the fetched salary scale
//           const { payrollCredits, payrollDebits } = salaryScale.salaryScaleLevels.find(level => level._id.toString() === employee.salaryLevel.toString()) || { payrollCredits: [], payrollDebits: [] };
    

//           let dynamicFields= {};

         


//           console.log({dynamicFields, payrollCredits, payrollDebits})
    
//           // Process payroll credits for the employee
//           for (const credit of payrollCredits) {
//             if (credit.name && typeof credit.name === 'string') {
//               if (credit.type === 'exact') {
//                 dynamicFields[toCamelCase(credit.name)] = credit.value;
//               } else if (credit.type === 'percentage' && credit.refId) {
//                 const exactValue = await findExactValueById(credit.refId);
//                 dynamicFields[toCamelCase(credit.name)] = (credit.value / 100) * exactValue;
//               }
//             }
//           }

    
//           // Process payroll debits for the employee
//           for (const debit of payrollDebits) {
//             if (debit.name && typeof debit.name === 'string') {
//               if (debit.type === 'exact') {
//                 dynamicFields[toCamelCase(debit.name)] = debit.value;
//               } else if (debit.type === 'percentage' && debit.refId) {
//                 const exactValue = await findExactValueById(debit.refId);
//                 dynamicFields[toCamelCase(debit.name)] = (debit.value / 100) * exactValue;
//               }
//             }
//           }

//           for (const credit of allCredits) {
//             if (credit.name && typeof credit.name === 'string') {
//               const camelCaseName = toCamelCase(credit.name);
//               if (!dynamicFields.hasOwnProperty(camelCaseName)) {
//                 dynamicFields[camelCaseName] = 0;
//               }
//             }
//           }
//           for (const debit of allDebits) {
//             if (debit.name && typeof debit.name === 'string') {
//               const camelCaseName = toCamelCase(debit.name);
//               if (!dynamicFields.hasOwnProperty(camelCaseName)) {
//                 dynamicFields[camelCaseName] = 0;
//               }
//             }
//           }

//           // console.log({
//           //   companyId: employee.companyId,
//           //   companyName: employee.companyName,
//           //   payrollPeriodId: adm._id,
//           //   firstName: employee.firstName,
//           //   lastName: employee.lastName,
//           //   fullName: employee.fullName,
//           //   employeeId: employee._id,
//           //   department: employee.department,
//           //   designation: employee.designationName,
//           //   profilePic: employee.profilePic,
//           //   role: employee.companyRole,  
//           //      // Adding keys from `debits.name` with value 0
//           //   dynamicFields: dynamicFields,
//           //   netEarnings: 0,
//           //   totalEarnings: 0,
//           //   status: 'Pending',
//           // })

     
    
//           allEmployeesDynamicFields[employee._id] = dynamicFields;

//           // const newPeriodPayData = new PeriodPayData({
//           //   companyId: employee.companyId,
//           //   companyName: employee.companyName,
//           //   // payrollPeriodId: adm._id,
//           //   firstName: employee.firstName,
//           //   lastName: employee.lastName,
//           //   fullName: employee.fullName,
//           //   employeeId: employee._id,
//           //   department: employee.department,
//           //   designation: employee.designationName,
//           //   profilePic: employee.profilePic,
//           //   role: employee.companyRole,  
//           //      // Adding keys from `debits.name` with value 0
//           //   dynamicFields: dynamicFields,
//           //   netEarnings: 0,
//           //   totalEarnings: 0,
//           //   status: 'Pending', // Default status
//           // });
//           // console.log({newPeriodPayData});

//           // const savedData = await newPeriodPayData.save();
//           // return savedData;
      
        


//         // const newPeriodPayDatas = await Promise.all(promises);
//         }
    
//         // return allEmployeesDynamicFields;

  

//         await group.save().then(async (adm) => {
//             console.log(adm)

//             const promises =  await employees.map(async (empp, i) => {

//             console.log({empp});

//             const earningsValues = Object.values(allEmployeesDynamicFields[empp._id] || {});
//             const totalEarnings = earningsValues.reduce((acc, value) => acc + value, 0);
//             const netEarnings = totalEarnings; 

//             const newPeriodPayData = new PeriodPayData({
//               companyId: empp.companyId,
//               companyName: empp.companyName,
//               payrollPeriodId: adm._id,
//               firstName: empp.firstName,
//               lastName: empp.lastName,
//               fullName: empp.fullName,
//               employeeId: empp._id,
//               department: empp.department,
//               designation: empp.designationName,
//               profilePic: empp.profilePic,
//               role: empp.companyRole,  
//               dynamicFields: allEmployeesDynamicFields[empp._id] || {},
//               netEarnings: netEarnings,
//               totalEarnings: totalEarnings,
//               status: 'Pending', // Default status
//             });

//             const savedData = await newPeriodPayData.save();
//             return savedData;
        
//           });


//           const newPeriodPayDatas = await Promise.all(promises);

         
//         const payrollPeriodData = newPeriodPayDatas.map(emp => ({
//             companyId: emp.companyId,
//             companyName: emp.companyName,
//             payrollPeriodId: adm._id,
//             firstName: emp.firstName,
//             lastName: emp.lastName, 
//             fullName: emp.fullName,
//             profilePic: emp.profilePic,
//             role: emp.companyRole, // Assigning role field from Employee model
//             bonus: 0, // Example default values
//             standard: 0,
//             basicPay: 0,
//             pension: 0,
//             insurance: 0,
//             payeTax: 0,
//             totalEarnings: 0,
//             status: 'Pending', // Default status
//           }));



//           let period = await PayrollPeriod.findOne({ _id: adm._id});
    

//           const combinedPeriodPayData = {
//             ...period.toObject(), // Convert Mongoose document to JS object
//             payrollPeriodData: [...newPeriodPayDatas]
//           };


        


//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data:  combinedPeriodPayData
//             })
//         }).catch((err) => {
//                 console.error(err)
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 })
//             })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default createPayrollPeriod;

import dotenv from 'dotenv';
import Company from '../../model/Company';
import PayrollPeriod from '../../model/PayrollPeriod';
import Employee from '../../model/Employees';
import PeriodPayData from '../../model/PeriodPayData';
import Credits from '../../model/Credits';
import Debits from '../../model/Debit';
import SalaryScale from '../../model/SalaryScale';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Convert string to camelCase
 * Example: "Basic Salary" -> "basicSalary"
 */
function toCamelCase(str) {
    return str.split(' ').map((word, index) => {
        if (index === 0) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
}

/**
 * Validate if a value is a valid MongoDB ObjectId
 */
function isValidObjectId(id) {
    return id && 
           typeof id === 'string' && 
           id.trim() !== '' && 
           mongoose.Types.ObjectId.isValid(id) &&
           id.length === 24;
}

/**
 * Create a new payroll period with employee pay data
 * @route POST /api/payroll/period/create
 */
const createPayrollPeriod = async (req, res) => {
    try {
        const { payrollPeriodName, description, startDate, endDate } = req.body;
        const userId = req.payload.id;

        // Validate required fields
        if (!payrollPeriodName || payrollPeriodName.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Payroll period name is required'
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Start date and end date are required'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid date format'
            });
        }

        if (start >= end) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'End date must be after start date'
            });
        }

        // Check if user is company or employee
        const [company, employee] = await Promise.all([
            Company.findById(userId).lean(),
            Employee.findById(userId).lean()
        ]);

        let userCompany;
        let isAuthorized = false;
        let approverCompany = null;

        if (company) {
            console.log(`[CreatePayrollPeriod] Company account detected: ${company.companyName}`);
            userCompany = company;
            isAuthorized = true;
            approverCompany = company;

        } else if (employee) {
            console.log(`[CreatePayrollPeriod] Employee account detected: ${employee.fullName}`);
            
            userCompany = await Company.findById(employee.companyId).lean();

            if (!userCompany) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found'
                });
            }

            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.payrollManagement?.create_payroll_period === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to create payroll periods. Only admins and users with payroll management permissions can create payroll periods.'
                });
            }

            approverCompany = userCompany;

        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Check for duplicate period name
        const existingPeriod = await PayrollPeriod.findOne({
            companyId: userCompany._id.toString(),
            payrollPeriodName: payrollPeriodName.trim()
        });

        if (existingPeriod) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'A payroll period with this name already exists for this company'
            });
        }

        // Check for overlapping date ranges
        const overlappingPeriod = await PayrollPeriod.findOne({
            companyId: userCompany._id.toString(),
            $or: [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                }
            ]
        });

        if (overlappingPeriod) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `A payroll period already exists for this date range: "${overlappingPeriod.payrollPeriodName}" (${overlappingPeriod.startDate.toLocaleDateString()} - ${overlappingPeriod.endDate.toLocaleDateString()})`,
                conflictingPeriod: {
                    name: overlappingPeriod.payrollPeriodName,
                    startDate: overlappingPeriod.startDate,
                    endDate: overlappingPeriod.endDate
                }
            });
        }

        // Fetch all employees
        const employees = await Employee.find(
            { 
                companyId: userCompany._id.toString(),
                $or: [
                    { employmentStatus: 'Active' },
                    { employmentStatus: { $exists: false } }
                ]
            }
        ).select('_id companyRole salaryLevel salaryScale companyId companyName firstName lastName fullName role designationName department profilePic').lean();

        if (employees.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No active employees found in this company'
            });
        }

        // ✅ VALIDATE ALL EMPLOYEES HAVE VALID SALARY SCALES AND LEVELS
        const invalidEmployees = [];

        for (const employee of employees) {
            const issues = [];

            if (!isValidObjectId(employee.salaryScale)) {
                issues.push('Missing or invalid salary scale');
            }

            if (!isValidObjectId(employee.salaryLevel)) {
                issues.push('Missing or invalid salary level');
            }

            if (issues.length > 0) {
                invalidEmployees.push({
                    employeeId: employee._id,
                    fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
                    department: employee.department || 'N/A',
                    issues: issues
                });
            }
        }

        // If there are invalid employees, return error immediately
        if (invalidEmployees.length > 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot create payroll period. ${invalidEmployees.length} employee(s) have missing or invalid salary configuration.`,
                message: 'Please assign valid salary scales and levels to all employees before creating a payroll period.',
                invalidEmployees: invalidEmployees,
                totalEmployees: employees.length,
                invalidCount: invalidEmployees.length
            });
        }

        // Generate reference number
        const periodCount = await PayrollPeriod.countDocuments({
            companyId: userCompany._id.toString()
        });

        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const reference = `PAY-${year}${month}${day}-${String(periodCount + 1).padStart(4, '0')}`;

        // Create payroll period
        const newPeriod = new PayrollPeriod({
            companyId: userCompany._id.toString(),
            companyName: userCompany.companyName,
            payrollPeriodName: payrollPeriodName.trim(),
            reference,
            description: description?.trim() || '',
            startDate: start,
            endDate: end,
            approvers: [{
                approverId: approverCompany._id.toString(),
                approvalFullName: approverCompany.companyName,
                approvalProfilePic: approverCompany.companyLogo || approverCompany.logo || ''
            }],
            status: 'Active',
            createdBy: userId
        });

        const savedPeriod = await newPeriod.save();

        console.log(`[CreatePayrollPeriod] Created period "${payrollPeriodName}" with reference: ${reference}`);

        // Fetch credits and debits in parallel
        const [allCredits, allDebits] = await Promise.all([
            Credits.find({ companyId: userCompany._id.toString() }).lean(),
            Debits.find({ companyId: userCompany._id.toString() }).lean()
        ]);

        console.log(`[CreatePayrollPeriod] Processing ${employees.length} employees`);

        // Create lookup maps
        const creditsMap = new Map(allCredits.map(c => [c._id.toString(), c]));
        const debitsMap = new Map(allDebits.map(d => [d._id.toString(), d]));

        const findValueById = (refId) => {
            const refIdStr = refId.toString();
            if (creditsMap.has(refIdStr)) {
                return creditsMap.get(refIdStr).value || 0;
            }
            if (debitsMap.has(refIdStr)) {
                return debitsMap.get(refIdStr).value || 0;
            }
            return 0;
        };

        // Process each employee's payroll data
        const periodPayDataPromises = employees.map(async (employee) => {
            try {
                // Fetch salary scale
                const salaryScale = await SalaryScale.findById(employee.salaryScale).lean();

                if (!salaryScale) {
                    console.error(`[CreatePayrollPeriod] Salary scale not found for employee ${employee._id}`);
                    return null;
                }

                // Find the specific level
                const salaryLevel = salaryScale.salaryScaleLevels?.find(
                    level => level._id.toString() === employee.salaryLevel.toString()
                );

                if (!salaryLevel) {
                    console.error(`[CreatePayrollPeriod] Salary level not found for employee ${employee._id}`);
                    return null;
                }

                const { payrollCredits = [], payrollDebits = [] } = salaryLevel;
                const dynamicFields = {};

                // Process payroll credits
                for (const credit of payrollCredits) {
                    if (credit.name && typeof credit.name === 'string') {
                        const fieldName = toCamelCase(credit.name);

                        if (credit.type === 'exact') {
                            dynamicFields[fieldName] = Number(credit.value) || 0;
                        } else if (credit.type === 'percentage' && credit.refId) {
                            const exactValue = findValueById(credit.refId);
                            dynamicFields[fieldName] = (Number(credit.value) / 100) * exactValue;
                        }
                    }
                }

                // Process payroll debits
                for (const debit of payrollDebits) {
                    if (debit.name && typeof debit.name === 'string') {
                        const fieldName = toCamelCase(debit.name);

                        if (debit.type === 'exact') {
                            dynamicFields[fieldName] = Number(debit.value) || 0;
                        } else if (debit.type === 'percentage' && debit.refId) {
                            const exactValue = findValueById(debit.refId);
                            dynamicFields[fieldName] = (Number(debit.value) / 100) * exactValue;
                        }
                    }
                }

                // Add all company credits/debits as fields
                for (const credit of allCredits) {
                    if (credit.name && typeof credit.name === 'string') {
                        const fieldName = toCamelCase(credit.name);
                        if (!dynamicFields.hasOwnProperty(fieldName)) {
                            dynamicFields[fieldName] = 0;
                        }
                    }
                }

                for (const debit of allDebits) {
                    if (debit.name && typeof debit.name === 'string') {
                        const fieldName = toCamelCase(debit.name);
                        if (!dynamicFields.hasOwnProperty(fieldName)) {
                            dynamicFields[fieldName] = 0;
                        }
                    }
                }

                // Calculate totals
                let totalEarnings = 0;
                let totalDeductions = 0;

                for (const credit of payrollCredits) {
                    const fieldName = toCamelCase(credit.name);
                    totalEarnings += Number(dynamicFields[fieldName]) || 0;
                }

                for (const debit of payrollDebits) {
                    const fieldName = toCamelCase(debit.name);
                    totalDeductions += Number(dynamicFields[fieldName]) || 0;
                }

                const netEarnings = totalEarnings - totalDeductions;

                // Create PeriodPayData record
                const periodPayData = new PeriodPayData({
                    companyId: employee.companyId,
                    companyName: employee.companyName,
                    payrollPeriodId: savedPeriod._id.toString(),
                    employeeId: employee._id.toString(),
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
                    profilePic: employee.profilePic || '',
                    department: employee.department || '',
                    designation: employee.designationName || '',
                    role: employee.companyRole || employee.role || '',
                    dynamicFields,
                    totalEarnings,
                    deductions: totalDeductions,
                    netEarnings,
                    status: 'Pending'
                });

                return await periodPayData.save();
            } catch (error) {
                console.error(`[CreatePayrollPeriod] Error processing employee ${employee._id}:`, error);
                return null;
            }
        });

        const periodPayDataResults = await Promise.all(periodPayDataPromises);
        const successfulPayData = periodPayDataResults.filter(data => data !== null);

        console.log(`[CreatePayrollPeriod] Created ${successfulPayData.length}/${employees.length} employee pay records`);

        const response = {
            ...savedPeriod.toObject(),
            payrollPeriodData: successfulPayData,
            summary: {
                totalEmployees: employees.length,
                processedEmployees: successfulPayData.length,
                failedEmployees: employees.length - successfulPayData.length
            }
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data: response,
            message: `Payroll period "${payrollPeriodName}" created successfully with ${successfulPayData.length} employee records`
        });

    } catch (error) {
        console.error('[CreatePayrollPeriod] Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Duplicate payroll period name'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating payroll period'
        });
    }
};

export default createPayrollPeriod;