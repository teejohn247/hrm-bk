
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import PayrollPeriod from '../../model/PayrollPeriod';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const payrollPeriod = async (req, res) => {

    try {
       
        const { payrollPeriodName, description, startDate, endDate } = req.body;

      
        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await PayrollPeriod.findOne({ companyId:company._id,  payrollPeriodName: payrollPeriodName });

        console.log({appraisal})

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

        let total = await PayrollPeriod.find();

        const d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth();
        let day = d.getDay();


       let group = new PayrollPeriod({
            companyId: req.payload.id,
            companyName: company.companyName,
            payrollPeriodName,
            reference: `PAY-${month}${day}-${total.length + 1}`,
            description, 
            startDate, 
            endDate, 
        })

        await group.save().then((adm) => {
            console.log(adm)
            res.status(200).json({
                status: 200,
                success: true,
                data: adm
            })
        }).catch((err) => {
                console.error(err)
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
export default payrollPeriod;



