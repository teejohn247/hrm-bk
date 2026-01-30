
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Credits from '../../model/PeriodPayData';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const updatePeriodData= async (req, res) => {

    try {
       
        const { role, bonus, totalEarnings, dynamicFields, deductions, netEarnings, status} = req.body;

        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await Credits.findOne({ companyId:company._id,  _id: req.params.id });

        console.log(req.body)

        console.log({appraisal})

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }


        if (!appraisal) {
            res.status(400).json({
                status: 400,
                error: 'This entry does not exist'
            })
            return;
        }

        // if (appraisal && String(appraisal._id) !== req.params.id) {
        //     res.status(400).json({
        //         status: 400,
        //         error: 'This credit name already exist'
        //     })
        //     return;
        // }

        Credits.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                role: role && role, 
                bonus: bonus && bonus, 
                dynamicFields: dynamicFields && dynamicFields,
                netEarnings: netEarnings && netEarnings,
                totalEarnings: totalEarnings && totalEarnings,
                deductions: deductions && deductions,

                // status: status && status
            }
       },
       { upsert: true, new: true },
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
export default updatePeriodData;



