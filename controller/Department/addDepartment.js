
// import dotenv from 'dotenv';
// import Department from '../../model/Department';
// import Company from '../../model/Company';
// import Employee from '../../model/Employees';
// import AppraisalGroup from '../../model/AppraisalGroup';



// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const addDepartment = async (req, res) => {

//     try {

//         const {departmentName, managerId} = req.body;
//         let departmentN = await Department.findOne({ companyId: req.payload.id, departmentName: departmentName });
//         let companyName = await Company.findOne({ _id: req.payload.id });

//         if(managerId){
//             var employee = await Employee.findOne({_id: managerId})

//             if (!employee) {

//                 res.status(400).json({
//                     status: 400,
//                     error: 'This employee does not exist'
//                 })
//                 return;
//             }
//         }

//         if (departmentN) {

//             res.status(400).json({
//                 status: 400,
//                 error: 'This department Name already exist'
//             })
//             return;
//         }

//        let department = new Department({
//             departmentName,
//             companyId: req.payload.id,
//             companyName: companyName.companyName,
//             managerName: employee ? `${employee.firstName} ${employee.lastName}` : '',
//             managerId: managerId ? managerId : ''
//         })


//         await department.save().then(async (adm) => {

//                 //        Employee.updateMany({department: department.departmentName}, { 
//                 //         $set: { 
//                 //             managerName: employee && `${employee.firstName} ${employee.lastName}`,
//                 //             managerId: managerId && managerId
//                 //         }
//                 //    },
//                 //         async function (
//                 //             err,
//                 //             result
//                 //         ) {
//                 //             if (err) {
//                 //                 res.status(401).json({
//                 //                     status: 401,
//                 //                     success: false,
//                 //                     error: err
//                 //                 })
            
//                 //             } 
//                 //         })
    
//                         if(employee){
    
//                        Employee.updateOne({_id: managerId}, { 
//                         $set: { 
//                             isManager: true
//                         }
//                    },
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
            
//                             } 
//                         })
    
//                     }
//                         // res.status(200).json({
//                         //     status: 200,
//                         //     success: true,
//                         //     data: adm
//                         // })

//                         const appraisal = await AppraisalGroup.findOne({companyId: req.payload.id, groupName: "General"})
    
                    
//                         console.log({appraisal})
//                         AppraisalGroup.findOneAndUpdate({companyId: req.payload.id,
//                             groupName : "General" }, { 
//                             $push: { assignedDepartments: {department_id: adm._id,
//                                 department_name: adm.departmentName}
//                             },
//                        },{ upsert: true },

//                             async function (
//                                 err,
//                                 result
//                             ) {
//                                 if (err) {
//                                     res.status(401).json({
//                                         status: 401,
//                                         success: false,
//                                         error: err
//                                     })
                
//                                 } else {

//                                     Department.findOneAndUpdate({ _id: adm._id}, { 
//                                         $push: { departments: {
//                                             appraisalId: appraisal._id,
//                                             appraisalName: appraisal.groupName,
//                                         }},
//                                    },{ upsert: true },
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
                            
//                                             } else {
                            
//                                                 const manager = await Department.findOne({_id: adm._id});
                            
//                                                 res.status(200).json({
//                                                     status: 200,
//                                                     success: true,
//                                                     data: manager
//                                                 })

                                                
                            
//                                             }
//                                         })
                
//                                 //     addDepartment.findOneAndUpdate({ _id:  adm._id}, { 
//                                 //         $push: { departments: {
//                                 //             appraisalId: adm._id,
//                                 //             appraisalName: adm.groupName,
//                                 //         }},
//                                 //    },{ upsert: true },
//                                 //         async function (
//                                 //             err,
//                                 //             result
//                                 //         ) {
//                                 //             if (err) {
//                                 //                 res.status(401).json({
//                                 //                     status: 401,
//                                 //                     success: false,
//                                 //                     error: err
//                                 //                 })
                            
//                                 //             } else {
                            
