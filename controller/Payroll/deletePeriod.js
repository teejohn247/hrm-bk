
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import FinalRating from '../../model/FinalRating';
import Period from '../../model/AppraisalPeriod'
import PayrollPeriod from '../../model/PayrollPeriod';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const deletePayrollPeriod = async (req, res) => {

    try {
       
          
        if (!req.params.id) {
            res.status(400).json({
                status: 400,
                error: 'Id is required'
            })
            return;
        }


        let leave = await PayrollPeriod.findOne({ _id: req.params.id });


        if (!leave) {
            res.status(400).json({
                status: 400,
                error: 'Payroll period not found'
            })
            return;
        }


        PayrollPeriod.remove({ _id: req.params.id},
            function (
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
                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: "Deleted Successfully"
                    })

                }
            })


    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default deletePayrollPeriod;