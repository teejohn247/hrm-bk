import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import Department from '../../model/Department';
import Designation from '../../model/Designation';
import { sendEmail } from '../../config/email';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

const sgMail = require('@sendgrid/mail');
const csv = require('csvtojson');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const bulkEmployee = async (req, res) => {
    try {
        let companyName = await Company.findOne({ _id: req.payload.id });

        console.log({ companyName });
        
        if (!companyName) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Unauthorized, only an admin can upload employees'
            });
        }
        
        let total = await Employee.countDocuments();
        
        console.log(req.file.path);
        
        let emails = [];
        let departments = [];
        let designations = [];
        
        try {
            const jsonObj = await csv().fromFile(req.file.path);
            const employeesToInsert = [];


            for (const data of jsonObj) {
                emails.push(data.email);
                departments.push(data.department);
                designations.push(data.designation);

                let checkDesignation = await Designation.findOne({ companyId: req.payload.id, designationName: data?.designation });
                console.log('de', checkDesignation);

                const checkDept = await Department.findOne({ companyId: req.payload.id, departmentName: data.department });

                const approver = [
                    {
                        approvalType: 'leave',
                        approval: checkDept?.managerName,
                        approvalId: checkDept?.managerId
                    },
                    {
                        approvalType: 'expense',
                        approval: checkDept?.managerName,
                        approvalId: checkDept?.managerId
                    },
                    {
                        approvalType: 'appraisal',
                        approval: checkDept?.managerName,
                        approvalId: checkDept?.managerId
                    },
                ];

                const d = new Date();
                let year = d.getFullYear();
                let letter = data?.firstName?.charAt(0);
                let last = data?.lastName?.charAt(0);
                data.companyName = companyName.companyName;
                data.companyId = req.payload.id;
                data.employeeCode = `EMP-${year}-${letter}${last}${total + 1}`;
                data.approvals = approver;
                data.managerId = checkDept?.managerId;
                data.departmentId = checkDept?._id;
                data.designationId = checkDesignation?._id;
                data.companyRole = data?.companyRole;
                data.designationName = checkDesignation?.designationName;
                data.departmentName = checkDept?.departmentName;
                data.fullName = `${data.firstName} ${data.lastName}`;
                data.leaveAssignment = checkDesignation?.leaveTypes;
                data.managerName = checkDept?.managerName;
                data.expenseDetails = {
                    cardNo: Date.now(),
                    cardHolder: `${data.firstName} ${data.lastName}`,
                    dateIssued: new Date().toISOString(),
                    cardBalance: checkDesignation?.expenseCard[0]?.cardLimit ?? 0,
                    cardLimit: checkDesignation?.expenseCard[0]?.cardLimit ?? 0,
                    cardCurrency: checkDesignation?.expenseCard[0]?.cardCurrency ?? "",
                    cardLExpiryDate: checkDesignation?.expenseCard[0]?.cardExpiryDate ?? "",
                    expenseTypeId: checkDesignation?.expenseCard[0]?.expenseTypeId ?? "",
                };

                // Check if employee already exists
                const existingEmployee = await Employee.findOne({ 
                    companyId: req.payload.id, 
                    email: data.email 
                });

                if (!existingEmployee) {
                    employeesToInsert.push(data);
                }

                total++;
            }

            const uniqueDepartments = [...new Set(departments)];
            const uniqueDesignations = [...new Set(designations)];

            console.log(uniqueDepartments);

            for (const data of uniqueDesignations) {
                const check = await Designation.findOne({ companyId: req.payload.id, designationName: data });
                console.log({ check }, 'logo2');

                if (!check) {
                    let designation = new Designation({
                        designationName: data,
                        companyId: req.payload.id,
                        companyName: companyName.companyName,
                        grade: 0
                    });

                    await designation.save();
                }
            }

            for (const data of uniqueDepartments) {
                const check = await Department.findOne({ companyId: req.payload.id, departmentName: data });

                console.log({ check });

                if (!check) {
                    let department = new Department({
                        departmentName: data,
                        companyId: req.payload.id,
                        companyName: companyName.companyName
                    });

                    await department.save();
                }
            }

            console.log(employeesToInsert, 'employeesToInsert');

            if (employeesToInsert.length > 0) {
                await Employee.insertMany(employeesToInsert);
                console.log("Successfully saved new employees");

                // Send emails to new employees
                for (const employee of employeesToInsert) {
                    const token = utils.encodeToken("", false, employee.email);
                    const receivers = [{ email: employee.email }];

                    let data = `<div>
                        <p style="padding: 32px 0; text-align:left !important;  font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
                        Hi,
                        </p> 

                        <p style="font-size: 16px; text-align:left !important; font-weight: 300;">
                        You have been invited to join <a href="https://www.acehr.app/set-password/${token}">greenpeg ERP Platform</a> as an employee 
                        <br><br>
                        </p>
                    <div>`;

                    let resp = emailTemp(data, 'Employee Invitation');
                    await sendEmail(req, res, employee.email, receivers, 'Employee Invitation', resp);
                }

                res.status(200).json({
                    status: 200,
                    success: true,
                    message: `Upload Successful. ${employeesToInsert.length} new employees added.`
                });
            } else {
                res.status(200).json({
                    status: 200,
                    success: true,
                    message: "No new employees to add. All entries already exist."
                });
            }
        } catch (err) {
            console.error(err);
            res.status(400).json({
                status: 400,
                success: false,
                error: err
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        });
    }
};

export default bulkEmployee;
