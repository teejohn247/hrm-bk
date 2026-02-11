// // import dotenv from "dotenv";
// // import Company from "../../model/Company";
// // import Designation from "../../model/Designation";
// // import Leave from "../../model/Leaves";
// // import Expense from "../../model/Expense";
// // import Employee from "../../model/Employees";



// // const sgMail = require("@sendgrid/mail");

// // dotenv.config();

// // sgMail.setApiKey(process.env.SENDGRID_KEY);

// // const updateDesignation = async (req, res) => {
// //   try {
// //     const { designationName, description, leaveAssignment, expenseCard} = req.body;
// //     let company = await Company.findOne({ _id: req.payload.id });

// //     let designation = await Designation.findOne({
// //       companyId: company._id,
// //       designationName: designationName,
// //     });

// //     console.log({ company });

// //     if (!company.companyName) {
// //       res.status(400).json({
// //         status: 400,
// //         error: "No company has been created for this account",
// //       });
// //       return;
// //     }

// //     // if (designation) {
// //     //   res.status(400).json({
// //     //     status: 400,
// //     //     error: "This designation name already exist",
// //     //   });
// //     //   return;
// //     // }
// //     if (!leaveAssignment) {


// //         Designation.findOneAndUpdate({ _id: req.params.id}, { 
// //             $set: { 

// //                 designationName: designationName && designationName,
// //                 companyId: req.payload.id,
// //                 companyName: company.companyName && company.companyName,
// //                 description: description && description,
// //             }
// //        },
// //             async function (
// //                 err,
// //                 result
// //             ) {
// //                 if (err) {
// //                     res.status(401).json({
// //                         status: 401,
// //                         success: false,
// //                         error: err

// //                     })

// //                     return;

// //                 } else {
// //                     res.status(200).json({
// //                         status: 200,
// //                         success: true,
// //                         data: "Update Successful"
// //                       });
// //                       return;

// //                 }})

// //       return
// //     } 
// //     let leaves = [];
// //     var leaveTypes = [];
// //     var exp = [];
// //     var expenseTypes = [];

// //     console.log({leaveAssignment})

// //     leaveAssignment.map((data, index) => {
// //       if (!data) {
// //         res.status(400).json({
// //           status: 400,
// //           error: "Leave id field is compulsory",
// //         });
// //         return;
// //       }
// //       leaves.push(data.leaveTypeId);
// //     });

// //     console.log({ leaves });

// //     const resp = await Leave.find({ _id: { $in: leaves } });
// //     console.log({ resp });


// //     if (!resp || resp.length < 1) {
         
// //       res.status(400).json({
// //         status: 400,
// //         error: "Leave type does not exist",
// //       });
// //       return 
// //     }

// //     console.log({ resp });

// //     const leaveTypePromises = leaveAssignment.map(async (resp) => {
// //       const leave = await Leave.findOne({ _id: resp.leaveTypeId });
    
// //       const leaveType = {
// //         leaveTypeId: resp.leaveTypeId,
// //         leaveName: leave ? leave.leaveName : 'Unknown', // Add a default value in case leave is not found
// //         noOfLeaveDays: resp.noOfLeaveDays,
// //       };
    
// //       console.log(leaveType, "148");
    
// //       leaveTypes.push(leaveType);
// //     });
    
// //     // Wait for all the promises to complete
// //     await Promise.all(leaveTypePromises);
// //     console.log(leaveTypes, "080");

// //     // let leaveDays


// //     // await leaveAssignment.map((assign, index) => {

// //     //   console.log(assign)
// //     //   console.log('tedghj',resp._id)


// //     //   if(resp._id == assign.leaveTypeId){
// //     //      leaveDays = assign.noOfLeaveDays
// //     //   }

// //     // })
// //     console.log({expenseCard});


// //     // Handle the success case here
// //     // leaveTypes.push({
// //     //   leaveTypeId: resp._id,
// //     //   leaveName: resp.leaveName,
// //     //   noOfLeaveDays: Number(leaveDays),
// //     // });
  
// //     //  await expenseCard.map((data, index) => {
// //     // console.log({data})

