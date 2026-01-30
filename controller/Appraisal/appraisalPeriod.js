
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/AppraisalPeriod';
import AppraisalGrp from '../../model/AppraisalGroup';
import AppraisalData from '../../model/AppraisalData';


import Employee from '../../model/Employees';


const sgMail = require('@sendgrid/mail')

dotenv.config();



sgMail.setApiKey(process.env.SENDGRID_KEY);


const createPeriod = async (req, res) => {

    try {
       
        const { name, description, startDate, endDate, activeDate, inactiveDate } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await AppraisalGroup.findOne({ companyId:company._id,  appraisalPeriodName: name });
        let appraisalGroup = await AppraisalGrp.find({ companyId:company._id });
        let employees = await Employee.find({ companyId: req.payload.id }, {_id: 1,appraisals: 1, companyRole:1, companyId: 1, companyName: 1, firstName:1, lastName: 1, role:1, designationName:1, department: 1, fullName: 1, profilePic: 1})
        

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }


        if (appraisal) {
            res.status(400).json({
                status: 400,
                error: 'This period name already exist'
            })
            return;
        }

       let group = new AppraisalGroup({
            companyId: req.payload.id,
            companyName: company.companyName,
            appraisalPeriodName: name, 
            description, 
            startDate, 
            endDate, 
            activeDate, 
            inactiveDate 
        })

        console.log({group})

        
let kpis = []

// Iterate over employees





const promises =   await group.save().then(async (adm) => {

    const promises = [];

    for (const employee of employees) {
        const kpis = [];

        for (const group of appraisalGroup) {

            if (group.assignedEmployees) {
                // const assignedEmployee = group.assignedEmployees.find(emp => emp.employee_id === employee._id);

                const assignedEmployee = group.assignedEmployees.find(emp => String(emp.employee_id) === String(employee._id));

                if (assignedEmployee) {
                    const grroup = await AppraisalGrp.find({ companyId:company._id, _id: group._id });
                  
                    kpis.push({
                        groupId: group._id, // Assuming group._id is the correct ID
                        groupName: group.groupName, // Assuming groupName is a property of the group
                        description: group.description,
                        groupKpis: group.groupKpis
                        // Add other fields from the group if needed
                    });
                }
            }


        }

console.log({adm})
        const newAppraisalData = new AppraisalData({
            companyId: employee.companyId,
            companyName: employee.companyName,
            payrollPeriodId: adm._id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: employee.fullName,
            employeeId: employee._id,
            appraisalPeriodId: adm._id,
            appraisalPeriodName: name,
            description,
            startDate,
            endDate,
            activeDate,
            inactiveDate,
            phone: employee.phoneNumber,
            department: employee.department,
            designation: employee.designationName,
            profilePic: employee.profilePic,
            role: employee.companyRole,
            kpiGroups: kpis
        });

        const savePromise = newAppraisalData.save();
console.log({savePromise})

        promises.push(savePromise);
    }

    const newAppraisalDatas = await Promise.all(promises);
     
          let period = await AppraisalGroup.findOne({ _id: adm._id});

          const combinedPeriodPayData = {
            ...period.toObject(), // Convert Mongoose document to JS object
            appraisalData: [...newAppraisalDatas]
          };
            res.status(200).json({
                status: 200,
                success: true,
                data:  combinedPeriodPayData
            })
        }).catch((err) => {
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default createPeriod;



