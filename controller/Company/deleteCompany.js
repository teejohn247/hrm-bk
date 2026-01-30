import dotenv from "dotenv";
import Employee from "../../model/Employees";
import Department from "../../model/Department";
import Designation from "../../model/Designation";

import Company from "../../model/Company";
import AuditTrail from "../../model/AuditTrail";
import LeaveRecords from "../../model/LeaveRecords";
import Leave from "../../model/Leaves";
import Roles from "../../model/Roles";
import Role from "../../model/Role";
import PayrollPeriod from "../../model/PayrollPeriod";
import Kpi from "../../model/Kpi";
import FinalRating from "../../model/FinalRating";
import Debit from "../../model/Debit";
import Credit from "../../model/Credits";
import AppraisalGroup from "../../model/AppraisalGroup";
import AppraisalPeriod from "../../model/AppraisalPeriod";


import Expense from "../../model/Expense";
import ExpenseRequest from "../../model/ExpenseRequests";



dotenv.config();

const deleteCompany = async (req, res) => {
  try {
    let company = await Company.find({ _id: req.payload.id });
console.log({company})


    if (!company) {
      res.status(400).json({
        status: 400,
        error: "Company not found",
      });
      return;
    }

    const deletePromises = [

      await Employee.deleteMany({ companyId: req.payload.id }),
      await Department.deleteMany({ companyId: req.payload.id }),
      await Designation.deleteMany({ companyId: req.payload.id }),
      await LeaveRecords.deleteMany({ companyId: req.payload.id }),
      await Leave.deleteMany({ companyId: req.payload.id }),
      await Expense.deleteMany({ companyId: req.payload.id }),
      await ExpenseRequest.deleteMany({ companyId: req.payload.id }),
      await Roles.deleteMany({ companyId: req.payload.id }),
      await Role.deleteMany({ companyId: req.payload.id }),
      await PayrollPeriod.deleteMany({ companyId: req.payload.id }),
      await Kpi.deleteMany({ companyId: req.payload.id }),
      await FinalRating.deleteMany({ companyId: req.payload.id }),
      await Debit.deleteMany({ companyId: req.payload.id }),
      await Credit.deleteMany({ companyId: req.payload.id }),
      await AuditTrail.deleteMany({ companyId: req.payload.id }),
      await AppraisalGroup.deleteMany({ companyId: req.payload.id }),
      await AppraisalPeriod.deleteMany({ companyId: req.payload.id }),
    ]

    V

   Company.deleteOne({ _id: req.payload.id }, async function (err, result) {
      console.log(result);

      if (err) {
        res.status(401).json({
          status: 401,
          success: false,
          error: err,
        });
      } else {
        
     

          res.status(200).json({
            status: 200,
            success: true,
            data: "Company Deleted successfully!",
          });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};
export default deleteCompany;
