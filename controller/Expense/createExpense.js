
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const createExpense = async (req, res) => {

    try {
       
        const {expenseType, description } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });

        let designation = await Leave.findOne({ companyId:company._id, expenseType:expenseType });

        console.log({company})

        if (!company.companyName) {

            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }


        if (designation) {

            res.status(400).json({
                status: 400,
                error: 'This expenseType already exist'
            })
            return;
        }

       let leave = new Leave({
       expenseType,
            companyId: req.payload.id,
            companyName: company.companyName,
            description,
        })

        await leave.save().then((adm) => {
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
export default createExpense;



