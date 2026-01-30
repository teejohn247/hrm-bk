
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Role';
import Company from '../../model/Company';
import Department from '../../model/Department';
import Designation from '../../model/Designation';
import SalaryScale from '../../model/SalaryScale';
import AuditTrail from '../../model/AuditTrail';
import { sendEmail } from '../../config/email';




import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';
import { date } from 'joi';
import moment from 'moment/moment';


const sgMail = require('@sendgrid/mail')

dotenv.config();


const inviteEmployee = async (req, res) => {

    try {

        console.log(new Date().toISOString())
        const { firstName, lastName, email, phoneNumber, dateOfBirth, companyRole, salaryScaleId,  gender, departmentId, companyRoleId, designationId,  employmentStartDate,
        employmentType, reportingTo} = req.body;


        let total = await Employee.find();

        console.log({req})


        // let checkRole = await Roles.findOne({_id: companyRoleId})
        let checkDesignation = await Designation.findOne({_id: designationId})

        if(salaryScaleId){
            var checkScale = await SalaryScale.findOne({_id: salaryScaleId})

        }

        console.log({checkDesignation});

        let checkDept= await Department.findOne({_id: departmentId})
        // let checkName= await Employee.findOne({_id: reportingTo })
        console.log({checkDept});

        let company = await Company.find({ _id: req.payload.id });
        let checkUser = await Employee.findOne({companyId: req.payload.id, email: email });


        console.log(checkUser);

        // const check = await Employee.findOne({ _id: managerId });

        if (checkUser){
            return res.status(400).json({
                status: 400,
                error: 'Email already exist'
            })
           
        }
        if (!company){
            return res.status(400).json({
                status: 400,
                error: `Company does not exist`
            })
           
        }

        if (!checkDesignation){
            return res.status(400).json({
                status: 400,
                error: `Designation does not exist`
            })
        }


        console.log('hgh')
        console.log(company)


            let checkCompany = await Employee.find(
                {   companyId: req.payload.id,
                    email: email},
                
              );

            var comp= false

        if (checkCompany.length > 0){
            checkCompany.some((chk, i) => {
                console.log({chk})
                // if(chk.officialInformation.length > 0){
                    comp = true
                // }
            })
        }

        if(comp == true){
            return res.status(400).json({
                status: 400,
                error: `An employee already exist with email: ${email}`
            })
        }

        const d = new Date();
        let year = d.getFullYear();
        // var timeNow = (new Date()).getTime().toString();
     
        console.log('hgh')
        console.log(lastName)
        console.log(firstName)

        let letter = firstName.charAt(0);
        let last = lastName.charAt(0);


        let leaveType = []


        const approver = [{
            approvalType: 'leave',
            approval: checkDept.managerName,
            approvalId: checkDept.managerId
        },
        {
            approvalType: 'expense',
            approval: checkDept.managerName,
            approvalId: checkDept.managerId
        },
        {
            approvalType: 'appraisal',
            approval: checkDept.managerName,
            approvalId: checkDept.managerId
        },
    ]

    console.log({approver})

    console.log(checkDesignation, 'it')
       let employee = new Employee({
            companyName: company[0].companyName,
            companyId: req.payload.id,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                phoneNumber,
                fullName: `${firstName} ${lastName}`,
                employeeCode: `EMP-${year}-${letter}${last}${total.length + 1}`,
                salaryScaleId: salaryScaleId && salaryScaleId,
                salaryScale:salaryScaleId && checkScale.name,
                // role: companyRoleId,
                companyRole: companyRole,
                // roleName: checkRole.roleName,
                designationName: checkDesignation.designationName,
                // designation: checkDesignation,
                designationId,
                departmentId: departmentId,
                department: checkDept.departmentName,
                employmentType,
                employmentStartDate,
                managerId:  checkDept.managerId && checkDept.managerId,
                managerName: checkDept.managerName && checkDept.managerName,
                email,
                leaveAssignment: checkDesignation.leaveTypes && checkDesignation.leaveTypes,
                approvals: approver,
                expenseDetails: {
                    cardNo: Date.now(),
                    cardHolder: `${firstName} ${lastName}`,
                    dateIssued:  new Date().toISOString(),
                    cardBalance: checkDesignation?.expenseCard[0]?.cardLimit ? checkDesignation.expenseCard[0].cardLimit : 0,
                    cardLimit: checkDesignation?.expenseCard[0]?.cardLimit ? checkDesignation.expenseCard[0].cardLimit : 0,
                    cardCurrency: checkDesignation?.expenseCard[0]?.cardCurrency ? checkDesignation.expenseCard[0].cardCurrency : "",
                    cardLExpiryDate: checkDesignation?.expenseCard[0]?.cardExpiryDate ? checkDesignation.expenseCard[0].cardExpiryDate : "",
                    expenseTypeId: checkDesignation?.expenseCard[0]?.expenseTypeId ? checkDesignation.expenseCard[0].expenseTypeId : "",
                }
        })


        await employee.save().then(async(adm) => {




            const token = utils.encodeToken(adm._id, false, adm.email);

            console.log({token})
    
            console.log('{employee}')
    
            let data = `<div>
            <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
            Hi ${firstName},
            </p> 
    
            <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
            You have been invited to join <a href="https://www.acehr.app/set-password/${token}">greenpeg ERP Platform</a> as an employee 
    
            <br><br>
            </p>
            
            <div>`
    
           let resp = emailTemp(data, 'Employee Invitation')

           const receivers = [
            {
              email: email
            }
          ]
    
            await sendEmail(req, res, email, receivers, 'Employee Invitation', resp);
    
            console.log('{employee}2')

console.log('checkDept.assignedAppraisals',checkDept.assignedAppraisals)
let approverGrp = []

            for (const group of checkDept.assignedAppraisals) {

                approverGrp.push({
                    appraisalId: group.appraisalId,
                    appraisalName: group.appraisalName})
            }


            Employee.findOneAndUpdate({ _id: adm._id}, { 
                $push: {assignedAppraisals: approverGrp},
           },{ upsert: true },
                async function (
                    err,
                    result
                ) {
                    if (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err
                        })
    
                    } else {
                        console.log('gous',{result})
    
                        // const manager = await AppraisalGroup.findOne({_id: groupId});
    
                        // res.status(200).json({
                        //     status: 200,
                        //     success: true,
                        //     data: "Successfully assigned"
                        // })
    
                    }
                })

            // }
        // }else{
        //     res.status(200).json({
        //         status: 200,
        //         success: true,
        //         data: "Update Successful"
        //     })

        // }

















    
         
            AuditTrail.findOneAndUpdate({ companyId: company[0]._id}, 
                { $push: { humanResources: { 

                    userName: `${firstName} ${lastName}`,
                    email: `${email}`,
                    action: `Super admin invited ${firstName} ${lastName} as an employee`,
                    dateTime: new Date()
                 }}
               },
                    async function (
                        err,
                        result
                    ) {
                        if (err) {
                            res.status(401).json({
                                status: 401,
                                success: false,
                                error: err
        
                            })
        
                        } else {

                            console.log({result})

                       let checkUsers = await Employee.findOne({companyId: req.payload.id, email });

        
                                res.status(200).json({
                                    status: 200,
                                    success: true,
                                    data:checkUsers
                                })
                        }
                    })
                // sgMail.send(msg)
            // console.log(adm)
            // return res.status(200).json({
            //     status: 200,
            //     success: true,
            //     data: adm
            // })
        }).catch((err) => {
                console.error(err)
               return res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })

   
        // await employee.save().then((adm) => {

          
                // });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default inviteEmployee;



