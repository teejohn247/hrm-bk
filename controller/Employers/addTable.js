
import dotenv from 'dotenv';
import Employee from '../../model/EmployeeTable';
import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addTable = async (req, res) => {

    try {

        const {EmployeeTable} = req.body;


       let employee = new Employee({
            EmployeeTable
        })


        await employee.save().then((adm) => {

            // sgMail.send(msg)
            console.log(adm)
            res.status(200).json({
                status: 200,
                success: true,
                data: "Success!"
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
export default addTable;



