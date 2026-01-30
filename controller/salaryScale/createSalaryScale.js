import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import SalaryScale from "../../model/SalaryScale";
import Leave from "../../model/Leaves";
import Expense from "../../model/Expense";
import PayrollCredit from '../../model/Credits';
import PayrollDebit from '../../model/Debit';
import mongoose from 'mongoose';

const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);


const createSalaryScale = async (req, res) => {
  try {
    const { name, description, minAmount, maxAmount, salaryScaleLevels } = req.body;

    let company = await Company.findOne({ _id: req.payload.id });

    let salaryScale = await SalaryScale.findOne({
      name: name,
      compayId: company.companyId
    });

    if (!company.companyName) {
      res.status(400).json({
        status: 400,
        error: "No company has been created for this account",
      });
      return;
    }

    if (salaryScale) {
      res.status(400).json({
        status: 400,
        error: "This salaryScale name already exist",
      });
      return;
    }

    // Initialize arrays to hold the fetched credits and debits
    const payrollCredits = [];
    const payrollDebits = [];

    // Use Promise.all to handle async operations in levels mapping
    const levelsWithCreditsAndDebits = await Promise.all(salaryScaleLevels.map(async level => {
      const creditIds = level.payrollCredits.map(credit => credit.name);
      const debitIds = level.payrollDebits.map(debit => debit.name);

      const credits = await getPayrollCredits(creditIds);
      const debits = await getPayrollDebits(debitIds);

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

      return {
        levelName: level.levelName,
        payrollCredits: creditsWithFields,
        payrollDebits: debitsWithFields,
      };
    }));

    let salary = new SalaryScale({
      companyId: company._id,
      name: name,
      companyName: company.companyName,
      minAmount: minAmount,
      maxAmount: maxAmount,
      salaryScaleLevels: levelsWithCreditsAndDebits,
      description,
      payrollCredits, // This can remain as an array of objects fetched from the database
      payrollDebits,   // This can remain as an array of objects fetched from the database
    });

    await salary.save();
    res.status(200).json({
      status: 200,
      success: true,
      data: salary,
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
export default createSalaryScale;
