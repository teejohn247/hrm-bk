
import dotenv from 'dotenv';
import Employee from '../../model/Role';
import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addLeave = async (req, res) => {

    try {
        
        const { leaveName, noOfDays, paid } = req.body;

        // const check = await Employee.findOne({ _id: req.params.roleId, "leaveType.$.leaveName": leaveName })

        // if (check) {
        //     res.status(400).json({
        //         status: 400,
        //         error: "Leave Name already exist"
        //     })
        //     return;
        // }

        let check = await Employee.find({ _id: req.params.roleId },
            { leaveType: { $elemMatch: { leaveName: leaveName} } })


            console.log(check)
    

        if(check[0].leaveType.length > 0){

    
        Employee.findOneAndUpdate({ _id: req.params.roleId}, { 
            $set: { 
                "leaveType.$[i].leaveName": leaveName && leaveName,
                "leaveType.$[i].noOfDays": noOfDays && noOfDays,
                "leaveType.$[i].paid": paid && paid
            }
       },
       { 
        arrayFilters: [
            {
                "i._id": check[0].leaveType[0]._id
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
            Employee.findOneAndUpdate({ _id: req.params.roleId}, 
                { $push: { leaveType: { 
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
export default addLeave;



