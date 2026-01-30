
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Credits from '../../model/Credits';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const payrollSettings = async (req, res) => {

    try {
       
        const { payrollPeriodFrequency } = req.body;

        let company = await Company.findOne({ _id: req.payload.id });

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }

        Company.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                payrollPeriodFrequency: payrollPeriodFrequency && payrollPeriodFrequency,
            }
        },
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
                        data: "Update Successful"
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
export default payrollSettings;