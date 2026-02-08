// import dotenv from "dotenv";
// import Company from "../../model/Company";
// import Designation from "../../model/Designation";
// import Leave from "../../model/Leaves";
// import Expense from "../../model/Expense";
// import Employee from "../../model/Employees";



// const sgMail = require("@sendgrid/mail");

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// const updateDesignation = async (req, res) => {
//   try {
//     const { designationName, description, leaveAssignment, expenseCard} = req.body;
//     let company = await Company.findOne({ _id: req.payload.id });

//     let designation = await Designation.findOne({
//       companyId: company._id,
//       designationName: designationName,
//     });

//     console.log({ company });

//     if (!company.companyName) {
//       res.status(400).json({
//         status: 400,
//         error: "No company has been created for this account",
//       });
//       return;
//     }

//     // if (designation) {
//     //   res.status(400).json({
//     //     status: 400,
//     //     error: "This designation name already exist",
//     //   });
//     //   return;
//     // }
//     if (!leaveAssignment) {


//         Designation.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 

//                 designationName: designationName && designationName,
//                 companyId: req.payload.id,
//                 companyName: company.companyName && company.companyName,
//                 description: description && description,
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
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: "Update Successful"
//                       });
//                       return;

//                 }})

//       return
//     } 
//     let leaves = [];
//     var leaveTypes = [];
//     var exp = [];
//     var expenseTypes = [];

//     console.log({leaveAssignment})

//     leaveAssignment.map((data, index) => {
//       if (!data) {
//         res.status(400).json({
//           status: 400,
//           error: "Leave id field is compulsory",
//         });
//         return;
//       }
//       leaves.push(data.leaveTypeId);
//     });

//     console.log({ leaves });

//     const resp = await Leave.find({ _id: { $in: leaves } });
//     console.log({ resp });


//     if (!resp || resp.length < 1) {
         
//       res.status(400).json({
//         status: 400,
//         error: "Leave type does not exist",
//       });
//       return 
//     }

//     console.log({ resp });

//     const leaveTypePromises = leaveAssignment.map(async (resp) => {
//       const leave = await Leave.findOne({ _id: resp.leaveTypeId });
    
//       const leaveType = {
//         leaveTypeId: resp.leaveTypeId,
//         leaveName: leave ? leave.leaveName : 'Unknown', // Add a default value in case leave is not found
//         noOfLeaveDays: resp.noOfLeaveDays,
//       };
    
//       console.log(leaveType, "148");
    
//       leaveTypes.push(leaveType);
//     });
    
//     // Wait for all the promises to complete
//     await Promise.all(leaveTypePromises);
//     console.log(leaveTypes, "080");

//     // let leaveDays


//     // await leaveAssignment.map((assign, index) => {

//     //   console.log(assign)
//     //   console.log('tedghj',resp._id)


//     //   if(resp._id == assign.leaveTypeId){
//     //      leaveDays = assign.noOfLeaveDays
//     //   }

//     // })
//     console.log({expenseCard});


//     // Handle the success case here
//     // leaveTypes.push({
//     //   leaveTypeId: resp._id,
//     //   leaveName: resp.leaveName,
//     //   noOfLeaveDays: Number(leaveDays),
//     // });
  
//     //  await expenseCard.map((data, index) => {
//     // console.log({data})

//     //   if (!data) {
//     //     res.status(400).json({
//     //       status: 400,
//     //       error: "Expense id field is compulsory",
//     //     });
//     //     return;
//     //   }

//     //   exp.push(data.expenseTypeId);
//     // });

//     // console.log({exp})

//     //   const check = await Expense.find({ _id: {$in: exp} });

//     //   console.log({ check });

//     //   if (!check || check.length < 1) {
         
//     //     res.status(400).json({
//     //       status: 400,
//     //       error: "Expense type does not exist",
//     //     });
//     //     return 
//     //   } else{


