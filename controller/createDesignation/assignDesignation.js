
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Roles from '../../model/Roles';
// import AuditTrail from '../../model/AuditTrail';
// import Company from '../../model/Company';
// import utils from '../../config/utils';
// import { emailTemp } from '../../emailTemplate';

// import Designation from "../../model/Designation";
// import Department from "../../model/Department";

// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const assignDesignation = async (req, res) => {

//     try {
   
//         // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
//         // employmentType} = req.body;

//         const { employees, designationId } = req.body;
        

//         const check = await Designation.findOne({ _id: designationId });
//         let company = await Company.findOne({ _id: req.payload.id });
//         let emp = await Employee.findOne({ _id: { $in : employees }});



//         if (!company) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Company doesn't exist"
//             });
//             return;
//         }

//         console.log({employees});

//         let ids = []
//         let ids2 = []


//         check.leaveTypes.map((chk) => {
//             ids.push(chk.leaveTypeId)
//         });

//         check.leaveTypes.map((chk) => {
//             ids2.push(chk.expenseTypeId)
//         });

//         let checks_notification = await Employee.find({ _id:  { $in: employees }},
//             { leaveAssignment: { $elemMatch: { leaveTypeId:  { $in: ids } }}})

//             console.log(checks_notification)

//             const dd = []

//             checks_notification.map((chk) => {
//                 if(chk.leaveAssignment.length > 0){
//                     dd.push(chk.leaveAssignment)
//                 }
//             })

//         let checks_expense = await Employee.find({ _id:  { $in: employees }},
//             { leaveAssignment: { $elemMatch: { expenseTypeId:  { $in: ids2 } }}})

//             console.log(checks_expense)

//             const dd2 = []

//             checks_notification.map((chk) => {
//                 if(chk.leaveAssignment.length > 0){
//                     dd.push(chk.leaveAssignment)
//                 }
//             })

//             if (dd2.length > 0) {
//                 res.status(400).json({
//                     status: 400,
//                     error: 'The expense type  has already been assigned to one of the employees'
//                 })
//                 return
//             }
            
//           Employee.updateMany({ _id: { $in : employees }}, { 
//             $push: { 
//                 leaveAssignment: check.leaveTypes,
//             }
//         },{ upsert: true },
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
//                     Employee.updateMany({ _id: { $in : employees }},
//                         { $set: {
//                             designationId: designationId,
//                             designationName: check.designationName,
//                             "expenseDetails.expenseTypeId":check.expenseCard[0].expenseTypeId,
//                             "expenseDetails.cardCurrency": check.expenseCard[0].cardCurrency,
//                             "expenseDetails.cardLimit": check.expenseCard[0].cardLimit,
//                             "expenseDetails.cardBalance": check.expenseCard[0].cardLimit,
//                             "expenseDetails.cardExpiry": check.expenseCard[0].cardExpiry,
//                          }
//                        },
//                             function (
//                                 err,
//                                 result
//                             ) {
//                                 if (err) {
//                                     res.status(401).json({
//                                         status: 401,
//                                         success: false,
//                                         error: err
                
//                                     })
//                                     return;
                
//                                 } else {
                
                
//                                     res.status(200).json({
//                                         status: 200,
//                                         success: true,
//                                         data: "Update Successful"
//                                     })
//                                     return;
                
//                                 }
//                             })

//                     // res.status(200).json({
//                     //     status: 200,
//                     //     success: true,
//                     //     data: "Update Successful"
//                     // })
//                     // return;
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
// export default assignDesignation;



import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import Designation from '../../model/Designation';

dotenv.config();

/**
 * Assign designation (role) to employees with leave types and expense cards
 * @route POST /api/employee/assign-designation
 */
const assignDesignation = async (req, res) => {
    try {
        const { employees, designationId } = req.body;
        const userId = req.payload.id;

        // Validate required fields
        if (!designationId || designationId.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Designation ID is required'
            });
        }

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'At least one employee ID is required'
            });
        }

        // Get company
        const company = await Company.findOne({ _id: userId });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company not found'
            });
        }

        // Get designation details
        const designation = await Designation.findOne({ _id: designationId });

        if (!designation) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Designation not found'
            });
        }

        // Verify designation belongs to this company
        if (designation.companyId !== company._id.toString()) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'Designation does not belong to your company'
            });
        }

        // Verify all employees exist and belong to this company
        const employeesToUpdate = await Employee.find({
            _id: { $in: employees },
            companyId: company._id.toString()
        });

        if (employeesToUpdate.length !== employees.length) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'One or more employees not found or do not belong to your company'
            });
        }

        // Check for duplicate leave type assignments
        if (designation.leaveTypes && designation.leaveTypes.length > 0) {
            const leaveTypeIds = designation.leaveTypes.map(lt => lt.leaveTypeId);

            // Find employees who already have these leave types assigned
            const employeesWithLeaves = await Employee.find({
                _id: { $in: employees },
                'leaveAssignment.leaveTypeId': { $in: leaveTypeIds }
            });

            if (employeesWithLeaves.length > 0) {
                const employeeNames = employeesWithLeaves.map(emp => 
                    emp.fullName || `${emp.firstName} ${emp.lastName}`
                ).join(', ');

                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: `Some leave types are already assigned to: ${employeeNames}`
                });
            }
        }

        // Prepare expense details if available
        let expenseUpdate = {};
        if (designation.expenseCard && designation.expenseCard.length > 0) {
            const expenseCard = designation.expenseCard[0];
            expenseUpdate = {
                'expenseDetails.expenseTypeId': expenseCard.expenseTypeId,
                'expenseDetails.cardCurrency': expenseCard.cardCurrency,
                'expenseDetails.cardLimit': expenseCard.cardLimit,
                'expenseDetails.cardBalance': expenseCard.cardLimit,
                'expenseDetails.cardExpiry': expenseCard.cardExpiry || expenseCard.cardExpiryDate
            };
        }

        // Update employees with designation and leave types
        const updatePromises = employees.map(async (employeeId) => {
            const updateData = {
                $set: {
                    designationId: designationId,
                    designationName: designation.designationName,
                    ...expenseUpdate
                }
            };

            // Add leave types if they exist
            if (designation.leaveTypes && designation.leaveTypes.length > 0) {
                updateData.$push = {
                    leaveAssignment: { $each: designation.leaveTypes }
                };
            }

            return Employee.findByIdAndUpdate(
                employeeId,
                updateData,
                { new: true }
            );
        });

        const updatedEmployees = await Promise.all(updatePromises);

        console.log(`[AssignDesignation] Assigned designation "${designation.designationName}" to ${employees.length} employees`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Designation assigned successfully to ${employees.length} employee(s)`,
            data: {
                designationName: designation.designationName,
                employeesUpdated: updatedEmployees.length,
                leaveTypesAdded: designation.leaveTypes?.length || 0,
                expenseCardAssigned: !!designation.expenseCard && designation.expenseCard.length > 0
            }
        });

    } catch (error) {
        console.error('[AssignDesignation] Error:', {
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

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while assigning designation'
        });
    }
};

export default assignDesignation;