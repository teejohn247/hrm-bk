import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import SalaryScale from "../../model/SalaryScale";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";
import Employee from "../../model/Employees";


const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const assignSalaryScale = async (req, res) => {
  try {
    const { employeeIds, salaryScaleId, salaryLevelId } = req.body;

    // Loop through each employeeId
    for (const employeeId of employeeIds) {
      // Find the employee
      const employee = await Employee.findOne({_id: employeeId});
      if (!employee) {
        return res.status(404).json({status: 404,
          success: false, error: `Employee not found for ID: ${employeeId}` });
      }

      // Find the salary scale
      const salaryScale = await SalaryScale.findOne({_id: salaryScaleId});
      if (!salaryScale) {
        return res.status(404).json({status: 404,
          success: false, error: 'Salary scale not found' });
      }

      // Check if salaryScale.salaryScaleLevels exists
      if (!salaryScale.salaryScaleLevels || !Array.isArray(salaryScale.salaryScaleLevels)) {
        return res.status(400).json({
          status: 400,
          success: false,
          error: 'Invalid salary scale levels'
        });
      }

      // Find the salary level
      const salaryLevel = salaryScale.salaryScaleLevels.find(level => level._id.toString() === salaryLevelId);
      if (!salaryLevel) {
        return res.status(404).json({   
          status: 404,
          success: false, 
          error: 'Salary level not found' 
        });
      }

      // Assign the salary scale and level to the employee
      employee.salaryScale = salaryScale._id;
      employee.salaryLevel = salaryLevel._id;

      await employee.save();
    }

    return res.status(200).json({
         status: 200,
      success: true, message: 'Salary scale and level assigned successfully' });
  } catch (error) {
    console.error('Error assigning salary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
export default assignSalaryScale;
