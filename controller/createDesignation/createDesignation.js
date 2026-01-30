


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

    if (designation) {
      res.status(400).json({
        status: 400,
        error: "This designation name already exist",
      });
      return;
    }

    if (!leaveAssignment) {
      let designations = new Designation({
        designationName,
        companyId: req.payload.id,
        companyName: company.companyName,
        description,
        grade
      });

      await designations
        .save()
        .then((adm) => {
          console.log(adm);
          res.status(200).json({
            status: 200,
            success: true,
            data: adm,
          });
          return;
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({
            status: 400,
            success: false,
            error: err,
          });
          return;
        });

        return;
    }
    let leaves = [];
    var leaveTypes = [];

    let exp = [];

    var expenseTypes = [];

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



    expenseCard.map((data, index) => {
      if (!data) {
        res.status(400).json({
          status: 400,
          error: "Expense id field is compulsory",
        });
        return;
      }
      exp.push(data.expenseTypeId);
    });

    console.log({ exp });

    const expensePromises = exp.map(async (data, index) => {
      const check = await Expense.findOne({ _id: data });

      console.log({ check });

      // if (!check) {
      //   res.status(400).json({
      //     status: 400,
      //     error: "Expense type does not exist",
      //   });
      //   return 
      // }

      expenseTypes.push({
        // expenseTypeId: data,
        expenseCardName: "",
        cardCurrency: expenseCard[index].cardCurrency,
        cardBalance: expenseCard[index].cardLimit,
        cardExpiryDate: expenseCard[index].cardExpiryDate,
        cardLimit: expenseCard[index].cardLimit,
      });
    });

    const leavePromises = leaves.map(async (data, index) => {
      const check = await Leave.findOne({ _id: data });

      console.log({ check });

      if (!check) {
        res.status(400).json({
          status: 400,
          error: "Leave type does not exist",
        });
        return 
      }

      leaveTypes.push({
        leaveTypeId: data,
        leaveName: check.leaveName,
        noOfLeaveDays: Number(leaveAssignment[index].noOfLeaveDays),
        description: check.description
      });
    });

    Promise.all(leavePromises, expensePromises)
      .then(async () => {
        console.log({ leaveTypes });

        console.log(leaveAssignment);

        let designations = await new Designation({
          designationName,
          companyId: req.payload.id,
          companyName: company.companyName,
          description,
          leaveTypes: leaveTypes && leaveTypes,
          expenseCard,
          grade
        });

        await designations
          .save()
          .then((adm) => {
            console.log(adm);
            res.status(200).json({
              status: 200,
              success: true,
              data: adm,
            });
            return;
          })
          .catch((err) => {
            console.error(err);
            res.status(400).json({
              status: 400,
              success: false,
              error: err,
            });

            return;
          });
      })

      .catch((error) => {
        // Handle errors from the promises
        console.error("Error:", error);
      });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};
export default createDesignation;
