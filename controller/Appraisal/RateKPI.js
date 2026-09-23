
// import dotenv from 'dotenv';
// import Kpi from '../../model/Kpi';
// import Employee from '../../model/Employees'
// import EmployeeKpi from '../../model/EmployeeKpis'
// import AppraisalData from '../../model/AppraisalData';




// dotenv.config();


// const rateKPI = async (req, res) => {

//     try {



//         const { id, kpiId, managersSignature, matrixScore,  managerSignStatus, appraisalPeriodId,  managerOverallComment,  kpiGroups} = req.body;
//         let groups = [];

//         // const appraisal = await AppraisalGroup.findOne({_id: groups})
//         // const appraisalGroups = await AppraisalGroup.find({
//         //     'groupKpis.kpiId': kpiId,
//         //   });


//         //   appraisalGroups.map((grp) => {
//         //     groups.push(grp._id)
//         //   })


//         const employee = await Employee.findOne({_id: req.payload.id})

//         if(!employee){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'Employee does not exist'
//             })
//             return
//         }
//         // if(!groups){
//         //     res.status(404).json({
//         //         status:404,
//         //         success: false,
//         //         error:'KPI has not been assigned to any group'
//         //     })
//         //     return
//         // }


//         // if(!kpiId){
//         //     res.status(404).json({
//         //         status:404,
//         //         success: false,
//         //         error:'kpiId Not Found'
//         //     })
//         //     return
//         // }

//         // if(!kpi){
//         //     res.status(404).json({
//         //         status:404,
//         //         success: false,
//         //         error:'Kpi does not exist'
//         //     })
//         //     return
//         // }

//             const dd = []

//         //  let checks_group = await AppraisalGroup.find({ _id:  { $in: groups }},
//         //     {groupKpis: { $elemMatch: { kpiId: kpiId } } })

//         //             checks_group.map((chk) => {
//         //                 if(chk.groupKpis.length > 0){
//         //                     dd.push(chk.groupKpis)
//         //                 }
//         //             })


//             // if(dd.length > 0){
//             //     res.status(404).json({
//             //         status:404,
//             //         success: false,
//             //         error:'kpi has already been assigned to group'
//             //     })
//             //     return
//             // }
//   // {
//         //     kpiId: { type: String },
//         //     kpiName: { type: String },
//         //     kpiDescription: { type: String },
//         //     employeeId:{ type: String },
//         //     employeeName: { type: String },
//         //     profilePics: { type: String },
//         //     ratingId: { type: String },
//         //     ratingName: { type: String },
//         //     fields: {
//         //         type: Map,
//         //         of: mongoose.Schema.Types.Mixed,
//         //     },
//         //     ratingDescription: { type: String },
//         //     remarks: { 
//         //         employeeRatingId: { type: String },
//         //         employeeName: { type: String },
//         //         managerRatingId: { type: String },
//         //         managerName: { type: String },
//         //         employeeComment: { type: String },
//         //         managerComment: { type: String },
//         //         managerOverallComment: { type: String },
//         //         employeeSubmissionDate: { type: String },
//         //         managerReviewDate:{ type: String },
//         //         managerSignature: {type: Boolean},
//         //         employeeSignature: {type: Boolean}
//         //      },
//         // }





//         EmployeeKpi.updateOne({ _id: req.params.id}, { 
//             $set: {
//                 // kpiId: kpiId,
//                 // kpiName: kpi.kpiName,
//                 // kpiDescription: kpi.kpiDescription,
//                 matrixScore,
//                 managerSignedDate: new Date().toISOString(),
//                 managerOverallComment,
//                 managerSubmissionDate: new Date().toISOString(),
//                 managersSignature,
//                 managerSignStatus,
//                 appraisalPeriodId,
//                 matrixScore,
//                 kpiGroups,
//                 status: "Manager reviewed",

           
//             },
//        },{ upsert: true },
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

//                 } else {

               
//             AppraisalData.findOneAndUpdate({employeeKpiId: req.params.id, appraisalPeriodId:appraisalPeriodId}, {
//                 $set: {
//                     matrixScore,
//                     managerSignedDate: new Date().toISOString(),
//                     managerOverallComment,
//                     managersSignature: managerSignStatus,
//                     managerSignStatus: managerSignStatus,
//                     appraisalPeriodId,
//                     managerSubmissionDate: new Date().toISOString(),
//                     matrixScore,
//                     kpiGroups,
//                     status: "Manager reviewed",
//                 },
//             },
//             { new: true }, // To return the modified document
//                 function (
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
//                         res.status(200).json({
//                             status: 200,
//                             success: true,
//                             data: "Success"
//                         })
//                     }
//                 })
//                 }
//             })

//     //     AppraisalGroup.updateMany({ _id: { $in : groups }}, { 
//     //         $set: { groupKpis: {
//     //             // kpiId: kpiId,
//     //             // kpiName: kpi.kpiName,
//     //             // kpiDescription: kpi.kpiDescription,
//     //             "remarks.employeeComment": employeeComment,
//     //             "remarks.managerName": "",
//     //             "remarks.employeeName": employee ? employee.fullName : "",
//     //             "remarks.managerComment": "",
//     //             "remarks.managerRatingId": "",
//     //             "remarks.managerOverallComment": "",
//     //             "remarks.employeeSubmissionDate": new Date(),
//     //             "remarks.employeeSignature": signature,
//     //             "remarks.managerSignature": false,
//     //             "remarks.employeeRatingId": employeeRatingId,

