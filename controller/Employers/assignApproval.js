
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

import Designation from "../../model/Designation";
import Department from "../../model/Department";

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const assignApproval = async (req, res) => {

    try {
   
        // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
        // employmentType} = req.body;

        const { employees, managerId, approvalType } = req.body;
        

        const check = await Employee.findOne({ _id: managerId });
        let company = await Company.findOne({ _id: req.payload.id });

        if (!company) {
            res.status(400).json({
                status: 400,
                error: "Company doesn't exist"
            });
            return;
        }

        if (approvalType !== "appraisal" && approvalType !== "expense" && approvalType !== "leave") {
          res.status(400).json({
              status: 400,
              error: "Company doesn't exist"
          });
          return;
      }

        if (check.companyId !== company._id.toString()) {
            res.status(400).json({
                status: 400,
                error: "Manager does not belong to this company"
            });
            return;
        }

        console.log({employees});

      
        if(approvalType == "appraisal"){
          Employee.updateMany(
            { _id: { $in: employees }, 'approvals.approvalType': { $ne: 'appraisal' } },
            {
              $push: {
                approvals: {
                  approvalType: 'appraisal',
                  approval: `${check.firstName} ${check.lastName}`,
                  approvalId: managerId
                }
              }
            },
            async (err, result) => {
              if (err) {
                console.error('Error updating employees:', err);
              } else {
    
                Employee.updateMany(
                    { _id: { $in: employees }, 'approval.approvalType': 'appraisal' },
                    {
                      $set: {
                        'approvals.$[elem].approval': `${check.firstName} ${check.lastName}`,
                        'approvals.$[elem].approvalId': managerId
                      }
                    },
                    {
                      arrayFilters: [{ 'elem.approvalType': 'appraisal' }]
                    },
                    (err, result) => {
                      if (err) {
                        console.error('Error updating employees:', err);
                      } else {
                        console.log('Employees updated successfully with $set:', result);
                        
                      }
                    }
                  );
    
                  Employee.updateOne({ _id: managerId }, { 
                    $set: { 
                        isManager: true
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
        
                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })
                            return;
                        }
                    })
    
              }
            }
          );
        } else if(approvalType == "leave"){
          Employee.updateMany(
            { _id: { $in: employees }, 'approvals.approvalType': { $ne: 'leave' } },
            {
              $push: {
                approvals: {
                  approvalType: 'leave',
                  approval: `${check.firstName} ${check.lastName}`,
                  approvalId: managerId
                }
              }
            },
            async (err, result) => {
              if (err) {
                console.error('Error updating employees:', err);
              } else {
    
                Employee.updateMany(
                    { _id: { $in: employees }, 'approval.approvalType': 'leave' },
                    {
                      $set: {
                        'approvals.$[elem].approval': `${check.firstName} ${check.lastName}`,
                        'approvals.$[elem].approvalId': managerId
                      }
                    },
                    {
                      arrayFilters: [{ 'elem.approvalType': 'leave' }]
                    },
                    (err, result) => {
                      if (err) {
                        console.error('Error updating employees:', err);
                      } else {
                        console.log('Employees updated successfully with $set:', result);
                        
                      }
                    }
                  );
    
                  Employee.updateOne({ _id: managerId }, { 
                    $set: { 
                        isManager: true
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
        
                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })
                            return;
                        }
                    })
    
              }
            }
          );
        }else if(approvalType == "expense"){
          Employee.updateMany(
            { _id: { $in: employees }, 'approvals.approvalType': { $ne: 'expense' } },
            {
              $push: {
                approvals: {
                  approvalType: 'expense',
                  approval: `${check.firstName} ${check.lastName}`,
                  approvalId: managerId
                }
              }
            },
            async (err, result) => {
              if (err) {
                console.error('Error updating employees:', err);
              } else {
    
                Employee.updateMany(
                    { _id: { $in: employees }, 'approval.approvalType': 'expense' },
                    {
                      $set: {
                        'approvals.$[elem].approval': `${check.firstName} ${check.lastName}`,
                        'approvals.$[elem].approvalId': managerId
                      }
                    },
                    {
                      arrayFilters: [{ 'elem.approvalType': 'expense' }]
                    },
                    (err, result) => {
                      if (err) {
                        console.error('Error updating employees:', err);
                      } else {
                        console.log('Employees updated successfully with $set:', result);
                        
                      }
                    }
                  );
    
                  Employee.updateOne({ _id: managerId }, { 
                    $set: { 
                        isManager: true
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
        
                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })
                            return;
                        }
                    })
    
              }
            }
          );
  

          }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })

        return;

    }
}
export default assignApproval;



