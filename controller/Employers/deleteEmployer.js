
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Company from '../../model/Company';
// import AuditTrail from '../../model/AuditTrail';

// dotenv.config();


// const deleteEmployee = async (req, res) => {

//     try {
//         let company = await Company.find({ _id: req.payload.id });

//         let employee = await Employee.findOne({ _id: req.params.id });


//         if (!employee) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'Employee not found'
//             })
//             return;
//         }

//         Employee.remove({ _id: req.params.id },
//             function (
//                 err,
//                 result
//             ) {

//                 console.log(result)

//                 if (err) {
//                     res.status(401).json({
//                         status: 401,
//                         success: false,
//                         error: err
//                     })
//                 }
//                 else {

//                     // AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
//                     //     {
//                     //         $push: {
//                     //             humanResources: {

//                     //                 userName: `${employee.personalInformation[0].firstName} ${employee.personalInformation[0].lastName}`,
//                     //                 email: employee.officialInformation[0].officialEmail,
//                     //                 action: `Super admin deleted ${employee.personalInformation[0].firstName} ${employee.personalInformation[0].lastName} as an employee`,
//                     //                 dateTime: new Date()
//                     //             }
//                     //         }
//                     //     },
//                     //     function (
//                     //         err,
//                     //         result
//                     //     ) {
//                     //         if (err) {
//                     //             res.status(401).json({
//                     //                 status: 401,
//                     //                 success: false,
//                     //                 error: err

//                     //             })

//                     //         } else {



//                                 res.status(200).json({
//                                     status: 200,
//                                     success: true,
//                                     data: "Employee Deleted successfully!"
//                                 })
//                             // }

//                     //     })




//                 }

                
//             })


//             // const checkUpdated = await Employee.findOne({ _id: req.params.id })

//             // console.log(checkUpdated)
//             // console.log(checkUpdated.officialInformation[0].officialEmail)
//             // AuditTrail.findOneAndUpdate({ companyId: company[0]._id },
//             //     {
//             //         $push: {
//             //             humanResources: {
//             //                 userName: `${employee.personalInformation[0].firstName}  ${employee.personalInformation[0].lastName}`,
//             //                 email: employee.officialInformation[0].officialEmail,
//             //                 action: `Super admin deleted ${checkUpdated.personalInformation[0].firstName} ${checkUpdated.personalInformation[0].lastName} as an employee`,
//             //                 dateTime: new Date()
//             //             }
//             //         }
//             //     },
//             //     function (
//             //         err,
//             //         result
//             //     ) {
//             //         if (err) {
//             //             res.status(401).json({
//             //                 status: 401,
//             //                 success: false,
//             //                 error: err

//             //             })

//             //         } else {


//             //             res.status(200).json({
//             //                 status: 200,
//             //                 success: true,
//             //                 data: "Update Successful"
//             //             })

//             //         }
//             //     })

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default deleteEmployee;


import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import AuditTrail from '../../model/AuditTrail';

dotenv.config();

/**
 * Delete an employee
 * @route DELETE /api/employee/delete/:id
 */
const deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const userId = req.payload.id;

        // Validate employee ID
        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Employee ID is required'
            });
        }

        // Get employee to delete
        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAdmin = !!company;

        let isAuthorized = false;
        let userCompany = null;

        if (isCompanyAdmin) {
            // Company admin can delete employees in their company
            isAuthorized = employee.companyId === company._id.toString();
            userCompany = company;
        } else {
            // Check if user is an authorized employee
            const currentUser = await Employee.findOne({ _id: userId });

            if (!currentUser) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify employee belongs to same company
            if (employee.companyId !== currentUser.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Employee does not belong to your company'
                });
            }

            // Check permissions
            isAuthorized = 
                currentUser.isSuperAdmin === true || 
                currentUser.role === 'Admin' || 
                currentUser.roleName === 'Admin' ||
                currentUser.permissions?.employeeManagement?.delete_employee === true;

            userCompany = await Company.findOne({ _id: currentUser.companyId });
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete employees'
            });
        }

        // Store employee details for audit trail
        const employeeName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
        const employeeEmail = employee.email;

        // Delete employee using deleteOne instead of remove (deprecated)
        await Employee.deleteOne({ _id: employeeId });

        // Create audit trail entry
        try {
            await AuditTrail.findOneAndUpdate(
                { companyId: userCompany._id },
                {
                    $push: {
                        humanResources: {
                            userName: employeeName,
                            email: employeeEmail,
                            action: `Employee ${employeeName} was deleted from the system`,
                            dateTime: new Date()
                        }
                    }
                },
                { upsert: true }
            );
        } catch (auditError) {
            console.error('Failed to create audit trail:', auditError);
            // Continue even if audit trail fails
        }

        console.log(`[DeleteEmployee] Employee ${employeeName} deleted from ${userCompany.companyName}`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Employee deleted successfully',
            data: {
                deletedEmployeeId: employeeId,
                employeeName: employeeName
            }
        });

    } catch (error) {
        console.error('[DeleteEmployee] Error:', {
            error: error.message,
            stack: error.stack,
            employeeId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid employee ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting employee'
        });
    }
};

export default deleteEmployee;