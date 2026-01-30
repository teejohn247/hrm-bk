import dotenv from 'dotenv';
import Employee from '../../model/PeriodPayData';
import EmployeeTable from '../../model/EmployeeTable';
import Roles from '../../model/Roles';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import uploadFiles from '../../middleware/uploadGC';
import exportFile from '../../middleware/export';
import sgMail from '@sendgrid/mail';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

// Function to generate XLSX file from JSON
function generateXLSX(jsonData) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(jsonData);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet 1');
  const xlsxFilePath = path.join(__dirname, `employees_${new Date().getTime()}.xlsx`);
  xlsx.writeFile(wb, xlsxFilePath);
  return xlsxFilePath;
}

function removeArrayFields(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const newObj = {};
  for (const key in obj) {
    if (!Array.isArray(obj[key]) && typeof obj[key] === 'object') {
      newObj[key] = removeArrayFields(obj[key]);
    } else if (!Array.isArray(obj[key])) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

const exportPayroll = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const companyId = req.payload.id;

    const employees = await Employee.find({ payrollPeriodId: req.params.id })

    console.log({employees})

    const count = await Employee.countDocuments({ payrollPeriodId: req.params.id });

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'No payroll found'
      });
    }

    const fieldsToExclude = ['_id', '__v'];

    const modifiedEmployees = employees.map(employee => {
      const modifiedEmployee = {};
      for (const key in employee._doc) {
        if (!fieldsToExclude.includes(key)) {
          modifiedEmployee[key] = employee[key];
        }
      }
      return modifiedEmployee;
    });

    console.log({modifiedEmployees})

    const xlsxFilePath = generateXLSX(modifiedEmployees);
    const fileUrl = await exportFile(xlsxFilePath);
    
    // Delete the generated local file after uploading to GCS
    fs.unlinkSync(xlsxFilePath);

    return res.status(200).json({
      status: 200,
      success: true,
      downloadLink: fileUrl,
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

export default exportPayroll;