//                                 //                 const manager = await AppraisalGroup.findOne({_id: adm._id});
                            
//                                 //                 res.status(200).json({
//                                 //                     status: 200,
//                                 //                     success: true,
//                                 //                     data: manager
//                                 //                 })
                            
//                                 //             }
//                                 //         })
                
                
//                                 }
//                             })
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
// export default addDepartment;



import dotenv from 'dotenv';
import Department from '../../model/Department';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import AppraisalGroup from '../../model/AppraisalGroup';

dotenv.config();

/**
 * Add a new department to a company
 * @route POST /api/department/add
 * @param {Object} req - Express request object
 * @param {Object} req.body.departmentName - Name of the department
 * @param {Object} req.body.managerId - Optional ID of the manager
 * @param {Object} req.payload.id - Company ID from authentication
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with department data or error
 */
const addDepartment = async (req, res) => {
    try {
        const { departmentName, managerId } = req.body;
        const companyId = req.payload.id;

        // Input validation
        if (!departmentName || departmentName.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Department name is required'
            });
        }

        if (!companyId) {
            return res.status(401).json({
                status: 401,
                success: false,
                error: 'Unauthorized: Company ID not found'
            });
        }

        // Check if department already exists for this company
        const existingDepartment = await Department.findOne({ 
            companyId, 
            departmentName: departmentName.trim()
        });

        if (existingDepartment) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'This department name already exists'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company not found'
            });
        }

        // Validate and get manager if managerId is provided
        let employee = null;
        if (managerId) {
            employee = await Employee.findById(managerId);
            
            if (!employee) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'This employee does not exist'
                });
            }

            // Optionally verify employee belongs to the same company
            if (employee.companyId && employee.companyId.toString() !== companyId.toString()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Employee does not belong to this company'
                });
            }
        }

        // Create new department
        const department = new Department({
            departmentName: departmentName.trim(),
            companyId,
            companyName: company.companyName,
            managerName: employee ? `${employee.firstName} ${employee.lastName}` : '',
            managerId: managerId || ''
        });

        const savedDepartment = await department.save();

        // Update employee to manager status if applicable
        if (employee && managerId) {
            await Employee.findByIdAndUpdate(
                managerId,
                { $set: { isManager: true } },
                { new: false }
            );
        }

        // Get or find "General" appraisal group
        let appraisalGroup = await AppraisalGroup.findOne({
            companyId,
            groupName: "General"
        });

        // If "General" appraisal group doesn't exist, create it
        if (!appraisalGroup) {
            appraisalGroup = await AppraisalGroup.create({
                companyId,
                groupName: "General",
                assignedDepartments: []
            });
        }

        // Add department to appraisal group's assigned departments
        await AppraisalGroup.findOneAndUpdate(
            { 
                companyId, 
                groupName: "General" 
            },
            {
                $push: {
                    assignedDepartments: {
                        department_id: savedDepartment._id,
                        department_name: savedDepartment.departmentName
                    }
                }
            },
            { 
                new: true,
                upsert: true 
            }
        );

        // Add appraisal group reference to department
        await Department.findByIdAndUpdate(
            savedDepartment._id,
            {
                $push: {
                    departments: {
                        appraisalId: appraisalGroup._id,
                        appraisalName: appraisalGroup.groupName
                    }
                }
            },
            { new: true }
        );

        // Fetch the updated department with all relationships
        const updatedDepartment = await Department.findById(savedDepartment._id);

        // Log successful department creation
        console.log(`Department "${departmentName}" created successfully for company "${company.companyName}"`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedDepartment,
            message: 'Department created successfully'
        });

    } catch (error) {
        // Log error with context
        console.error('Error adding department:', {
            error: error.message,
            stack: error.stack,
            companyId: req.payload?.id,
            departmentName: req.body?.departmentName
        });

        // Handle specific MongoDB errors
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

        // Generic error response
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the department'
        });
    }
};

export default addDepartment;
