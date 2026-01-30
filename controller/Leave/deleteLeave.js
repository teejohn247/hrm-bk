import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import Leave from "../../model/Leaves";
import Employee from "../../model/Employees";
import Designation from "../../model/Designation";

const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    let company = await Company.findOne({ _id: req.payload.id });

    if (!leaveId) {
      return res.status(400).json({
        status: 400,
        error: "Leave ID is required",
      });
    }

    let leave = await Leave.findOne({ _id: leaveId, companyId: req.payload.id });

    if (!leave) {
      return res.status(404).json({
        status: 404,
        error: "Leave not found",
      });
    }

    await Leave.deleteOne({ _id: leaveId });

    await Designation.updateMany(
      { companyId: req.payload.id },
      {
        $pull: {
          leaveTypes: { leaveTypeId: leaveId },
        },
      }
    );

    const updatedDesignationIds = await Designation.find(
      { companyId: req.payload.id },
      "_id"
    );

    const employees = await Employee.find({
      companyId: req.payload.id,
      designationId: {
        $in: updatedDesignationIds.map((designation) => designation._id),
      },
    });

    for (const employee of employees) {
      employee.leaveAssignment = employee.leaveAssignment.filter(
        (assignment) => assignment.leaveTypeId.toString() !== leaveId
      );
      await employee.save();
    }

    return res.status(200).json({
      status: 200,
      success: true,
      data: "Leave deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

export default deleteLeave;
