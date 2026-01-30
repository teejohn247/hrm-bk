
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import addDepartment from '../Department/addDepartment';
import Designation from "../../model/Designation";
import Department from "../../model/Department";
import SalaryScale from "../../model/SalaryScale"



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateEmployeeAdmin = async (req, res) => {

    try {
   
        // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
        // employmentType} = req.body;

        const { firstName, lastName, email, phoneNumber, dateOfBirth, maritalStatus, salaryScaleId, nationality, nextOfKinAddress, nextOfKinFullName, nextOfKinGender, nextOfKinRelationship, nextOfKinPhoneNumber, city, country, address, personalEmail, companyRole, gender, departmentId, companyRoleId, designationId,  employmentStartDate,
            employmentType } = req.body;

        let company = await Company.find({ _id: req.payload.id });

        console.log({salaryScaleId})

        if(salaryScaleId || salaryScaleId !== ""){
           var checkScale = await SalaryScale.findOne({_id: salaryScaleId})
        }



        console.log({checkScale})

        if (!req.params.id) {
            res.status(400).json({
                status: 400,
                error: "Employee ID is required"
            });
            return;
        }


        const check = await Employee.findOne({ _id: req.params.id });
        // let checkRole = await Roles.findOne({_id: companyRoleId});
        if(designationId){
            var checkDesignation = await Designation.findOne({_id: designationId});

            if (!checkDesignation) {
                res.status(400).json({
                    status: 400,
                    error: "Designation doesn't exist"
                });
                return;
            }
        }
        if(departmentId){
           var checkDept = await Department.findOne({_id: departmentId});

           if (!checkDept) {
            res.status(400).json({
                status: 400,
                error: "Department doesn't exist"
            });
            return;
        }



        }
      
        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            });
            return;
        }

        Employee.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                    firstName: firstName && firstName,
                    lastName: lastName && lastName,
                    dateOfBirth: dateOfBirth && dateOfBirth,
                    address: address && address,
                    personalEmail: personalEmail && personalEmail,
                    gender: gender && gender,
                    phoneNumber: phoneNumber && phoneNumber,
                    country: country && country,
                    city: city && city,
                    maritalStatus: maritalStatus && maritalStatus,
                    nationality: nationality && nationality,
                    companyRole: companyRole && companyRole,
                    designationId: designationId && designationId,
                    designation: checkDesignation && checkDesignation.designationName,
                    designationName:checkDesignation && checkDesignation.designationName,
                    department: checkDept && checkDept.departmentName,
                    departmentId: departmentId && departmentId,
                    employmentType: employmentType && employmentType,
                    fullName: firstName && lastName && `${firstName} ${lastName}`,
                    salaryScaleId: salaryScaleId && salaryScaleId,
                    salaryScale: checkScale?.name && checkScale?.name,
                    managerId: checkDept && checkDept.managerId,
                    managerName: checkDept && checkDept?.managerName,
                    profilePic: req.body.image && req.body.image,
                    nextOfKinFullName: nextOfKinFullName && nextOfKinFullName,
                    nextOfKinAddress: nextOfKinAddress && nextOfKinAddress,
                    nextOfKinGender: nextOfKinGender && nextOfKinGender,
                    nextOfKinPhoneNumber: nextOfKinPhoneNumber && nextOfKinPhoneNumber,
                    nextOfKinRelationship: nextOfKinRelationship && nextOfKinRelationship
                }
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

                    return;

                } else {

        console.log({checkDept}, 'done')


                    if(checkDept.managerId !== ""){
                     console.log({result}, 'done2')

                       const check = await Employee.findOne({ _id: checkDept.managerId });


                       const approval = [{
                        approvalType: 'leave',
                        approval: `${check?.firstName} ${check?.lastName}`,
                        approvalId: checkDept?.managerId
                    },
                    {
                        approvalType: 'expense',
                        approval: `${check?.firstName} ${check?.lastName}`,
                        approvalId: checkDept?.managerId
                    },
                    {
                        approvalType: 'appraisal',
                        approval: `${check?.firstName} ${check?.lastName}`,
                        approvalId: checkDept?.managerId
                    }]

                       Employee.findOneAndUpdate({ _id: req.params.id}, { 
                        $set: { 
                            approvals: approval
                        }
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
            
                                return;
            
                            } else {
                                
                            }
                        })
                    }  

                    const checkUpdated = Employee.findOne({ _id: req.params.id })
                                AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
                                    { $push: { humanResources: { 
                                        userName: checkUpdated?.firstName && checkUpdated?.lastName,
                                        email: checkUpdated?.email && checkUpdated?.email,
                                        action: `Super admin updated ${checkUpdated?.firstName} ${checkUpdated?.lastName} records`,
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
                                                return;
                            
                                            } else {
        console.log({result}, 'done3')

                              
                                                const updated = await Employee.findOne({ _id: req.params.id})
                            
                                                res.status(200).json({
                                                    status: 200,
                                                    success: true,
                                                    data: updated
                                                })
                                                return;
                            
                                            }
                                        })
                }
            })



    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })

        return;

    }
}
export default updateEmployeeAdmin;