//     //     let expenseCurrency
//     //     let expenseBal
//     //     let expenseExpiry
//     //     let expenseLimit




//     //     await expenseCard.map((assign, index) => {

//     //       if(check._id == assign.expenseTypeId){
//     //         expenseCurrency = assign.cardCurrency
//     //         expenseExpiry = assign.cardExpiryDate
//     //         expenseLimit = assign.cardLimit
//     //       }

//     //     })

//     //     expenseTypes.push({
//     //       expenseTypeId: check._id,
//     //       expenseCardName: check.expenseCardName,
//     //       cardCurrency: expenseCurrency,
//     //       cardExpiryDate: expenseExpiry,
//     //       cardLimit: expenseLimit,
//     //     });
//     //   }

      
//     // });

//     // Promise.all(leavePromises, expensePromises)
//     //   .then(async () => {

//         // console.log(leaveAssignment);


//         // expenseTypes.push({
//         //   cardCurrency: expenseCurrency,
//         //   cardExpiryDate: expenseExpiry,
//         //   cardLimit: expenseLimit,
//         // });

//         Designation.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 
    
//                 designationName: designationName && designationName,
//                 companyId: req.payload.id,
//                 companyName: company.companyName && company.companyName,
//                 description: description && description,
//                 leaveTypes: leaveTypes && leaveTypes,
//                 expenseCard
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


//                   for (const documentId of leaves) {
//                     // Fetch each document
//                     Employee.findOne({ companyId: req.payload.id, "leaveAssignment.leaveTypeId": documentId }, (err, document) => {
//                       if (err) {
//                         // Handle error
//                         console.error(err);
//                         return;
//                       }
//                       console.log({document}, 'kk')

//                       // Update the arrayField in each document
//                       // for (const newObj of leaveTypes) {


//                       //   if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
//                       //   }else{
//                       //     document.leaveAssignment.push(newObj);
//                       //   }
//                       // }
//                       // console.log(leaveTypes)

//                       // Ensure leaveAssignment is an array before processing
//                       document.leaveAssignment = document.leaveAssignment || [];

//                       for (const newObj of leaveTypes) {
//                           // Check if leaveTypeId is already in leaveAssignment
//                           if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
//                               // If not found, push the new object
//                               document.leaveAssignment.push(newObj);
//                           }
//                       }

//                       console.log(leaveTypes);

                  
//                       // Save the updated document
//                       document.save((err, updatedDoc) => {
//                         if (err) {
//                           // Handle save error
//                           console.error(err);


//                         res.status(400).json({
//                           status: 400,
//                          success: true,
//                                data: err
//                              });
//                           return;
//                         }

                      
                  
//                         // Updated document is now in 'updatedDoc'
//                         console.log("Updated document:", updatedDoc);
//                       });
//                     });
//                   }

//                   res.status(200).json({
//                     status: 200,
//                    success: true,
//                          data: result
//                        });
//             }
//           });
   
//     }
     

  


//  catch (error) {
//     res.status(500).json({
//       status: 500,
//       success: false,
//       error: error,
//     });
//   }
// };
// export default updateDesignation;


import dotenv from "dotenv";
import Company from "../../model/Company";
import Designation from "../../model/Designation";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";
import Employee from "../../model/Employees";

dotenv.config();

