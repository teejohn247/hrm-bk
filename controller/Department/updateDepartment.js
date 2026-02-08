
// import dotenv from 'dotenv';
// import Department from '../../model/Department';
// import Employee from '../../model/Employees';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const updateDepartment = async (req, res) => {

//     try {

//         const {departmentName, managerId} = req.body;
//         const department = await Department.findOne({_id: req.params.id})

//         if(managerId !== ""){
//             var employee = await Employee.findOne({_id: managerId})
//             var check = await Employee.findOne({ _id: managerId });
//         }
       

//         console.log({employee})
//         console.log({department})



//         if(!department){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'No department Found'
//             })
//             return
//         }

//         Department.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 
//                 departmentName: departmentName && departmentName,
//                 managerName: employee !== undefined && `${employee?.firstName} ${employee?.lastName}`,
//                 managerId: managerId !== "" && managerId
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

//                 } else {
//                     if(managerId !== ""){

//                     const approval = [{
//                         approvalType: 'leave',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: managerId
//                     },
//                     {
//                         approvalType: 'expense',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: managerId
//                     },
//                     {
//                         approvalType: 'appraisal',
//                         approval: `${check?.firstName} ${check?.lastName}`,
//                         approvalId: managerId
//                     },
//                 ]
//                    Employee.updateMany({department: department.departmentName}, { 
//                     $set: { 
//                         managerName: employee && `${employee.firstName} ${employee.lastName}`,
//                         managerId: managerId,
//                         approvals: approval
//                     }
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
        
//                         } 
//                     })


//                    Employee.updateOne({_id: managerId}, { 
//                     $set: { 
//                         isManager: true
//                     }
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
        
//                         } 
//                     })

//                 }
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: "Update Successful"
//                     })

//                 }
//             })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default updateDepartment;


import dotenv from 'dotenv';
import Department from '../../model/Department';
import Employee from '../../model/Employees';

dotenv.config();

const updateDepartment = async (req, res) => {
    try {
        const { departmentName, managerId } = req.body;

        // Use lean() for read queries
        const department = await Department.findOne({ _id: req.params.id }).lean();

        if (!department) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'No department found'
            });
        }

        let employee = null;
        if (managerId && managerId !== "") {
            employee = await Employee.findOne({ _id: managerId }).lean();
            
            if (!employee) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Manager not found'
                });
            }
        }

        // Build update object
        const updateFields = {};
        if (departmentName) updateFields.departmentName = departmentName;
        if (employee) {
            updateFields.managerName = `${employee.firstName} ${employee.lastName}`;
            updateFields.managerId = managerId;
        }

        // Update department
        await Department.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateFields },
            { new: true, lean: true }
        );

        // If manager was assigned, update all employees in department
        if (managerId && managerId !== "" && employee) {
            const managerFullName = `${employee.firstName} ${employee.lastName}`;
            
            const approval = [
                {
                    approvalType: 'leave',
                    approval: managerFullName,
                    approvalId: managerId
                },
                {
                    approvalType: 'expense',
                    approval: managerFullName,
                    approvalId: managerId
                },
                {
                    approvalType: 'appraisal',
                    approval: managerFullName,
                    approvalId: managerId
                }
            ];

            // Update all employees in this department
            await Employee.updateMany(
                { department: department.departmentName },
                {
                    $set: {
                        managerName: managerFullName,
                        managerId: managerId,
                        approvals: approval
                    }
                }
            );

            // Set manager flag
            await Employee.updateOne(
                { _id: managerId },
                { $set: { isManager: true } }
            );
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: "Update successful"
        });

    } catch (error) {
        console.error('Update department error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default updateDepartment;


