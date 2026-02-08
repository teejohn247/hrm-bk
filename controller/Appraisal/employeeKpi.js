
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Leave from '../../model/Expense';
// import AppraisalGroup from '../../model/Kpi';
// import AppraisalData from '../../model/AppraisalData';
// import Group from '../../model/AppraisalGroup';
// import AppraisalPeriod from '../../model/AppraisalPeriod';

// import Kpi from '../../model/Kpi';
// import EmployeeKpi from '../../model/EmployeeKpis';
// import Employee from '../../model/Employees';








// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const employeeKPI = async (req, res) => {

//     try {
       
//         const { name, fields, employeeId, kpiGroups,  appraisalGroup, employeeSignStatus, appraisalPeriodId, employeeComment, signature, employeeRatingId} = req.body;


//         // let company = await Company.findOne({ _id: req.payload.id });
       

//         let employee = await Employee.findOne({ _id: req.payload.id});

//         let pperiod = await AppraisalPeriod.findOne({ _id: appraisalPeriodId});
//         // let group = await AppraisalGroup.findOne({ _id: appraisalPeriodId});





//         console.log({pperiod})

//         // let appraisal = await AppraisalGroup.findOne({ companyId:company._id,  kpiName: name });

//         // console.log({appraisal})

//         // if (!company.companyName) {
//         //     res.status(400).json({
//         //         status: 400,
//         //         error: 'No company has been created for this account'
//         //     })
//         //     return;
//         // }

//         console.log({employee})

//         if (!employee) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'Employee does not exist'
//             })
//             return;
//         }

// console.log({       
//     employeeId: req.payload.id,
//     employeeName: employee.fullName,
//     profilePics: employee.profilePics,
//     managerName: employee.managerName,
//     managerId: employee.managerId,
//     matrixScore: [],
//     employeeSignedDate: new Date().toISOString(),
//     employeeSignStatus: employeeSignStatus,
//     managerSignStatus: false,
//     managerSignedDate: "",
//     companyId: req.payload.id,
//     companyName: employee.companyName,
//     status: "Awaiting Manager Approval",
//     appraisalPeriodId,
//     startDate: pperiod.startDate, 
//     endDate: pperiod.endDate,
//     activeDate: pperiod.activeDate, 
//     appraisalName: pperiod.appraisalPeriodName,
//     companyRole: employee.role,

//     inactiveDate: pperiod.inactiveDate,
//     kpiGroups,
// })
     
//        await new EmployeeKpi({
//             employeeId: req.payload.id,
//             employeeName: employee.fullName,
//             profilePics: employee.profilePics,
//             managerName: employee.managerName,
//             managerId: employee.managerId,
//             matrixScore: [],
//             employeeSignedDate: new Date().toISOString(),
//             employeeSignStatus: employeeSignStatus,
//             managerSignStatus: false,
//             managerSignedDate: "",
//             companyId: req.payload.id,
//             companyName: employee.companyName,
//             companyRole: employee.role,
//             appraisalName: pperiod && pperiod.appraisalPeriodName,
//             status: "Awaiting Manager Review",
//             // kpiDescription: kpi.kpiDescription,
//             // appraisalGroup,
//             appraisalPeriodId,
//             startDate: pperiod && pperiod.startDate, 
//             endDate: pperiod && pperiod.endDate,
//             activeDate: pperiod && pperiod.activeDate, 
//             inactiveDate:pperiod && pperiod.inactiveDate,
//             kpiGroups,
//             // "remarks.employeeComment": employeeComment,
//             // "remarks.managerName": employee ? employee.managerName : "",
//             // "remarks.employeeName": employee ? employee.fullName : "",
//             // "remarks.managerComment": "",
//             // "remarks.managerRatingId": "",
//             // "remarks.managerOverallComment": "",
//             // "remarks.employeeSubmissionDate":  new Date().toISOString(),
//             // "remarks.employeeSignature": signature,
//             // "remarks.managerSignature": false,
//             // "remarks.employeeRatingId": employeeRatingId,
//         }).save(async (err, updatedDoc) =>{
//             console.log({err})
//             if(err){
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     data: err
//                 })
//             }else{

//                 console.log(req.payload.id)

//               const data =await AppraisalData.findOne({employeeId: req.payload.id})

//               console.log({data})

//             AppraisalData.findOneAndUpdate({employeeId: req.payload.id, appraisalPeriodId:appraisalPeriodId}, {
//                     $set: {
//                         employeeId: req.payload.id,
//                         employeeName: employee.fullName,
//                         profilePics: employee.profilePics,
//                         managerName: employee.managerName,
//                         managerId: employee.managerId,
//                         email: employee.email,
//                         employeeKpiId: updatedDoc._id,
//                         kpiGroups,
//                         status: "Awaiting Manager Review"
//                     },
//                 },
//                 { new: true }, // To return the modified document
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

//               const updatedData =await AppraisalData.findOne({_id: updatedDoc._id})

//                             res.status(200).json({
//                                 status: 200,
//                                 success: true,
//                                 data: result
//                             })
//                         }
//                     })
//                 // res.status(200).json({
//                 //     status: 200,
//                 //     success: true,
//                 //     data: updatedDoc
//                 // })
//             }
          
//         })



    
//         // const dd = []
//         // await groups.save().then(async (adm) => {
//         //     console.log(adm)

//         //     let checks_group = await AppraisalGroup.find({ _id:  group},
//         //         {groupKpis: { $elemMatch: { kpiId: adm._id } } })
    