// //     //   if (!data) {
// //     //     res.status(400).json({
// //     //       status: 400,
// //     //       error: "Expense id field is compulsory",
// //     //     });
// //     //     return;
// //     //   }

// //     //   exp.push(data.expenseTypeId);
// //     // });

// //     // console.log({exp})

// //     //   const check = await Expense.find({ _id: {$in: exp} });

// //     //   console.log({ check });

// //     //   if (!check || check.length < 1) {
         
// //     //     res.status(400).json({
// //     //       status: 400,
// //     //       error: "Expense type does not exist",
// //     //     });
// //     //     return 
// //     //   } else{


// //     //     let expenseCurrency
// //     //     let expenseBal
// //     //     let expenseExpiry
// //     //     let expenseLimit




// //     //     await expenseCard.map((assign, index) => {

// //     //       if(check._id == assign.expenseTypeId){
// //     //         expenseCurrency = assign.cardCurrency
// //     //         expenseExpiry = assign.cardExpiryDate
// //     //         expenseLimit = assign.cardLimit
// //     //       }

// //     //     })

// //     //     expenseTypes.push({
// //     //       expenseTypeId: check._id,
// //     //       expenseCardName: check.expenseCardName,
// //     //       cardCurrency: expenseCurrency,
// //     //       cardExpiryDate: expenseExpiry,
// //     //       cardLimit: expenseLimit,
// //     //     });
// //     //   }

      
// //     // });

// //     // Promise.all(leavePromises, expensePromises)
// //     //   .then(async () => {

// //         // console.log(leaveAssignment);


// //         // expenseTypes.push({
// //         //   cardCurrency: expenseCurrency,
// //         //   cardExpiryDate: expenseExpiry,
// //         //   cardLimit: expenseLimit,
// //         // });

// //         Designation.findOneAndUpdate({ _id: req.params.id}, { 
// //             $set: { 
    
// //                 designationName: designationName && designationName,
// //                 companyId: req.payload.id,
// //                 companyName: company.companyName && company.companyName,
// //                 description: description && description,
// //                 leaveTypes: leaveTypes && leaveTypes,
// //                 expenseCard
// //             }
// //        },
// //             async function (
// //                 err,
// //                 result
// //             ) {
// //                 if (err) {
// //                     res.status(401).json({
// //                         status: 401,
// //                         success: false,
// //                         error: err
    
// //                     })
    
// //                     return;
    
// //                 } else {


// //                   for (const documentId of leaves) {
// //                     // Fetch each document
// //                     Employee.findOne({ companyId: req.payload.id, "leaveAssignment.leaveTypeId": documentId }, (err, document) => {
// //                       if (err) {
// //                         // Handle error
// //                         console.error(err);
// //                         return;
// //                       }
// //                       console.log({document}, 'kk')

// //                       // Update the arrayField in each document
// //                       // for (const newObj of leaveTypes) {


// //                       //   if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
// //                       //   }else{
// //                       //     document.leaveAssignment.push(newObj);
// //                       //   }
// //                       // }
// //                       // console.log(leaveTypes)

// //                       // Ensure leaveAssignment is an array before processing
// //                       document.leaveAssignment = document.leaveAssignment || [];

// //                       for (const newObj of leaveTypes) {
// //                           // Check if leaveTypeId is already in leaveAssignment
// //                           if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
// //                               // If not found, push the new object
// //                               document.leaveAssignment.push(newObj);
// //                           }
// //                       }

// //                       console.log(leaveTypes);

                  
// //                       // Save the updated document
// //                       document.save((err, updatedDoc) => {
// //                         if (err) {
// //                           // Handle save error
// //                           console.error(err);


// //                         res.status(400).json({
// //                           status: 400,
// //                          success: true,
// //                                data: err
// //                              });
// //                           return;
// //                         }

                      
                  
// //                         // Updated document is now in 'updatedDoc'
// //                         console.log("Updated document:", updatedDoc);
// //                       });
// //                     });
// //                   }

// //                   res.status(200).json({
// //                     status: 200,
// //                    success: true,
// //                          data: result
// //                        });
// //             }
// //           });
   
// //     }
     

  


