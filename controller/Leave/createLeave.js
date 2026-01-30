import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import Leave from "../../model/Leaves";
import Employee from "../../model/Employees";
import Designation from "../../model/Designation";

const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const createLeave = async (req, res) => {
  try {
    const { leaveName, description } = req.body;

    let company = await Company.findOne({ _id: req.payload.id });

    if (!leaveName || leaveName == "") {
      res.status(400).json({
        status: 400,
        error: "Leave Name is required",
      });
      return;
    }

    let designation = await Leave.findOne({
      companyId: company._id,
      leaveName: leaveName,
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
        error: "This leaveName already exist",
      });
      return;
    }

    let leave = new Leave({
      leaveName,
      companyId: req.payload.id,
      companyName: company.companyName,
      description,
    });

    var leaveTypes = [];
    var exp = [];

    await leave
      .save()
      .then((adm) => {
        console.log({adm});

        leaveTypes.push({
          leaveTypeId: adm._id,
          leaveName: adm.leaveName,
          noOfLeaveDays: adm.noOfLeaveDays,
          daysUsed: 0,
          noOfLeaveDays: 0,
          description: adm.description,
        });

        console.log({leaveTypes});


        Designation.updateMany(
          { companyId: req.payload.id },
          {
            $push: {
              leaveTypes: {
                $each: leaveTypes,
              },
            },
          },
          async function (err, result) {
            if (err) {
              return res.status(401).json({
                status: 401,
                success: false,
                error: err,
              });
            }

            try {
              console.log({ result });

              const updatedDesignationIds = await Designation.find(
                { companyId: req.payload.id },
                "_id"
              );
              console.log({ updatedDesignationIds });

              // Fetch all employees within the company with the updated designations
              const employees = await Employee.find({
                companyId: req.payload.id,
                designationId: {
                  $in: updatedDesignationIds.map(
                    (designation) => designation._id
                  ),
                },
              });

              console.log({ employees });
              // Update leaveAssignment for each employee
              for (const employee of employees) {
                employee.leaveAssignment.push({
                  leaveTypeId: adm._id,
                  leaveName: adm.leaveName,
                  noOfLeaveDays: adm.noOfLeaveDays,
                  noOfLeaveDays: 0,
                  daysLeft: 0,
                  description: adm.description,
                });
                await employee.save();
              }
            } catch (error) {
              console.error(error);
              return res.status(400).json({
                status: 400,
                success: false,
                error: error.message,
              });
            }

            // Return success response after processing all documents
            res.status(200).json({
              status: 200,
              success: true,
              data: "Update Successful",
            });
          }
        );
      })
      .catch((err) => {
        console.error(err);
        res.status(400).json({
          status: 400,
          success: false,
          error: err,
        });
      });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};
export default createLeave;