//         //                 checks_group.map((chk) => {
//         //                     if(chk.groupKpis.length > 0){
//         //                         dd.push(chk.groupKpis)
//         //                     }
//         //                 })
    
    
//         //         if(dd.length > 0){
//         //             res.status(404).json({
//         //                 status:404,
//         //                 success: false,
//         //                 error:'kpi has already been assigned to group'
//         //             })
//         //             return
//         //         }
    
//         //     Group.findOneAndUpdate({ _id: group }, { 
//         //         $push: { groupKpis: {
//         //             kpiId: adm._id,
//         //             kpiName: name,
//         //             kpiDescription: description,
//         //             fields,
//         //             "remarks.employeeComment": "",
//         //             "remarks.managerName": "",
//         //             "remarks.employeeName": "",
//         //             "remarks.managerComment": "",
//         //             "remarks.managerOverallComment": "",
//         //             "remarks.managerRatingId": "",
//         //             "remarks.employeeRatingId": "",
    
    
//         //         }},
//         //    },{ upsert: true },
//         //         async function (
//         //             err,
//         //             result
//         //         ) {
//         //             if (err) {
//         //                 res.status(401).json({
//         //                     status: 401,
//         //                     success: false,
//         //                     error: err
//         //                 })
    
//         //             } else {

//         //                 console.log({result})
    
    
//         //             }
//         //         })
//         //     res.status(200).json({
//         //         status: 200,
//         //         success: true,
//         //         data: adm
//         //     })
//         // }).catch((err) => {
//         //         console.error(err)
//         //         res.status(400).json({
//         //             status: 400,
//         //             success: false,
//         //             error: err
//         //         })
//         //     })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default employeeKPI;



import dotenv from 'dotenv';
import Company from '../../model/Company';
import AppraisalPeriod from '../../model/AppraisalPeriod';
import EmployeeKpi from '../../model/EmployeeKpis';
import AppraisalData from '../../model/AppraisalData';
import Employee from '../../model/Employees';
import Notification from '../../model/Notification';

dotenv.config();

/**
 * Submit employee KPI for appraisal period
 * @route POST /api/kpi/employee/submit
 */
const employeeKPI = async (req, res) => {
    try {
        const { 
            employeeSignStatus, 
            appraisalPeriodId, 
            kpiGroups,
            employeeComment,
            signature,
            employeeRatingId
        } = req.body;

        const employeeId = req.payload.id;

        // Validate required fields
        if (!appraisalPeriodId || appraisalPeriodId.trim() === '') {
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
                error: 'KPI groups are required'
            });
        }

        // Get employee details
        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Get appraisal period details
        const appraisalPeriod = await AppraisalPeriod.findOne({ _id: appraisalPeriodId });

        if (!appraisalPeriod) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Appraisal period not found'
            });
        }

        // Check if employee already submitted KPI for this period
        const existingKpi = await EmployeeKpi.findOne({
            employeeId: employeeId.toString(),
            appraisalPeriodId: appraisalPeriodId
        });

        if (existingKpi) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'You have already submitted KPI for this appraisal period'
            });
        }

        // Create employee KPI submission
        const employeeKpiData = new EmployeeKpi({
            employeeId: employeeId.toString(),
            employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
            profilePics: employee.profilePic || '',
            managerName: employee.managerName || '',
            managerId: employee.managerId || '',
            companyId: employee.companyId,
            companyName: employee.companyName,
            companyRole: employee.companyRole || employee.role || '',
            appraisalPeriodId,
            appraisalName: appraisalPeriod.appraisalPeriodName,
            startDate: appraisalPeriod.startDate,
            endDate: appraisalPeriod.endDate,
            activeDate: appraisalPeriod.activeDate,
            inactiveDate: appraisalPeriod.inactiveDate,
            kpiGroups,
            matrixScore: [],
            employeeSignedDate: new Date().toISOString(),
            employeeSignStatus: employeeSignStatus || false,
            managerSignStatus: false,
            managerSignedDate: '',
            status: 'Awaiting Manager Review'
        });

        const savedKpi = await employeeKpiData.save();

        console.log(`Employee KPI submitted by ${employee.fullName} for period ${appraisalPeriod.appraisalPeriodName}`);

        // Update or create AppraisalData record
        const appraisalData = await AppraisalData.findOneAndUpdate(
            {
                employeeId: employeeId.toString(),
                appraisalPeriodId: appraisalPeriodId
            },
            {
                $set: {
                    employeeId: employeeId.toString(),
                    employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
                    profilePics: employee.profilePic || '',
                    managerName: employee.managerName || '',
                    managerId: employee.managerId || '',
                    email: employee.email,
                    employeeKpiId: savedKpi._id.toString(),
                    kpiGroups,
                    status: 'Awaiting Manager Review',
                    appraisalPeriodId,
                    companyId: employee.companyId
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        // Send notification to manager
        if (employee.managerId) {
            try {
                await Notification.create({
                    notificationType: 'Appraisal Submission',
                    notificationContent: `${employee.fullName || employee.firstName} has submitted their KPI for ${appraisalPeriod.appraisalPeriodName}`,
                    recipientId: employee.managerId,
                    companyName: employee.companyName,
                    companyId: employee.companyId,
                    created_by: employeeId.toString(),
                    read: false,
                    appraisalId: savedKpi._id.toString()
                });

                console.log(`Notification sent to manager: ${employee.managerName}`);
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
                // Continue execution even if notification fails
            }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: appraisalData,
            message: 'KPI submitted successfully and sent to your manager for review'
        });

    } catch (error) {
        console.error('Error submitting employee KPI:', {
            error: error.message,
            stack: error.stack,
            employeeId: req.payload?.id
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
                error: 'Duplicate submission',
                details: 'You have already submitted KPI for this period'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while submitting KPI'
        });
    }
};

export default employeeKPI;