// //  catch (error) {
// //     res.status(500).json({
// //       status: 500,
// //       success: false,
// //       error: error,
// //     });
// //   }
// // };
// // export default updateDesignation;


// import dotenv from "dotenv";
// import Company from "../../model/Company";
// import Designation from "../../model/Designation";
// import Leave from "../../model/Leaves";
// import Expense from "../../model/Expense";
// import Employee from "../../model/Employees";

// dotenv.config();

// const updateDesignation = async (req, res) => {
//     try {
//         const { designationName, description, leaveAssignment, expenseCard } = req.body;
//         const designationId = req.params.id;
//         const companyId = req.payload.id;

//         // Validate designation ID
//         if (!designationId) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "Designation ID is required"
//             });
//         }

//         // Get company details
//         const company = await Company.findOne({ _id: companyId });

//         if (!company || !company.companyName) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "No company has been created for this account"
//             });
//         }

//         // Check if designation exists
//         const existingDesignation = await Designation.findOne({ _id: designationId });

//         if (!existingDesignation) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: "Designation not found"
//             });
//         }

//         // Check for duplicate designation name (if name is being changed)
//         if (designationName && designationName !== existingDesignation.designationName) {
//             const duplicateDesignation = await Designation.findOne({
//                 companyId: company._id,
//                 designationName: designationName,
//                 _id: { $ne: designationId } // Exclude current designation
//             });

//             if (duplicateDesignation) {
//                 return res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: "This designation name already exists"
//                 });
//             }
//         }

//         // Prepare update data
//         const updateData = {
//             companyId: companyId.toString(),
//             companyName: company.companyName
//         };

//         if (designationName) updateData.designationName = designationName.trim();
//         if (description) updateData.description = description.trim();

//         // If no leave assignment, just update basic fields
//         if (!leaveAssignment || leaveAssignment.length === 0) {
//             const updatedDesignation = await Designation.findByIdAndUpdate(
//                 designationId,
//                 { $set: updateData },
//                 { new: true }
//             );

//             console.log(`Designation "${designationName || existingDesignation.designationName}" updated (no leave changes)`);

//             return res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: updatedDesignation,
//                 message: "Designation updated successfully"
//             });
//         }

//         // Process leave assignments
//         const leaveTypeIds = leaveAssignment.map(assign => assign.leaveTypeId).filter(Boolean);

//         if (leaveTypeIds.length === 0) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "Leave type IDs are required in leave assignment"
//             });
//         }

//         // Validate all leave types exist
//         const leaveTypes = await Leave.find({ _id: { $in: leaveTypeIds } });

//         if (leaveTypes.length !== leaveTypeIds.length) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "One or more leave types do not exist"
//             });
//         }

//         // Build leave assignment array with details
//         const leaveTypesData = await Promise.all(
//             leaveAssignment.map(async (assign) => {
//                 const leave = await Leave.findOne({ _id: assign.leaveTypeId });
                
//                 if (!leave) {
//                     return null;
//                 }

//                 return {
//                     leaveTypeId: assign.leaveTypeId,
//                     leaveName: leave.leaveName,
//                     noOfLeaveDays: assign.noOfLeaveDays || 0
//                 };
//             })
//         );

//         // Filter out any null values
//         const validLeaveTypes = leaveTypesData.filter(Boolean);

//         // Add leave types and expense card to update data
//         updateData.leaveTypes = validLeaveTypes;
        
//         if (expenseCard) {
//             updateData.expenseCard = expenseCard;
//         }

//         // Update designation
//         const updatedDesignation = await Designation.findByIdAndUpdate(
//             designationId,
//             { $set: updateData },
//             { new: true }
//         );

//         // Update all employees with this designation to add new leave types
//         const employees = await Employee.find({
//             companyId: companyId.toString(),
//             designationId: designationId
//         });

//         console.log(`Found ${employees.length} employees with this designation`);

//         // Update each employee's leave assignment
//         const employeeUpdatePromises = employees.map(async (employee) => {
//             // Get current leave assignments
//             const currentLeaveAssignments = employee.leaveAssignment || [];

