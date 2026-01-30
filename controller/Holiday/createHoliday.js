
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Holiday from '../../model/Holidays';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const createHoliday = async (req, res) => {

    try {
       
        const { holidayName, description, date } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });

        if(!holidayName || holidayName == ''){

            res.status(400).json({
                status: 400,
                error: 'holiday Name is required'
            })
            return;
        }

        let designation = await Holiday.findOne({ companyId:company._id,  holidayName: holidayName });

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
                error: 'This holidayName already exist'
            })
            return;
        }

       let holiday = new Holiday({
            holidayName,
            companyId: req.payload.id,
            companyName: company.companyName,
            date,
            description,
        })

        await holiday.save().then((adm) => {
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
export default createHoliday;



