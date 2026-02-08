
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import LeaveRecords from '../../model/LeaveRecords';
// import Leave from '../../model/Leaves';


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



// const updateLeaveApplication = async (req, res) => {

//     try {
   
    
//         const { leaveTypeId, leaveStartDate, leaveEndDate, comments, noOfLeaveDays } = req.body;

        

//         const check = await Employee.findOne({ _id: req.payload.id });
//         // const checkManager = await Employee.findOne({ _id: check.managerId});

//         console.log({check})


//         if (!check) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Employee doesn't exist"
//             });
//             return;
//         }
      
//         const leaveType = await Leave.findOne({ _id: leaveTypeId });

     
//         if (!leaveType) {
//             res.status(400).json({
//                 status: 400,
//                 error: "leaveType doesn't exist"
//             });
//             return;
//         }
//         const approve = check.approvals.filter(obj => obj.approvalType === "leave");
//         console.log({approve});

//         const exists = check.leaveAssignment.some(obj => obj.leaveTypeId === leaveTypeId);

//         if (!exists) {
//         res.status(400).json({
//             status: 400,
//             error: "Leave doesn't exist under user profile"
//         });
//         return;
//         }

//         if (!approve && check.managerId) {
//             res.status(400).json({
//                 status: 400,
//                 error: "You have not been assigned a manager yet"
//             });
//             return;
//             }

//         LeaveRecords.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 
//                 leaveTypeId: leaveTypeId && leaveTypeId,
//                 leaveTypeName: leaveType.leaveName && leaveType.leaveName,
//                 leaveStartDate: leaveStartDate && leaveStartDate,
//                 leaveEndDate: leaveEndDate && leaveEndDate,
//                 leaveApprover: approve && approve[0].approverId,
//                 approver: approve && approve[0].approver,
//                 comments: comments && comments, 
//                 noOfLeaveDays: noOfLeaveDays && noOfLeaveDays
//             }
//        },
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

//                     // const checkUpdated = Employee.findOne({ _id: req.params.id })
//                     // AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
//                     //     { $push: { humanResources: { 
        
//                     //         userName: checkUpdated.firstName && checkUpdated.lastName,
//                     //         email: checkUpdated.email && checkUpdated.email,
//                     //         action: `Super admin updated ${checkUpdated.firstName} ${checkUpdated.lastName} records`,
//                     //         dateTime: new Date()

//                     //      }}
//                     //    },
//                     //         function (
//                     //             err,
//                     //             result
//                     //         ) {
//                     //             if (err) {
//                     //                 res.status(401).json({
//                     //                     status: 401,
//                     //                     success: false,
//                     //                     error: err
                
//                     //                 })
//                     //                 return;
                
//                     //             } else {
                
                
//                     //                 res.status(200).json({
//                     //                     status: 200,
//                     //                     success: true,
//                     //                     data: "Update Successful"
//                     //                 })
//                     //                 return;
                
//                     //             }
//                     //         })


//                             res.status(200).json({
//                                 status: 200,
//                                 success: true,
//                                 data: "Update Successful"
//                             })
//                             return;
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
// export default updateLeaveApplication;




import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import LeaveRecords from '../../model/LeaveRecords';
import Leave from '../../model/Leaves';

dotenv.config();

/**
 * Update leave application
 * Allows employee to modify their pending leave request
 */
const updateLeaveApplication = async (req, res) => {
    try {
        const leaveRecordId = req.params.id;
        const userId = req.payload.id;
        const {
            leaveTypeId,
            leaveStartDate,
            leaveEndDate,
            comments,
            noOfLeaveDays
        } = req.body;

        // Validate leave record ID
        if (!leaveRecordId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Leave record ID is required'
            });
        }

        // Parallel validation queries
        const [employee, leaveRecord, leaveType] = await Promise.all([
            Employee.findById(userId).select('approvals leaveAssignment managerId').lean(),
            LeaveRecords.findById(leaveRecordId).select('userId status').lean(),
            leaveTypeId ? Leave.findById(leaveTypeId).select('leaveName').lean() : null
        ]);

        // Validate employee exists
        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Validate leave record exists
        if (!leaveRecord) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Leave record not found'
            });
        }

        // Verify ownership - user can only update their own leave
        if (leaveRecord.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You can only update your own leave applications'
            });
        }

        // Check if leave can be edited (only pending leaves)
        if (leaveRecord.status && leaveRecord.status !== 'Pending') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot update ${leaveRecord.status.toLowerCase()} leave application`
            });
        }

        // Validate leave type if changing
        if (leaveTypeId) {
            if (!leaveType) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Leave type not found'
                });
            }

            // Check if leave type is assigned to user
            const hasLeaveType = employee.leaveAssignment?.some(
                assignment => assignment.leaveTypeId?.toString() === leaveTypeId.toString()
            );

            if (!hasLeaveType) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'This leave type is not assigned to your profile'
                });
            }
        }

        // Get leave approver
        const leaveApproval = employee.approvals?.find(
            approval => approval.approvalType === 'leave'
        );

        if (!leaveApproval && employee.managerId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No leave approver assigned. Please contact HR.'
            });
        }

        // Build update object
        const updateData = {};

        if (leaveTypeId) {
            updateData.leaveTypeId = leaveTypeId;
            updateData.leaveTypeName = leaveType.leaveName;
        }
        if (leaveStartDate) updateData.leaveStartDate = new Date(leaveStartDate);
        if (leaveEndDate) updateData.leaveEndDate = new Date(leaveEndDate);
        if (comments !== undefined) updateData.comments = comments;
        if (noOfLeaveDays) updateData.noOfLeaveDays = parseInt(noOfLeaveDays);

        // Update approver info if available
        if (leaveApproval) {
            updateData.leaveApprover = leaveApproval.approvalId;
            updateData.approver = leaveApproval.approval;
        }

        updateData.updatedAt = new Date();

        // Update leave record
        const updatedLeave = await LeaveRecords.findByIdAndUpdate(
            leaveRecordId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('leaveTypeId', 'leaveName');

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Leave application updated successfully',
            data: updatedLeave
        });

    } catch (error) {
        console.error('Error updating leave application:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to update leave application',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default updateLeaveApplication;