//             // Add new leave types that don't already exist
//             for (const newLeaveType of validLeaveTypes) {
//                 const alreadyExists = currentLeaveAssignments.some(
//                     leave => leave.leaveTypeId === newLeaveType.leaveTypeId
//                 );

//                 if (!alreadyExists) {
//                     currentLeaveAssignments.push({
//                         leaveTypeId: newLeaveType.leaveTypeId,
//                         leaveName: newLeaveType.leaveName,
//                         noOfLeaveDays: newLeaveType.noOfLeaveDays,
//                         assignedNoOfDays: newLeaveType.noOfLeaveDays,
//                         daysUsed: 0,
//                         daysLeft: newLeaveType.noOfLeaveDays
//                     });
//                 }
//             }

//             // Update employee
//             return Employee.findByIdAndUpdate(
//                 employee._id,
//                 { $set: { leaveAssignment: currentLeaveAssignments } },
//                 { new: true }
//             );
//         });

//         await Promise.all(employeeUpdatePromises);

//         console.log(`Designation "${designationName || existingDesignation.designationName}" updated successfully`);
//         console.log(`Updated leave assignments for ${employees.length} employees`);

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             data: updatedDesignation,
//             message: `Designation updated successfully. ${employees.length} employee(s) updated with new leave types.`
//         });

//     } catch (error) {
//         console.error('Error updating designation:', {
//             error: error.message,
//             stack: error.stack,
//             designationId: req.params?.id
//         });

//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: 'Validation error',
//                 details: error.message
//             });
//         }

//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: 'Invalid ID format',
//                 details: error.message
//             });
//         }

//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Internal server error',
//             message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the designation'
//         });
//     }
// };

// export default updateDesignation;

// import dotenv from "dotenv";
// import Company from "../../model/Company";
// import Designation from "../../model/Designation";
// import Leave from "../../model/Leaves";
// import Employee from "../../model/Employees";

// dotenv.config();

// const updateDesignation = async (req, res) => {
//     try {
//         const { designationName, description, leaveAssignment, expenseCard } = req.body;
//         const designationId = req.params.id;
//         const companyId = req.payload.id;

//         if (!designationId) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "Designation ID is required"
//             });
//         }

//         // Use lean() for all read queries
//         const company = await Company.findOne({ _id: companyId }).lean();

//         if (!company || !company.companyName) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "No company has been created for this account"
//             });
//         }

//         const existingDesignation = await Designation.findOne({ _id: designationId }).lean();

//         if (!existingDesignation) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: "Designation not found"
//             });
//         }

//         // Check for duplicate name
//         if (designationName && designationName !== existingDesignation.designationName) {
//             const duplicateDesignation = await Designation.findOne({
//                 companyId: company._id,
//                 designationName: designationName,
//                 _id: { $ne: designationId }
//             }).lean();

//             if (duplicateDesignation) {
//                 return res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: "This designation name already exists"
//                 });
//             }
//         }

//         // Prepare update data
//         const updateData = {
//             companyId: companyId.toString(),
//             companyName: company.companyName
//         };

//         if (designationName) updateData.designationName = designationName.trim();
//         if (description) updateData.description = description.trim();

//         // If no leave assignment, just update basic fields
//         if (!leaveAssignment || leaveAssignment.length === 0) {
//             const updatedDesignation = await Designation.findByIdAndUpdate(
//                 designationId,
//                 { $set: updateData },
//                 { new: true, lean: true }
//             );

//             return res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: updatedDesignation,
//                 message: "Designation updated successfully"
//             });
//         }

//         // Process leave assignments
//         const leaveTypeIds = leaveAssignment.map(assign => assign.leaveTypeId).filter(Boolean);

//         if (leaveTypeIds.length === 0) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "Leave type IDs are required in leave assignment"
//             });
//         }

//         // Batch fetch all leave types at once - use lean()
//         const leaveTypes = await Leave.find({ _id: { $in: leaveTypeIds } }).lean();

//         if (leaveTypes.length !== leaveTypeIds.length) {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: "One or more leave types do not exist"
//             });
//         }

