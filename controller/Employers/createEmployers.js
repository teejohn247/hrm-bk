
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Roles from '../../model/Role';
// import Company from '../../model/Company';
// import Department from '../../model/Department';
// import Designation from '../../model/Designation';
// import SalaryScale from '../../model/SalaryScale';
// import AuditTrail from '../../model/AuditTrail';
// import { sendEmail } from '../../config/email';




// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';
// import { date } from 'joi';
// import moment from 'moment/moment';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();


// const inviteEmployee = async (req, res) => {

//     try {

//         console.log(new Date().toISOString())
//         const { firstName, lastName, email, phoneNumber, dateOfBirth, companyRole, salaryScaleId,  gender, departmentId, companyRoleId, designationId,  employmentStartDate,
//         employmentType, reportingTo} = req.body;


//         let total = await Employee.find();

//         console.log({req})


//         // let checkRole = await Roles.findOne({_id: companyRoleId})
//         let checkDesignation = await Designation.findOne({_id: designationId})

//         if(salaryScaleId){
//             var checkScale = await SalaryScale.findOne({_id: salaryScaleId})

//         }

//         console.log({checkDesignation});

//         let checkDept= await Department.findOne({_id: departmentId})
//         // let checkName= await Employee.findOne({_id: reportingTo })
//         console.log({checkDept});

//         let company = await Company.find({ _id: req.payload.id });
//         let checkUser = await Employee.findOne({companyId: req.payload.id, email: email });


//         console.log(checkUser);

//         // const check = await Employee.findOne({ _id: managerId });

//         if (checkUser){
//             return res.status(400).json({
//                 status: 400,
//                 error: 'Email already exist'
//             })
           
//         }
//         if (!company){
//             return res.status(400).json({
//                 status: 400,
//                 error: `Company does not exist`
//             })
           
//         }

//         if (!checkDesignation){
//             return res.status(400).json({
//                 status: 400,
//                 error: `Designation does not exist`
//             })
//         }


//         console.log('hgh')
//         console.log(company)


//             let checkCompany = await Employee.find(
//                 {   companyId: req.payload.id,
//                     email: email},
                
//               );

//             var comp= false

//         if (checkCompany.length > 0){
//             checkCompany.some((chk, i) => {
//                 console.log({chk})
//                 // if(chk.officialInformation.length > 0){
//                     comp = true
//                 // }
//             })
//         }

//         if(comp == true){
//             return res.status(400).json({
//                 status: 400,
//                 error: `An employee already exist with email: ${email}`
//             })
//         }

//         const d = new Date();
//         let year = d.getFullYear();
//         // var timeNow = (new Date()).getTime().toString();
     
//         console.log('hgh')
//         console.log(lastName)
//         console.log(firstName)

//         let letter = firstName.charAt(0);
//         let last = lastName.charAt(0);


//         let leaveType = []


//         const approver = [{
//             approvalType: 'leave',
//             approval: checkDept.managerName,
//             approvalId: checkDept.managerId
//         },
//         {
//             approvalType: 'expense',
//             approval: checkDept.managerName,
//             approvalId: checkDept.managerId
//         },
//         {
//             approvalType: 'appraisal',
//             approval: checkDept.managerName,
//             approvalId: checkDept.managerId
//         },
//     ]

//     console.log({approver})

//     console.log(checkDesignation, 'it')
//        let employee = new Employee({
//             companyName: company[0].companyName,
//             companyId: req.payload.id,
//                 firstName,
//                 lastName,
//                 dateOfBirth,
//                 gender,
//                 phoneNumber,
//                 fullName: `${firstName} ${lastName}`,
//                 employeeCode: `EMP-${year}-${letter}${last}${total.length + 1}`,
//                 salaryScaleId: salaryScaleId && salaryScaleId,
//                 salaryScale:salaryScaleId && checkScale.name,
//                 // role: companyRoleId,
//                 companyRole: companyRole,
//                 // roleName: checkRole.roleName,
//                 designationName: checkDesignation.designationName,
//                 // designation: checkDesignation,
//                 designationId,
//                 departmentId: departmentId,
//                 department: checkDept.departmentName,
//                 employmentType,
//                 employmentStartDate,
//                 managerId:  checkDept.managerId && checkDept.managerId,
//                 managerName: checkDept.managerName && checkDept.managerName,
//                 email,
//                 leaveAssignment: checkDesignation.leaveTypes && checkDesignation.leaveTypes,
//                 approvals: approver,
//                 expenseDetails: {
//                     cardNo: Date.now(),
//                     cardHolder: `${firstName} ${lastName}`,
//                     dateIssued:  new Date().toISOString(),
//                     cardBalance: checkDesignation?.expenseCard[0]?.cardLimit ? checkDesignation.expenseCard[0].cardLimit : 0,
//                     cardLimit: checkDesignation?.expenseCard[0]?.cardLimit ? checkDesignation.expenseCard[0].cardLimit : 0,
//                     cardCurrency: checkDesignation?.expenseCard[0]?.cardCurrency ? checkDesignation.expenseCard[0].cardCurrency : "",
//                     cardLExpiryDate: checkDesignation?.expenseCard[0]?.cardExpiryDate ? checkDesignation.expenseCard[0].cardExpiryDate : "",
//                     expenseTypeId: checkDesignation?.expenseCard[0]?.expenseTypeId ? checkDesignation.expenseCard[0].expenseTypeId : "",
//                 }
//         })


