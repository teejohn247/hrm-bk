


// import dotenv from "dotenv";
// import Role from "../../model/Role";
// import Company from "../../model/Company";
// import Designation from "../../model/Designation";
// import Leave from "../../model/Leaves";
// import Expense from "../../model/Expense";


// const sgMail = require("@sendgrid/mail");

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// const createDesignation = async (req, res) => {
//   try {
//     const { designationName, description, leaveAssignment, grade, expenseCard } = req.body;

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

//     if (designation) {
//       res.status(400).json({
//         status: 400,
//         error: "This designation name already exist",
//       });
//       return;
//     }

//     if (!leaveAssignment) {
//       let designations = new Designation({
//         designationName,
//         companyId: req.payload.id,
//         companyName: company.companyName,
//         description,
//         grade
//       });

//       await designations
//         .save()
//         .then((adm) => {
//           console.log(adm);
//           res.status(200).json({
//             status: 200,
//             success: true,
//             data: adm,
//           });
//           return;
//         })
//         .catch((err) => {
//           console.error(err);
//           res.status(400).json({
//             status: 400,
//             success: false,
//             error: err,
//           });
//           return;
//         });

//         return;
//     }
//     let leaves = [];
//     var leaveTypes = [];

//     let exp = [];

//     var expenseTypes = [];

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



//     expenseCard.map((data, index) => {
//       if (!data) {
//         res.status(400).json({
//           status: 400,
//           error: "Expense id field is compulsory",
//         });
//         return;
//       }
//       exp.push(data.expenseTypeId);
//     });

//     console.log({ exp });

//     const expensePromises = exp.map(async (data, index) => {
//       const check = await Expense.findOne({ _id: data });

//       console.log({ check });

//       // if (!check) {
//       //   res.status(400).json({
//       //     status: 400,
//       //     error: "Expense type does not exist",
//       //   });
//       //   return 
//       // }

//       expenseTypes.push({
//         // expenseTypeId: data,
//         expenseCardName: "",
//         cardCurrency: expenseCard[index].cardCurrency,
//         cardBalance: expenseCard[index].cardLimit,
//         cardExpiryDate: expenseCard[index].cardExpiryDate,
//         cardLimit: expenseCard[index].cardLimit,
//       });
//     });

//     const leavePromises = leaves.map(async (data, index) => {
//       const check = await Leave.findOne({ _id: data });

//       console.log({ check });

//       if (!check) {
//         res.status(400).json({
//           status: 400,
//           error: "Leave type does not exist",
//         });
//         return 
//       }

//       leaveTypes.push({
//         leaveTypeId: data,
//         leaveName: check.leaveName,
//         noOfLeaveDays: Number(leaveAssignment[index].noOfLeaveDays),
//         description: check.description
//       });
//     });

//     Promise.all(leavePromises, expensePromises)
//       .then(async () => {
//         console.log({ leaveTypes });

//         console.log(leaveAssignment);

//         let designations = await new Designation({
//           designationName,
//           companyId: req.payload.id,
//           companyName: company.companyName,
//           description,
//           leaveTypes: leaveTypes && leaveTypes,
//           expenseCard,
//           grade
//         });

//         await designations
//           .save()
//           .then((adm) => {
//             console.log(adm);
//             res.status(200).json({
//               status: 200,
//               success: true,
//               data: adm,
//             });
//             return;
//           })
//           .catch((err) => {
//             console.error(err);
//             res.status(400).json({
//               status: 400,
//               success: false,
//               error: err,
//             });

//             return;
//           });
//       })

//       .catch((error) => {
//         // Handle errors from the promises
//         console.error("Error:", error);
//       });
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       success: false,
//       error: error,
//     });
//   }
// };
// export default createDesignation;


import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import Designation from "../../model/Designation";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";

const sgMail = require("@sendgrid/mail");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);

const createDesignation = async (req, res) => {
  try {
    const { designationName, description, leaveAssignment, grade, expenseCard } = req.body;

    // Fetch company
    const company = await Company.findById(req.payload.id);
    
    if (!company?.companyName) {
      return res.status(400).json({
        status: 400,
        error: "No company has been created for this account",
      });
    }

    // Check for duplicate designation
    const existingDesignation = await Designation.findOne({
      companyId: company._id,
      designationName,
    });

    if (existingDesignation) {
      return res.status(400).json({
        status: 400,
        error: "This designation name already exists",
      });
    }

    // Base designation data
    const designationData = {
      designationName,
      companyId: req.payload.id,
      companyName: company.companyName,
      description,
      grade,
    };

    // Handle case with no leave assignment
    if (!leaveAssignment || leaveAssignment.length === 0) {
      const designation = new Designation(designationData);
      const savedDesignation = await designation.save();
      
      return res.status(200).json({
        status: 200,
        success: true,
        data: savedDesignation,
      });
    }

    // Process leave assignments
    const leaveIds = leaveAssignment.map(item => item.leaveTypeId).filter(Boolean);
    
    if (leaveIds.length !== leaveAssignment.length) {
      return res.status(400).json({
        status: 400,
        error: "Leave id field is compulsory for all leave assignments",
      });
    }

    // Fetch all leaves in parallel
    const leaves = await Leave.find({ _id: { $in: leaveIds } });
    
    if (leaves.length !== leaveIds.length) {
      return res.status(400).json({
        status: 400,
        error: "One or more leave types do not exist",
      });
    }

    // Map leaves to leave types
    const leaveMap = new Map(leaves.map(leave => [leave._id.toString(), leave]));
    const leaveTypes = leaveAssignment.map(assignment => {
      const leave = leaveMap.get(assignment.leaveTypeId);
      return {
        leaveTypeId: assignment.leaveTypeId,
        leaveName: leave.leaveName,
        noOfLeaveDays: Number(assignment.noOfLeaveDays),
        description: leave.description,
      };
    });

    // Process expense cards if provided
    let processedExpenseCards = [];
    if (expenseCard && expenseCard.length > 0) {
      const expenseIds = expenseCard.map(item => item.expenseTypeId).filter(Boolean);
      
      if (expenseIds.length !== expenseCard.length) {
        return res.status(400).json({
          status: 400,
          error: "Expense id field is compulsory for all expense cards",
        });
      }

      // Fetch all expenses in parallel (if needed for validation)
      // const expenses = await Expense.find({ _id: { $in: expenseIds } });

      processedExpenseCards = expenseCard.map(card => ({
        expenseCardName: card.expenseCardName || "",
        cardCurrency: card.cardCurrency,
        cardBalance: card.cardLimit,
        cardExpiryDate: card.cardExpiryDate,
        cardLimit: card.cardLimit,
      }));
    }

    // Create designation with all data
    const designation = new Designation({
      ...designationData,
      leaveTypes,
      expenseCard: processedExpenseCards,
    });

    const savedDesignation = await designation.save();

    return res.status(200).json({
      status: 200,
      success: true,
      data: savedDesignation,
    });

  } catch (error) {
    console.error("Error creating designation:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export default createDesignation;