const updateDesignation = async (req, res) => {
    try {
        const { designationName, description, leaveAssignment, expenseCard } = req.body;
        const designationId = req.params.id;
        const companyId = req.payload.id;

        // Validate designation ID
        if (!designationId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Designation ID is required"
            });
        }

        // Get company details
        const company = await Company.findOne({ _id: companyId });

        if (!company || !company.companyName) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "No company has been created for this account"
            });
        }

        // Check if designation exists
        const existingDesignation = await Designation.findOne({ _id: designationId });

        if (!existingDesignation) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Designation not found"
            });
        }

        // Check for duplicate designation name (if name is being changed)
        if (designationName && designationName !== existingDesignation.designationName) {
            const duplicateDesignation = await Designation.findOne({
                companyId: company._id,
                designationName: designationName,
                _id: { $ne: designationId } // Exclude current designation
            });

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
            companyName: company.companyName
        };

        if (designationName) updateData.designationName = designationName.trim();
        if (description) updateData.description = description.trim();

        // If no leave assignment, just update basic fields
        if (!leaveAssignment || leaveAssignment.length === 0) {
            const updatedDesignation = await Designation.findByIdAndUpdate(
                designationId,
                { $set: updateData },
                { new: true }
            );

            console.log(`Designation "${designationName || existingDesignation.designationName}" updated (no leave changes)`);

            return res.status(200).json({
                status: 200,
                success: true,
                data: updatedDesignation,
                message: "Designation updated successfully"
            });
        }

        // Process leave assignments
        const leaveTypeIds = leaveAssignment.map(assign => assign.leaveTypeId).filter(Boolean);

        if (leaveTypeIds.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Leave type IDs are required in leave assignment"
            });
        }

        // Validate all leave types exist
        const leaveTypes = await Leave.find({ _id: { $in: leaveTypeIds } });

        if (leaveTypes.length !== leaveTypeIds.length) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "One or more leave types do not exist"
            });
        }

        // Build leave assignment array with details
        const leaveTypesData = await Promise.all(
            leaveAssignment.map(async (assign) => {
                const leave = await Leave.findOne({ _id: assign.leaveTypeId });
                
                if (!leave) {
                    return null;
                }

                return {
                    leaveTypeId: assign.leaveTypeId,
                    leaveName: leave.leaveName,
                    noOfLeaveDays: assign.noOfLeaveDays || 0
                };
            })
        );

        // Filter out any null values
        const validLeaveTypes = leaveTypesData.filter(Boolean);

        // Add leave types and expense card to update data
        updateData.leaveTypes = validLeaveTypes;
        
        if (expenseCard) {
            updateData.expenseCard = expenseCard;
        }

        // Update designation
        const updatedDesignation = await Designation.findByIdAndUpdate(
            designationId,
            { $set: updateData },
            { new: true }
        );

        // Update all employees with this designation to add new leave types
        const employees = await Employee.find({
            companyId: companyId.toString(),
            designationId: designationId
        });

        console.log(`Found ${employees.length} employees with this designation`);

        // Update each employee's leave assignment
        const employeeUpdatePromises = employees.map(async (employee) => {
            // Get current leave assignments
            const currentLeaveAssignments = employee.leaveAssignment || [];

            // Add new leave types that don't already exist
            for (const newLeaveType of validLeaveTypes) {
                const alreadyExists = currentLeaveAssignments.some(
                    leave => leave.leaveTypeId === newLeaveType.leaveTypeId
                );

                if (!alreadyExists) {
                    currentLeaveAssignments.push({
                        leaveTypeId: newLeaveType.leaveTypeId,
                        leaveName: newLeaveType.leaveName,
                        noOfLeaveDays: newLeaveType.noOfLeaveDays,
                        assignedNoOfDays: newLeaveType.noOfLeaveDays,
                        daysUsed: 0,
                        daysLeft: newLeaveType.noOfLeaveDays
                    });
                }
            }

            // Update employee
            return Employee.findByIdAndUpdate(
                employee._id,
                { $set: { leaveAssignment: currentLeaveAssignments } },
                { new: true }
            );
        });

        await Promise.all(employeeUpdatePromises);

        console.log(`Designation "${designationName || existingDesignation.designationName}" updated successfully`);
        console.log(`Updated leave assignments for ${employees.length} employees`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedDesignation,
            message: `Designation updated successfully. ${employees.length} employee(s) updated with new leave types.`
        });

    } catch (error) {
        console.error('Error updating designation:', {
            error: error.message,
            stack: error.stack,
            designationId: req.params?.id
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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the designation'
        });
    }
};

export default updateDesignation;