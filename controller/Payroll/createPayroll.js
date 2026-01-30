
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Payroll from '../../model/Payroll';

const csv = require('csvtojson');



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const createPayroll = async (req, res) => {

    try {

        console.log(req.file)
       
        const { name, description} = req.body;

        let company = await Company.findOne({ _id: req.payload.id });

        csv()
        .fromFile(req.file.path)
        .then(async (jsonObj) => {
        console.log({jsonObj})

        jsonObj.map((data, index) => {
            data.companyName = company.companyName;
            data.companyId = req.payload.id;
        })
        for (const data of jsonObj) {
            console.log({data})
            let leave = new Payroll({
                fields: data
                })

                console.log({leave})
        
                await leave.save().then((adm) => {
                    console.log({adm});
                  
                }).catch((err) => {
                        console.error(err)
                        res.status(400).json({
                            status: 400,
                            success: false,
                            error: err
                        })
                    })
            }
            res.status(200).json({
                status: 200,
                success: true,
                data: jsonObj
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
export default createPayroll;