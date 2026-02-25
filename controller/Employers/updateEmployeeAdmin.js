
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Roles from '../../model/Roles';
// import AuditTrail from '../../model/AuditTrail';
// import Company from '../../model/Company';
// import utils from '../../config/utils';
// import { emailTemp } from '../../emailTemplate';
// import addDepartment from '../Department/addDepartment';
// import Designation from "../../model/Designation";
// import Department from "../../model/Department";
// import SalaryScale from "../../model/SalaryScale"



// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const updateEmployeeAdmin = async (req, res) => {

//     try {
   
//         // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
//         // employmentType} = req.body;

//         const { firstName, lastName, email, phoneNumber, dateOfBirth, maritalStatus, salaryScaleId, nationality, nextOfKinAddress, nextOfKinFullName, nextOfKinGender, nextOfKinRelationship, nextOfKinPhoneNumber, city, country, address, personalEmail, companyRole, gender, departmentId, companyRoleId, designationId,  employmentStartDate,
//             employmentType } = req.body;

//         let company = await Company.find({ _id: req.payload.id });

//         console.log({salaryScaleId})

//         if(salaryScaleId || salaryScaleId !== ""){
//            var checkScale = await SalaryScale.findOne({_id: salaryScaleId})
//         }



//         console.log({checkScale})

//         if (!req.params.id) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Employee ID is required"
//             });
//             return;
//         }


//         const check = await Employee.findOne({ _id: req.params.id });
//         // let checkRole = await Roles.findOne({_id: companyRoleId});
//         if(designationId){
//             var checkDesignation = await Designation.findOne({_id: designationId});

//             if (!checkDesignation) {
//                 res.status(400).json({
//                     status: 400,
//                     error: "Designation doesn't exist"
//                 });
//                 return;
//             }
//         }
//         if(departmentId){
//            var checkDept = await Department.findOne({_id: departmentId});

//            if (!checkDept) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Department doesn't exist"
//             });
//             return;
//         }



//         }
      
//         if (!check) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Employee doesn't exist"
//             });
//             return;
//         }

//         Employee.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 
//                     firstName: firstName && firstName,
//                     lastName: lastName && lastName,
//                     dateOfBirth: dateOfBirth && dateOfBirth,
//                     address: address && address,
//                     personalEmail: personalEmail && personalEmail,
//                     gender: gender && gender,
//                     phoneNumber: phoneNumber && phoneNumber,
//                     country: country && country,
//                     city: city && city,
//                     maritalStatus: maritalStatus && maritalStatus,
//                     nationality: nationality && nationality,
//                     companyRole: companyRole && companyRole,
//                     designationId: designationId && designationId,
//                     designation: checkDesignation && checkDesignation.designationName,
//                     designationName:checkDesignation && checkDesignation.designationName,
//                     department: checkDept && checkDept.departmentName,
//                     departmentId: departmentId && departmentId,
//                     employmentType: employmentType && employmentType,
//                     fullName: firstName && lastName && `${firstName} ${lastName}`,
//                     salaryScaleId: salaryScaleId && salaryScaleId,
//                     salaryScale: checkScale?.name && checkScale?.name,
//                     managerId: checkDept && checkDept.managerId,
//                     managerName: checkDept && checkDept?.managerName,
//                     profilePic: req.body.image && req.body.image,
//                     nextOfKinFullName: nextOfKinFullName && nextOfKinFullName,
//                     nextOfKinAddress: nextOfKinAddress && nextOfKinAddress,
//                     nextOfKinGender: nextOfKinGender && nextOfKinGender,
//                     nextOfKinPhoneNumber: nextOfKinPhoneNumber && nextOfKinPhoneNumber,
//                     nextOfKinRelationship: nextOfKinRelationship && nextOfKinRelationship
//                 }
//         },
//             async function (
//                 err,
//                 result
//             ) {
//                 if (err) {
//                     res.status(401).json({
//                         status: 401,
//                         success: false,
//                         error: err

//                     })

//                     return;

//                 } else {

//         console.log({checkDept}, 'done')


//                     if(checkDept.managerId !== ""){
//                      console.log({result}, 'done2')

//                        const check = await Employee.findOne({ _id: checkDept.managerId });


//                        const approval = [{
//                         approvalType: 'leave',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: checkDept?.managerId
//                     },
//                     {
//                         approvalType: 'expense',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: checkDept?.managerId
//                     },
//                     {
//                         approvalType: 'appraisal',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: checkDept?.managerId
//                     }]