//         // Create a map for O(1) lookup instead of repeated queries
//         const leaveMap = new Map(leaveTypes.map(leave => [leave._id.toString(), leave]));

//         // Build leave assignment array efficiently
//         const validLeaveTypes = leaveAssignment
//             .map(assign => {
//                 const leave = leaveMap.get(assign.leaveTypeId);
//                 if (!leave) return null;

//                 return {
//                     leaveTypeId: assign.leaveTypeId,
//                     leaveName: leave.leaveName,
//                     noOfLeaveDays: assign.noOfLeaveDays || 0
//                 };
//             })
//             .filter(Boolean);

//         updateData.leaveTypes = validLeaveTypes;
//         if (expenseCard) updateData.expenseCard = expenseCard;

//         // Update designation
//         const updatedDesignation = await Designation.findByIdAndUpdate(
//             designationId,
//             { $set: updateData },
//             { new: true, lean: true }
//         );

//         // Fetch employees with this designation - use lean() and only needed fields
//         const employees = await Employee.find(
//             {
//                 companyId: companyId.toString(),
//                 designationId: designationId
//             },
//             { _id: 1, leaveAssignment: 1 } // Only fetch fields we need
//         ).lean();

//         // Batch update employees
//         const bulkOps = employees.map(employee => {
//             const currentLeaveAssignments = employee.leaveAssignment || [];

//             // Add new leave types that don't exist
//             for (const newLeaveType of validLeaveTypes) {
//                 const alreadyExists = currentLeaveAssignments.some(
//                     leave => leave.leaveTypeId === newLeaveType.leaveTypeId
//                 );

//                 if (!alreadyExists) {
//                     currentLeaveAssignments.push({
//                         leaveTypeId: newLeaveType.leaveTypeId,
//                         leaveName: newLeaveType.leaveName,
//                         noOfLeaveDays: newLeaveType.noOfLeaveDays,
//                         assignedNoOfDays: newLeaveType.noOfLeaveDays,
//                         daysUsed: 0,
//                         daysLeft: newLeaveType.noOfLeaveDays
//                     });
//                 }
//             }

//             return {
//                 updateOne: {
//                     filter: { _id: employee._id },
//                     update: { $set: { leaveAssignment: currentLeaveAssignments } }
//                 }
//             };
//         });

//         // Execute bulk update if there are operations
//         if (bulkOps.length > 0) {
//             await Employee.bulkWrite(bulkOps);
//         }

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             data: updatedDesignation,
//             message: `Designation updated successfully. ${employees.length} employee(s) updated with new leave types.`
//         });

//     } catch (error) {
//         console.error('Error updating designation:', error);

//         if (error.name === 'ValidationError' || error.name === 'CastError') {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: error.message
//             });
//         }

//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Internal server error'
//         });
//     }
// };

// export default updateDesignation;

import dotenv from "dotenv";
import Company from "../../model/Company";
import Designation from "../../model/Designation";
import Leave from "../../model/Leaves";
import Employee from "../../model/Employees";

dotenv.config();

/**
 * Update a designation and sync changes to all employees with this designation
 * Updates leave assignments and expense cards across all affected employees
 */
