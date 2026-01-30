import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import utils from '../../config/utils';
import exportFile from '../../middleware/export';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

dotenv.config();

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

const exportEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const companyId = req.payload.id;

    const employees = await Employee.find({ companyId })
      .sort({ _id: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'No employees found'
      });
    }

    const fieldsToExclude = [
      'expenseDetails', 
      'approvals', 
      'leaveAssignment', 
      'assignedAppraisals', 
      '__v', 
      'password', 
      'officialInformation', 
      'paymentInformation', 
      'roles', 
      'appraisals'
    ];

    const modifiedEmployees = employees.map(employee => {
      const filteredEmployee = Object.fromEntries(
        Object.entries(employee).filter(([key]) => !fieldsToExclude.includes(key))
      );
      return removeArrayFields(filteredEmployee);
    });

    const xlsxFilePath = generateXLSX(modifiedEmployees);
    const fileUrl = await exportFile(xlsxFilePath);
    
    // Clean up the temporary file
    fs.unlinkSync(xlsxFilePath);

    return res.status(200).json({
      status: 200,
      success: true,
      downloadLink: fileUrl,
      totalExported: modifiedEmployees.length
    });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      error: 'Failed to export employees'
    });
  }
};

export default exportEmployees;
