import dotenv from "dotenv";
import Company from "../../model/Company";
import Designation from "../../model/SalaryScale";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";
import Employee from "../../model/Employees";
import SalaryScale from "../../model/SalaryScale";
import PayrollCredit from '../../model/Credits';
import PayrollDebit from '../../model/Debit';

const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const updateSalaryScale = async (req, res) => {
  try {
    const { name, description, minAmount, maxAmount, salaryScaleLevels } = req.body;

    let company = await Company.findOne({ _id: req.payload.id });

    console.log({ company });

    if (!company.companyName) {
      res.status(400).json({
        status: 400,
        error: "No company has been created for this account",
      });
      return;
    }

    // Fetch the existing salary scale
    let salaryScale = await SalaryScale.findOne({ _id: req.params.id });

    if (!salaryScale) {
      res.status(404).json({
        status: 404,
        error: "Salary scale not found",
      });
      return;
    }

    console.log({ salaryScaleLevels });

    // Update the salary scale fields
    salaryScale.name = name || salaryScale.name;
    salaryScale.description = description || salaryScale.description;
    salaryScale.minAmount = minAmount || salaryScale.minAmount;
    salaryScale.maxAmount = maxAmount || salaryScale.maxAmount;

    // Update the salary scale levels with credits and debits
    if (salaryScaleLevels) {
      const levelsWithCreditsAndDebits = await Promise.all(salaryScaleLevels.map(async level => {
        const creditNames = level.payrollCredits.map(credit => credit.name);
        const debitNames = level.payrollDebits.map(debit => debit.name);

        const credits = await getPayrollCredits(creditNames);
        const debits = await getPayrollDebits(debitNames);

        // Map the additional fields from the request payload to the credits and debits
        const creditsWithFields = level.payrollCredits.map(credit => ({
          ...credit,
          name: credits.find(c => c._id.toString() === credit.name)?.name || '',
          creditId: credit.name,
          ref: debits.find(c => c._id.toString() === credit.ref)?.name || '',
          refName: credit.ref
        }));

        const debitsWithFields = level.payrollDebits.map(debit => ({
          ...debit,
          name: debits.find(d => d._id.toString() === debit.name)?.name || '',
          debitId: debit.name,
          ref: credits.find(c => c._id.toString() === debit.ref)?.name || '', 
          refName: debit.ref
        }));

        console.log({ creditsWithFields });
        console.log({ debitsWithFields });

        return {
          levelName: level.levelName,
          payrollCredits: creditsWithFields,
          payrollDebits: debitsWithFields,
        };
      }));

      salaryScale.salaryScaleLevels = levelsWithCreditsAndDebits;
    }

    await salaryScale.save();

    res.status(200).json({
      status: 200,
      success: true,
      data: salaryScale,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};



const getPayrollCredits = async (names) => {
  try {
    console.log("Fetching Payroll Credits for names:", names);
    const credits = await PayrollCredit.find({ _id: { $in: names } });
    console.log("Fetched Payroll Credits:", credits);
    return credits;
  } catch (error) {
    console.error("Error fetching payroll credits:", error);
    throw error;
  }
};

const getPayrollDebits = async (names) => {
  try {
    console.log("Fetching Payroll Debits for names:", names);
    const debits = await PayrollDebit.find({ _id: { $in: names } });
    console.log("Fetched Payroll Debits:", debits);
    return debits;
  } catch (error) {
    console.error("Error fetching payroll debits:", error);
    throw error;
  }
};

export default updateSalaryScale;
