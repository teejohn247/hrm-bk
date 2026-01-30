
import dotenv from 'dotenv';
import Employee from '../../model/Designation';
import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addDesignationLeave = async (req, res) => {

    try {
        
        const { leaveName, noOfDays, paid } = req.body;

        let check = await Employee.find({ _id: req.params.id },
            { leaveTypes: { $elemMatch: { leaveName: leaveName} } })


            console.log({check})
    

        if(check[0].leaveTypes.length > 0){

    
        Employee.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                "leaveTypes.$[i].leaveName": leaveName && leaveName,
                "leaveTypes.$[i].noOfDays": noOfDays && noOfDays,
                "leaveTypes.$[i].paid": paid && paid
            }
       },
       { 
        arrayFilters: [
            {
                "i._id": check[0].leaveTypes[0]._id
            }
        ]},
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

        } else{
            Employee.findOneAndUpdate({ _id: req.params.id}, 
                { $push: { leaveTypes: { 
                    "leaveName": leaveName && leaveName,
                    "noOfDays": noOfDays && noOfDays,
                    "paid": paid && paid
                 } }
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
        }


    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default addDesignationLeave;



