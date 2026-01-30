import dotenv from "dotenv";
import Company from "../../model/Company";
import Designation from "../../model/Designation";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";
import Employee from "../../model/Employees";



const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const updateDesignation = async (req, res) => {
  try {
    const { designationName, description, leaveAssignment, expenseCard} = req.body;
    let company = await Company.findOne({ _id: req.payload.id });

    let designation = await Designation.findOne({
      companyId: company._id,
      designationName: designationName,
    });

    console.log({ company });

    if (!company.companyName) {
      res.status(400).json({
        status: 400,
        error: "No company has been created for this account",
      });
      return;
    }

    // if (designation) {
    //   res.status(400).json({
    //     status: 400,
    //     error: "This designation name already exist",
    //   });
    //   return;
    // }
    if (!leaveAssignment) {


        Designation.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 

                designationName: designationName && designationName,
                companyId: req.payload.id,
                companyName: company.companyName && company.companyName,
                description: description && description,
            }
       },
            async function (
                err,
                result
            ) {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: err

                    })

                    return;

                } else {
                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: "Update Successful"
                      });
                      return;

                }})

      return
    } 
    let leaves = [];
    var leaveTypes = [];
    var exp = [];
    var expenseTypes = [];

    console.log({leaveAssignment})

    leaveAssignment.map((data, index) => {
      if (!data) {
        res.status(400).json({
          status: 400,
          error: "Leave id field is compulsory",
        });
        return;
      }
      leaves.push(data.leaveTypeId);
    });

    console.log({ leaves });

    const resp = await Leave.find({ _id: { $in: leaves } });
    console.log({ resp });


    if (!resp || resp.length < 1) {
         
      res.status(400).json({
        status: 400,
        error: "Leave type does not exist",
      });
      return 
    }

    console.log({ resp });

    const leaveTypePromises = leaveAssignment.map(async (resp) => {
      const leave = await Leave.findOne({ _id: resp.leaveTypeId });
    
      const leaveType = {
        leaveTypeId: resp.leaveTypeId,
        leaveName: leave ? leave.leaveName : 'Unknown', // Add a default value in case leave is not found
        noOfLeaveDays: resp.noOfLeaveDays,
      };
    
      console.log(leaveType, "148");
    
      leaveTypes.push(leaveType);
    });
    
    // Wait for all the promises to complete
    await Promise.all(leaveTypePromises);
    console.log(leaveTypes, "080");

    // let leaveDays


    // await leaveAssignment.map((assign, index) => {

    //   console.log(assign)
    //   console.log('tedghj',resp._id)


    //   if(resp._id == assign.leaveTypeId){
    //      leaveDays = assign.noOfLeaveDays
    //   }

    // })
    console.log({expenseCard});


    // Handle the success case here
    // leaveTypes.push({
    //   leaveTypeId: resp._id,
    //   leaveName: resp.leaveName,
    //   noOfLeaveDays: Number(leaveDays),
    // });
  
    //  await expenseCard.map((data, index) => {
    // console.log({data})

    //   if (!data) {
    //     res.status(400).json({
    //       status: 400,
    //       error: "Expense id field is compulsory",
    //     });
    //     return;
    //   }

    //   exp.push(data.expenseTypeId);
    // });

    // console.log({exp})

    //   const check = await Expense.find({ _id: {$in: exp} });

    //   console.log({ check });

    //   if (!check || check.length < 1) {
         
    //     res.status(400).json({
    //       status: 400,
    //       error: "Expense type does not exist",
    //     });
    //     return 
    //   } else{


    //     let expenseCurrency
    //     let expenseBal
    //     let expenseExpiry
    //     let expenseLimit




    //     await expenseCard.map((assign, index) => {

    //       if(check._id == assign.expenseTypeId){
    //         expenseCurrency = assign.cardCurrency
    //         expenseExpiry = assign.cardExpiryDate
    //         expenseLimit = assign.cardLimit
    //       }

    //     })

    //     expenseTypes.push({
    //       expenseTypeId: check._id,
    //       expenseCardName: check.expenseCardName,
    //       cardCurrency: expenseCurrency,
    //       cardExpiryDate: expenseExpiry,
    //       cardLimit: expenseLimit,
    //     });
    //   }

      
    // });

    // Promise.all(leavePromises, expensePromises)
    //   .then(async () => {

        // console.log(leaveAssignment);


        // expenseTypes.push({
        //   cardCurrency: expenseCurrency,
        //   cardExpiryDate: expenseExpiry,
        //   cardLimit: expenseLimit,
        // });

        Designation.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
    
                designationName: designationName && designationName,
                companyId: req.payload.id,
                companyName: company.companyName && company.companyName,
                description: description && description,
                leaveTypes: leaveTypes && leaveTypes,
                expenseCard
            }
       },
            async function (
                err,
                result
            ) {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: err
    
                    })
    
                    return;
    
                } else {


                  for (const documentId of leaves) {
                    // Fetch each document
                    Employee.findOne({ companyId: req.payload.id, "leaveAssignment.leaveTypeId": documentId }, (err, document) => {
                      if (err) {
                        // Handle error
                        console.error(err);
                        return;
                      }
                      console.log({document}, 'kk')

                      // Update the arrayField in each document
                      // for (const newObj of leaveTypes) {


                      //   if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
                      //   }else{
                      //     document.leaveAssignment.push(newObj);
                      //   }
                      // }
                      // console.log(leaveTypes)

                      // Ensure leaveAssignment is an array before processing
                      document.leaveAssignment = document.leaveAssignment || [];

                      for (const newObj of leaveTypes) {
                          // Check if leaveTypeId is already in leaveAssignment
                          if (!document.leaveAssignment.some(obj => obj.leaveTypeId === newObj.leaveTypeId)) {
                              // If not found, push the new object
                              document.leaveAssignment.push(newObj);
                          }
                      }

                      console.log(leaveTypes);

                  
                      // Save the updated document
                      document.save((err, updatedDoc) => {
                        if (err) {
                          // Handle save error
                          console.error(err);


                        res.status(400).json({
                          status: 400,
                         success: true,
                               data: err
                             });
                          return;
                        }

                      
                  
                        // Updated document is now in 'updatedDoc'
                        console.log("Updated document:", updatedDoc);
                      });
                    });
                  }

                  res.status(200).json({
                    status: 200,
                   success: true,
                         data: result
                       });
            }
          });
   
    }
     

  


 catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};
export default updateDesignation;