//                        Employee.findOneAndUpdate({ _id: req.params.id}, { 
//                         $set: { 
//                             approvals: approval
//                         }
//                    },{ upsert: true },
//                         async function (
//                             err,
//                             result
//                         ) {
//                             if (err) {
//                                 res.status(401).json({
//                                     status: 401,
//                                     success: false,
//                                     error: err
            
//                                 })
            
//                                 return;
            
//                             } else {
                                
//                             }
//                         })
//                     }  

//                     const checkUpdated = Employee.findOne({ _id: req.params.id })
//                                 AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
//                                     { $push: { humanResources: { 
//                                         userName: checkUpdated?.firstName && checkUpdated?.lastName,
//                                         email: checkUpdated?.email && checkUpdated?.email,
//                                         action: `Super admin updated ${checkUpdated?.firstName} ${checkUpdated?.lastName} records`,
//                                         dateTime: new Date()
            
//                                      }}
//                                    },
//                                         async function (
//                                             err,
//                                             result
//                                         ) {
//                                             if (err) {
//                                                 res.status(401).json({
//                                                     status: 401,
//                                                     success: false,
//                                                     error: err
                            
//                                                 })
//                                                 return;
                            
//                                             } else {
//         console.log({result}, 'done3')

                              
//                                                 const updated = await Employee.findOne({ _id: req.params.id})
                            
//                                                 res.status(200).json({
//                                                     status: 200,
//                                                     success: true,
//                                                     data: updated
//                                                 })
//                                                 return;
                            
//                                             }
//                                         })
//                 }
//             })



//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })

//         return;

//     }
// }
// export default updateEmployeeAdmin;


import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import Designation from '../../model/Designation';
import Department from '../../model/Department';
import SalaryScale from '../../model/SalaryScale';

dotenv.config();

/**
 * Update employee details (admin only)
 * Optimized version with proper error handling and async/await
 */