//     //         }},
//     //    },{ upsert: true },
//     //         async function (
//     //             err,
//     //             result
//     //         ) {
//     //             if (err) {
//     //                 res.status(401).json({
//     //                     status: 401,
//     //                     success: false,
//     //                     error: err
//     //                 })

//     //             } else {

//     //                 // const manager = await AppraisalGroup.findOne({_id: groupId});

//     //                 res.status(200).json({
//     //                     status: 200,
//     //                     success: true,
//     //                     data: "Successfully assigned"
//     //                 })

//     //             }
//     //         })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default rateKPI;



import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeKpi from '../../model/EmployeeKpis';
import AppraisalData from '../../model/AppraisalData';
import Notification from '../../model/Notification';

dotenv.config();

/**
 * Manager rates employee KPI submission
 * @route PUT /api/kpi/rate/:id
 * @param {String} id - EmployeeKpi ID
 */
const rateKPI = async (req, res) => {
    try {
        const { 
            managersSignature, 
            matrixScore,  
            managerSignStatus, 
            appraisalPeriodId,  
            managerOverallComment,  
            kpiGroups
        } = req.body;

        const employeeKpiId = req.params.id;
        const managerId = req.payload.id;

        // Validate required fields
        if (!employeeKpiId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Employee KPI ID is required'
            });
        }

        if (!appraisalPeriodId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Appraisal period ID is required'
            });
        }

        if (!kpiGroups || kpiGroups.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'KPI groups with ratings are required'
            });
        }

        // Get manager details
        const manager = await Employee.findOne({ _id: managerId });

        if (!manager) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Manager not found'
            });
        }

        console.log({manager});

        // Check if manager has permission to rate
        if (!manager.isManager && !manager.isSuperAdmin) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to rate employee KPIs'
            });
        }


        // Get the employee KPI submission
        const employeeKpi = await EmployeeKpi.findOne({ _id: employeeKpiId });

        if (!employeeKpi) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee KPI submission not found'
            });
        }

        const employee = await Employee.findOne({ _id: employeeKpi.employeeId });

        console.log({employee});

        // Verify manager is authorized to rate this employee
        if (employee.managerId !== managerId.toString() && !manager.isSuperAdmin) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You are not authorized to rate this employee'
            });
        }

        // Check if already rated
        if (employeeKpi.managerSignStatus) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'This KPI submission has already been rated by a manager'
            });
        }

        // Update EmployeeKpi with manager's ratings
        const updatedEmployeeKpi = await EmployeeKpi.findByIdAndUpdate(
            employeeKpiId,
            {
                $set: {
                    matrixScore: matrixScore || [],
                    managerSignedDate: new Date().toISOString(),
                    managerOverallComment: managerOverallComment || '',
                    managerSubmissionDate: new Date().toISOString(),
                    managersSignature: managersSignature || false,
                    managerSignStatus: managerSignStatus || false,
                    kpiGroups,
                    status: 'Manager Reviewed'
                }
            },
            { new: true }
        );

        // Update AppraisalData with manager's ratings
        const updatedAppraisalData = await AppraisalData.findOneAndUpdate(
            {
                employeeKpiId: employeeKpiId,
                appraisalPeriodId: appraisalPeriodId
            },
            {
                $set: {
                    matrixScore: matrixScore || [],
                    managerSignedDate: new Date().toISOString(),
                    managerOverallComment: managerOverallComment || '',
                    managersSignature: managerSignStatus || false,
                    managerSignStatus: managerSignStatus || false,
                    managerSubmissionDate: new Date().toISOString(),
                    kpiGroups,
                    status: 'Manager Reviewed'
                }
            },
            { new: true }
        );

        // Send notification to employee
        try {
            await Notification.create({
                notificationType: 'Appraisal Reviewed',
                notificationContent: `Your manager ${manager.fullName || manager.firstName} has reviewed your KPI submission`,
                recipientId: employeeKpi.employeeId,
                companyName: manager.companyName,
                companyId: manager.companyId,
                created_by: managerId.toString(),
                read: false,
                appraisalId: employeeKpiId
            });

            console.log(`Notification sent to employee: ${employeeKpi.employeeName}`);
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Continue execution even if notification fails
        }

        console.log(`Manager ${manager.fullName || manager.firstName} rated KPI for employee ${employeeKpi.employeeName}`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedAppraisalData || updatedEmployeeKpi,
            message: 'KPI rated successfully and employee has been notified'
        });

    } catch (error) {
        console.error('Error rating KPI:', {
            error: error.message,
            stack: error.stack,
            managerId: req.payload?.id,
            employeeKpiId: req.params?.id
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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while rating KPI'
        });
    }
};

export default rateKPI;