//         await employee.save().then(async(adm) => {




//             const token = utils.encodeToken(adm._id, false, adm.email);

//             console.log({token})
    
//             console.log('{employee}')
    
//             let data = `<div>
//             <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
//             Hi ${firstName},
//             </p> 
    
//             <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
//             You have been invited to join <a href="https://makers-hrm-1086159474664.europe-west1.run.app/set-password/${token}">Makers ERP Platform</a> as an employee 
    
//             <br><br>
//             </p>
            
//             <div>`
    
//            let resp = emailTemp(data, 'Employee Invitation')

//            const receivers = [
//             {
//               email: email
//             }
//           ]
    
//             await sendEmail(req, res, email, receivers, 'Employee Invitation', resp);
    
//             console.log('{employee}2')

// console.log('checkDept.assignedAppraisals',checkDept.assignedAppraisals)
// let approverGrp = []

//             for (const group of checkDept.assignedAppraisals) {

//                 approverGrp.push({
//                     appraisalId: group.appraisalId,
//                     appraisalName: group.appraisalName})
//             }


//             Employee.findOneAndUpdate({ _id: adm._id}, { 
//                 $push: {assignedAppraisals: approverGrp},
//            },{ upsert: true },
//                 async function (
//                     err,
//                     result
//                 ) {
//                     if (err) {
//                         res.status(401).json({
//                             status: 401,
//                             success: false,
//                             error: err
//                         })
    
//                     } else {
//                         console.log('gous',{result})
    
//                         // const manager = await AppraisalGroup.findOne({_id: groupId});
    
//                         // res.status(200).json({
//                         //     status: 200,
//                         //     success: true,
//                         //     data: "Successfully assigned"
//                         // })
    
//                     }
//                 })

//             // }
//         // }else{
//         //     res.status(200).json({
//         //         status: 200,
//         //         success: true,
//         //         data: "Update Successful"
//         //     })

//         // }

















    
         
//             AuditTrail.findOneAndUpdate({ companyId: company[0]._id}, 
//                 { $push: { humanResources: { 

//                     userName: `${firstName} ${lastName}`,
//                     email: `${email}`,
//                     action: `Super admin invited ${firstName} ${lastName} as an employee`,
//                     dateTime: new Date()
//                  }}
//                },
//                     async function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
        
//                             })
        
//                         } else {

//                             console.log({result})

//                        let checkUsers = await Employee.findOne({companyId: req.payload.id, email });

        
//                                 res.status(200).json({
//                                     status: 200,
//                                     success: true,
//                                     data:checkUsers
//                                 })
//                         }
//                     })
//                 // sgMail.send(msg)
//             // console.log(adm)
//             // return res.status(200).json({
//             //     status: 200,
//             //     success: true,
//             //     data: adm
//             // })
//         }).catch((err) => {
//                 console.error(err)
//                return res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 })
//             })

   
//         // await employee.save().then((adm) => {

          
//                 // });
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default inviteEmployee;




import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Role';
import Company from '../../model/Company';
import Department from '../../model/Department';
import Designation from '../../model/Designation';
import SalaryScale from '../../model/SalaryScale';
import AuditTrail from '../../model/AuditTrail';
import { sendEmail } from '../../config/email';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import moment from 'moment/moment';

dotenv.config();

/**
 * Invite a new employee to the company
 * @route POST /api/employee/invite
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with employee data or error
 */
