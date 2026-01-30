
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

import Department from "../../model/Department";
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData'

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updatePayrollStatus = async (req, res) => {

    try {


        const { payrollEntriesIds, payrollPeriodId, status } = req.body;
        

        const check = await PayrollPeriod.findOne({ _id: payrollPeriodId });
        let company = await Company.findOne({ _id: req.payload.id });
        let emp = await PeriodPayData.find({ _id: { $in : payrollEntriesIds }});

        if (!company) {
            res.status(400).json({
                status: 400,
                error: "Company doesn't exist"
            });
            return;
        }

        if (emp.length < 1) {
            res.status(400).json({
                status: 400,
                error: "Payroll Data does not exist"
            });
            return;
        }

        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Payroll Period doesn't exist"
            });
            return;
        }
      
        PeriodPayData.updateMany({ _id: { $in : payrollEntriesIds }}, { 
            $set: { 
                status: status
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

                    let roll = await PeriodPayData.find({payrollPeriodId: payrollPeriodId});

                    // Extract statuses from roll
                    let statuses = roll.map(period => period.status);

                    // Check if all statuses are 'completed'
                    let allCompleted = statuses.every(status => status === 'Completed');
                    let someCompleted = statuses.every(status => status === 'Completed');


                    PayrollPeriod.update({ _id: payrollPeriodId}, { 
                        $set: { 
                            status: allCompleted == true ? "Completed" : allCompleted == false && someCompleted == true ? "Processing" : "Pending"
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
export default updatePayrollStatus;