const updateDesignation = async (req, res) => {
    try {
        const { designationName, description, grade, leaveAssignment, expenseCard } = req.body;
        const designationId = req.params.id;
        const companyId = req.payload.id;

        if (!designationId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Designation ID is required"
            });
        }

        // Fetch company and existing designation in parallel
        const [company, existingDesignation] = await Promise.all([
            Company.findById(companyId).lean(),
            Designation.findById(designationId).lean()
        ]);

        if (!company || !company.companyName) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "No company has been created for this account"
            });
        }

        if (!existingDesignation) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Designation not found"
            });
        }

        // Check for duplicate designation name
        if (designationName && designationName !== existingDesignation.designationName) {
            const duplicateDesignation = await Designation.findOne({
                companyId: companyId,
                designationName: designationName.trim(),
                _id: { $ne: designationId }
            }).lean();

            if (duplicateDesignation) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "This designation name already exists"
                });
            }
        }

        // Prepare update data
        const updateData = {
            companyId: companyId.toString(),
            companyName: company.companyName,
            updatedAt: new Date()
        };

        if (designationName) updateData.designationName = designationName.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (grade !== undefined) updateData.grade = Number(grade) || 0;

        // Process leave assignments
        let validLeaveTypes = [];
        if (leaveAssignment && leaveAssignment.length > 0) {
            const leaveTypeIds = leaveAssignment.map(assign => assign.leaveTypeId).filter(Boolean);

            if (leaveTypeIds.length === 0) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "Leave type IDs are required in leave assignment"
                });
            }

            // Batch fetch all leave types
            const leaveTypes = await Leave.find({ _id: { $in: leaveTypeIds } }).lean();

            if (leaveTypes.length !== leaveTypeIds.length) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "One or more leave types do not exist"
                });
            }

            // Create lookup map
            const leaveMap = new Map(leaveTypes.map(leave => [leave._id.toString(), leave]));

            // Build leave assignment array
            validLeaveTypes = leaveAssignment
                .map(assign => {
                    const leave = leaveMap.get(assign.leaveTypeId);
                    if (!leave) return null;

                    return {
                        leaveTypeId: assign.leaveTypeId,
                        leaveName: leave.leaveName,
                        noOfLeaveDays: Number(assign.noOfLeaveDays) || 0
                    };
                })
                .filter(Boolean);

            updateData.leaveTypes = validLeaveTypes;
        }

        // Process expense card
        if (expenseCard && Array.isArray(expenseCard)) {
            updateData.expenseCard = expenseCard.map(card => ({
                cardCurrency: card.cardCurrency || 'NGN',
                cardExpiryDate: card.cardExpiryDate ? new Date(card.cardExpiryDate) : undefined,
                cardLimit: Number(card.cardLimit) || 0
            }));
        }

        // Update designation
        const updatedDesignation = await Designation.findByIdAndUpdate(
            designationId,
            { $set: updateData },
            { new: true, lean: true }
        );

        // Fetch all employees with this designation
        const employees = await Employee.find({
            companyId: companyId.toString(),
            designationId: designationId
        }).select('_id leaveAssignment expenseDetails').lean();

        if (employees.length === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                data: updatedDesignation,
                message: "Designation updated successfully. No employees found with this designation."
            });
        }

        // Build bulk update operations for employees
        const bulkOps = [];
        let recalculatedCount = 0;

        for (const employee of employees) {
            const employeeUpdate = {};

            // ✅ UPDATE LEAVE ASSIGNMENTS
            if (validLeaveTypes.length > 0) {
                const currentLeaveAssignments = employee.leaveAssignment || [];
                const updatedLeaveAssignments = [];

                // Create a map of current leave assignments for quick lookup
                const currentLeaveMap = new Map(
                    currentLeaveAssignments.map(leave => [leave.leaveTypeId.toString(), leave])
                );

                // Process each leave type from the designation
                for (const newLeaveType of validLeaveTypes) {
                    const leaveTypeIdStr = newLeaveType.leaveTypeId.toString();
                    const existingLeave = currentLeaveMap.get(leaveTypeIdStr);

                    if (existingLeave) {
                        // ✅ UPDATE EXISTING LEAVE TYPE
                        const oldAssignedDays = Number(existingLeave.assignedNoOfDays) || 0;
                        const newAssignedDays = Number(newLeaveType.noOfLeaveDays) || 0;
                        const daysUsed = Number(existingLeave.daysUsed) || 0;

                        // Calculate new days left
                        const daysDifference = newAssignedDays - oldAssignedDays;
                        const oldDaysLeft = Number(existingLeave.daysLeft) || 0;
                        const newDaysLeft = Math.max(0, oldDaysLeft + daysDifference);

                        updatedLeaveAssignments.push({
                            ...existingLeave,
                            leaveName: newLeaveType.leaveName,
                            noOfLeaveDays: newAssignedDays,
                            assignedNoOfDays: newAssignedDays,
                            daysLeft: newDaysLeft
                        });
                    } else {
                        // ✅ ADD NEW LEAVE TYPE
                        updatedLeaveAssignments.push({
                            leaveTypeId: newLeaveType.leaveTypeId,
                            leaveName: newLeaveType.leaveName,
                            noOfLeaveDays: newLeaveType.noOfLeaveDays,
                            assignedNoOfDays: newLeaveType.noOfLeaveDays,
                            daysUsed: 0,
                            daysLeft: newLeaveType.noOfLeaveDays,
                            daysRequested: 0
                        });
                    }
                }

                employeeUpdate.leaveAssignment = updatedLeaveAssignments;
            }

            // ✅ UPDATE EXPENSE CARD WITH RECALCULATION
            if (expenseCard && Array.isArray(expenseCard) && expenseCard.length > 0) {
                const cardData = expenseCard[0]; // Use first card
                const currentExpenseDetails = employee.expenseDetails || {};
                
                const newCardLimit = Number(cardData.cardLimit) || 0;
                const currentSpent = Number(currentExpenseDetails.currentSpent) || 0;
                
                // ✅ RECALCULATE CARD BALANCE
                // Formula: cardBalance = cardLimit - currentSpent
                const recalculatedBalance = newCardLimit - currentSpent;
                
                // Track if balance was recalculated
                if (currentSpent > 0 && currentExpenseDetails.cardBalance !== recalculatedBalance) {
                    recalculatedCount++;
                    console.log(`Recalculated balance for employee ${employee._id}: ${currentExpenseDetails.cardBalance} -> ${recalculatedBalance}`);
                }

                employeeUpdate.expenseDetails = {
                    ...currentExpenseDetails,
                    cardCurrency: cardData.cardCurrency || 'NGN',
                    cardExpiryDate: cardData.cardExpiryDate ? new Date(cardData.cardExpiryDate) : currentExpenseDetails.cardExpiryDate,
                    cardLimit: newCardLimit,
                    // ✅ USE RECALCULATED BALANCE
                    cardBalance: recalculatedBalance,
                    totalSpent: currentExpenseDetails.totalSpent || 0,
                    currentSpent: currentSpent,
                    currentExpense: currentExpenseDetails.currentExpense || 0,
                    expenseHistory: currentExpenseDetails.expenseHistory || [],
                    // Optional: Add metadata about recalculation
                    lastBalanceRecalculation: new Date()
                };
            } else if (employee.expenseDetails && employee.expenseDetails.currentSpent > 0) {
                // ✅ RECALCULATE EVEN IF NO NEW CARD DATA (for existing ongoing expenses)
                const currentExpenseDetails = employee.expenseDetails;
                const cardLimit = Number(currentExpenseDetails.cardLimit) || 0;
                const currentSpent = Number(currentExpenseDetails.currentSpent) || 0;
                const recalculatedBalance = cardLimit - currentSpent;
                
                if (currentExpenseDetails.cardBalance !== recalculatedBalance) {
                    recalculatedCount++;
                    console.log(`Recalculated balance for employee ${employee._id} (existing expense): ${currentExpenseDetails.cardBalance} -> ${recalculatedBalance}`);
                    
                    employeeUpdate.expenseDetails = {
                        ...currentExpenseDetails,
                        cardBalance: recalculatedBalance,
                        lastBalanceRecalculation: new Date()
                    };
                }
            }

            // Add to bulk operations if there are updates
            if (Object.keys(employeeUpdate).length > 0) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: employee._id },
                        update: { $set: employeeUpdate }
                    }
                });
            }
        }

        // Execute bulk update
        let bulkResult = null;
        if (bulkOps.length > 0) {
            bulkResult = await Employee.bulkWrite(bulkOps);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedDesignation,
            employeeUpdates: {
                totalEmployees: employees.length,
                employeesUpdated: bulkResult ? bulkResult.modifiedCount : 0,
                balancesRecalculated: recalculatedCount,
                leaveTypesUpdated: validLeaveTypes.length,
                expenseCardUpdated: expenseCard && expenseCard.length > 0
            },
            message: `Designation updated successfully. ${bulkResult ? bulkResult.modifiedCount : 0} employee(s) updated. ${recalculatedCount} card balance(s) recalculated.`
        });

    } catch (error) {
        console.error('Error updating designation:', error);

        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default updateDesignation;