const updateEmployeeAdmin = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const adminId = req.payload.id;

        // Validate employee ID
        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Employee ID is required'
            });
        }

        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            maritalStatus,
            salaryScaleId,
            nationality,
            nextOfKinAddress,
            nextOfKinFullName,
            nextOfKinGender,
            nextOfKinRelationship,
            nextOfKinPhoneNumber,
            city,
            country,
            address,
            personalEmail,
            companyRole,
            gender,
            departmentId,
            designationId,
            employmentStartDate,
            employmentType,
            image
        } = req.body;

        // Parallel validation queries for better performance
        const [employee, company, designation, department, salaryScale] = await Promise.all([
            Employee.findById(employeeId).lean(),
            Company.findById(adminId).lean(),
            designationId ? Designation.findById(designationId).lean() : null,
            departmentId ? Department.findById(departmentId).lean() : null,
            salaryScaleId ? SalaryScale.findById(salaryScaleId).lean() : null
        ]);

        // Validate employee exists
        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Validate designation if provided
        if (designationId && !designation) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Designation does not exist'
            });
        }

        // Validate department if provided
        if (departmentId && !department) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Department does not exist'
            });
        }

        // Validate salary scale if provided
        if (salaryScaleId && !salaryScale) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Salary scale does not exist'
            });
        }

        // Build update object (only include fields that are provided)
        const updateData = {};
        
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (firstName && lastName) updateData.fullName = `${firstName} ${lastName}`;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (maritalStatus) updateData.maritalStatus = maritalStatus;
        if (nationality) updateData.nationality = nationality;
        if (city) updateData.city = city;
        if (country) updateData.country = country;
        if (address) updateData.address = address;
        if (personalEmail) updateData.personalEmail = personalEmail;
        if (gender) updateData.gender = gender;
        if (companyRole) updateData.companyRole = companyRole;
        if (employmentType) updateData.employmentType = employmentType;
        if (employmentStartDate) updateData.employmentStartDate = employmentStartDate;
        if (image) updateData.profilePic = image;
        if (req.body.profilePic) updateData.profilePic = req.body.profilePic;

        // Department-related fields
        if (department) {
            updateData.departmentId = departmentId;
            updateData.department = department.departmentName;
            updateData.managerId = department.managerId;
            updateData.managerName = department.managerName;
        }

        // Designation-related fields + automatic entitlement recalculation
        if (designation) {
            updateData.designationId = designationId;
            updateData.designation = designation.designationName;
            updateData.designationName = designation.designationName;

            // ── Leave entitlements ──────────────────────────────────────────
            // For each leave type in the new designation:
            //   - If employee already had this leave type, preserve daysUsed and
            //     recalculate daysLeft = newAllowance - daysUsed
            //   - If employee had no prior leave assignment, apply full allowance
            const existingLeave = employee.leaveAssignment || [];
            const newLeaveAssignment = (designation.leaveTypes || []).map(lt => {
                const prior = existingLeave.find(
                    el => el.leaveTypeId && lt.leaveTypeId && String(el.leaveTypeId) === String(lt.leaveTypeId)
                );
                const newAllowance = lt.noOfLeaveDays || 0;
                const daysUsed = prior ? (prior.daysUsed || 0) : 0;
                const daysLeft = Math.max(0, newAllowance - daysUsed);

                return {
                    leaveTypeId: lt.leaveTypeId,
                    leaveName: lt.leaveName,
                    noOfLeaveDays: newAllowance,
                    assignedNoOfDays: newAllowance,
                    description: lt.description || '',
                    daysUsed,
                    daysLeft
                };
            });
            updateData.leaveAssignment = newLeaveAssignment;

            // ── Expense card ────────────────────────────────────────────────
            // Apply the new designation's expense card settings.
            // cardBalance = new cardLimit - currentSpent (what's been spent in the current cycle).
            // totalSpent accumulates forever and is preserved.
            // If no prior expense details exist, apply full limit as balance.
            if (designation.expenseCard && designation.expenseCard.length > 0) {
                const newCard = designation.expenseCard[0];
                const newLimit = parseFloat(newCard.cardLimit) || 0;
                const currentSpent = employee.expenseDetails?.currentSpent || 0;
                const newBalance = Math.max(0, newLimit - currentSpent);

                updateData.expenseDetails = {
                    ...(employee.expenseDetails || {}),
                    expenseTypeId: newCard.expenseTypeId || employee.expenseDetails?.expenseTypeId || '',
                    cardCurrency: newCard.cardCurrency || employee.expenseDetails?.cardCurrency || '',
                    cardLimit: newLimit,
                    cardBalance: newBalance,
                    expiryDate: newCard.cardExpiryDate || employee.expenseDetails?.expiryDate || '',
                };
            }
        }

        // Salary scale fields
        if (salaryScale) {
            updateData.salaryScaleId = salaryScaleId;
            updateData.salaryScale = salaryScale.name;
        }

        // Next of kin fields
        if (nextOfKinFullName) updateData.nextOfKinFullName = nextOfKinFullName;
        if (nextOfKinAddress) updateData.nextOfKinAddress = nextOfKinAddress;
        if (nextOfKinGender) updateData.nextOfKinGender = nextOfKinGender;
        if (nextOfKinPhoneNumber) updateData.nextOfKinPhoneNumber = nextOfKinPhoneNumber;
        if (nextOfKinRelationship) updateData.nextOfKinRelationship = nextOfKinRelationship;

        updateData.updatedAt = new Date();

        // Update employee
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // If department has manager, set up approval chain
        if (department?.managerId) {
            const manager = await Employee.findById(department.managerId)
                .select('firstName lastName')
                .lean();

            if (manager) {
                const managerName = `${manager.firstName} ${manager.lastName}`;
                
                const approvals = [
                    {
                        approvalType: 'leave',
                        approval: managerName,
                        approvalId: department.managerId
                    },
                    {
                        approvalType: 'expense',
                        approval: managerName,
                        approvalId: department.managerId
                    },
                    {
                        approvalType: 'appraisal',
                        approval: managerName,
                        approvalId: department.managerId
                    }
                ];

                await Employee.findByIdAndUpdate(
                    employeeId,
                    { $set: { approvals } }
                );
            }
        }

        // Create audit trail entry
        if (company) {
            const auditEntry = {
                userName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
                email: updatedEmployee.email,
                action: `Super admin updated ${updatedEmployee.firstName} ${updatedEmployee.lastName}'s records`,
                dateTime: new Date()
            };

            await AuditTrail.findOneAndUpdate(
                { companyId: company._id },
                { $push: { humanResources: auditEntry } },
                { upsert: true }
            );
        }

        // Fetch final updated employee with all populated fields
        const finalEmployee = await Employee.findById(employeeId)
            .populate('departmentId', 'departmentName')
            .populate('designationId', 'designationName')
            .populate('salaryScaleId', 'name')
            .populate('managerId', 'firstName lastName email');

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Employee updated successfully',
            data: finalEmployee
        });

    } catch (error) {
        console.error('Error updating employee:', error);
        
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to update employee',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default updateEmployeeAdmin;
