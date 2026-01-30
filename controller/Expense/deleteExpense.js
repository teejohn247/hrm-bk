
import dotenv from 'dotenv';
import Department from '../../model/Expense';
import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const deleteExpense = async (req, res) => {

    try {

        const department = await Department.find({_id: req.params.id})

        console.log(department)
        if(department.length < 1){
            res.status(404).json({
                status:404,
                success: false,
                error:'No Expense Type Found'
            })
            return
        }else{
            Department.remove({ _id: req.params.id },
                function (
                    err,
                    result
                ) {
    
                    console.log(result)
    
                    if (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err
                        })
                    }
                    else {
                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "Expense Type Deleted successfully!"
                        })
                    }
    
                })
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default deleteExpense;