const inviteEmployee = async (req, res) => {
    try {
        console.log('Invite employee request received at:', new Date().toISOString());

        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            companyRole,
            salaryScaleId,
            gender,
            departmentId,
            companyRoleId,
            designationId,
            employmentStartDate,
            employmentType,
            reportingTo
        } = req.body;

        const companyId = req.payload.id;

        // Input validation
        if (!firstName || !lastName || !email || !departmentId || !designationId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Required field: Employee Start Date'
            });
        }

        if (!employmentStartDate) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Required fields: firstName, lastName, email, departmentId, designationId'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid email format'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Company does not exist'
            });
        }

        // Check if employee email already exists in this company
        const existingEmployee = await Employee.findOne({
            companyId,
            email
        });

        if (existingEmployee) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `An employee already exists with email: ${email}`
            });
        }

        // Verify designation exists
        const designation = await Designation.findById(designationId);
        if (!designation) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Designation does not exist'
            });
        }

        // Verify department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Department does not exist'
            });
        }

        // Verify salary scale if provided
        let salaryScale = null;
        if (salaryScaleId) {
            salaryScale = await SalaryScale.findById(salaryScaleId);
            if (!salaryScale) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Salary scale does not exist'
                });
            }
        }

        // Get total employees for generating employee code
        const totalEmployees = await Employee.countDocuments();

        // Generate employee code
        const currentYear = new Date().getFullYear();
        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastInitial = lastName.charAt(0).toUpperCase();
        const employeeCode = `EMP-${currentYear}-${firstInitial}${lastInitial}${totalEmployees + 1}`;

        // Setup approver array
        const approvers = [
            {
                approvalType: 'leave',
                approval: department.managerName || '',
                approvalId: department.managerId || ''
            },
            {
                approvalType: 'expense',
                approval: department.managerName || '',
                approvalId: department.managerId || ''
            },
            {
                approvalType: 'appraisal',
                approval: department.managerName || '',
                approvalId: department.managerId || ''
            }
        ];

        // Create new employee
        const employee = new Employee({
            companyName: company.companyName,
            companyId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            fullName: `${firstName} ${lastName}`,
            employeeCode,
            salaryScaleId: salaryScaleId || '',
            salaryScale: salaryScale ? salaryScale.name : '',
            companyRole: companyRole || '',
            designationName: designation.designationName,
            designationId,
            departmentId,
            department: department.departmentName,
            employmentType,
            employmentStartDate: employmentStartDate ? employmentStartDate : new Date().toISOString(),        
            managerId: department.managerId || '',
            managerName: department.managerName || '',
            email,
            leaveAssignment: designation.leaveTypes || [],
            approvals: approvers,
            expenseDetails: {
                cardNo: Date.now(),
                cardHolder: `${firstName} ${lastName}`,
                dateIssued: new Date().toISOString(),
                cardBalance: designation?.expenseCard?.[0]?.cardLimit || 0,
                cardLimit: designation?.expenseCard?.[0]?.cardLimit || 0,
                cardCurrency: designation?.expenseCard?.[0]?.cardCurrency || '',
                cardLExpiryDate: designation?.expenseCard?.[0]?.cardExpiryDate || '',
                expenseTypeId: designation?.expenseCard?.[0]?.expenseTypeId || ''
            }
        });

        // Save employee
        const savedEmployee = await employee.save();
        console.log('Employee saved successfully:', savedEmployee._id);

        // Generate token for password setup
        const token = utils.encodeToken(savedEmployee._id, false, savedEmployee.email);
        console.log('Token generated:', token);

        // Send invitation email
        const emailContent = `<div>
            <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
                Hi ${firstName},
            </p> 
            <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
                You have been invited to join <a href="https://makers-hrm-1086159474664.europe-west1.run.app/set-password/${token}">Makers ERP Platform</a> as an employee.
                <br><br>
            </p>
        </div>`;

        const emailHTML = emailTemp(emailContent, 'Employee Invitation');
        const receivers = [{ email }];

        try {
            await sendEmail(req, res, email, receivers, 'Employee Invitation', emailHTML);
            console.log('Invitation email sent successfully to:', email);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Continue execution even if email fails
        }

        // Assign appraisal groups from department
        const assignedAppraisals = department.assignedAppraisals || [];
        console.log('Department assigned appraisals:', assignedAppraisals);

        if (assignedAppraisals.length > 0) {
            const appraisalGroups = assignedAppraisals.map(group => ({
                appraisalId: group.appraisalId,
                appraisalName: group.appraisalName
            }));

            await Employee.findByIdAndUpdate(
                savedEmployee._id,
                {
                    $push: {
                        assignedAppraisals: { $each: appraisalGroups }
                    }
                },
                { new: true }
            );

            console.log('Appraisal groups assigned successfully');
        }

        // Create audit trail entry
        await AuditTrail.findOneAndUpdate(
            { companyId: company._id },
            {
                $push: {
                    humanResources: {
                        userName: `${firstName} ${lastName}`,
                        email,
                        action: `Super admin invited ${firstName} ${lastName} as an employee`,
                        dateTime: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );

        console.log('Audit trail updated');

        // Fetch the updated employee with all assignments
        const updatedEmployee = await Employee.findOne({
            companyId,
            email
        });

        console.log('Employee invitation process completed successfully');

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedEmployee,
            message: 'Employee invited successfully'
        });

    } catch (error) {
        console.error('Error inviting employee:', {
            error: error.message,
            stack: error.stack,
            companyId: req.payload?.id,
            email: req.body?.email
        });

        // Handle specific Mongoose errors
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

        // Duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Duplicate entry',
                details: 'An employee with this information already exists'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while inviting the employee'
        });
    }
};

export default inviteEmployee;
