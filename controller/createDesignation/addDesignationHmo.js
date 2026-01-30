
import dotenv from 'dotenv';
import Employee from '../../model/Designation';
import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addDesignationHmo = async (req, res) => {

    try {
        
        const { hmoName, features, description } = req.body;

        // const check = await Employee.findOne({ leaveName })


        let check = await Employee.find({ _id: req.params.id },
            { hmoPackages: { $elemMatch: { hmoName: hmoName} } })

        // if (check) {
        //     res.status(400).json({
        //         status: 400,
        //         error: "Leave Name already exist"
        //     })
        //     return;
        // }

        console.log(check[0].hmoPackages)
      
        if(check[0].hmoPackages.length > 0){

    
        Employee.findOneAndUpdate({ _id: req.params.id}, {
            $set: { 
                "hmoPackages.$[i].hmoName": hmoName && hmoName,
                "hmoPackages.$[i].features": features && features,
                "hmoPackages.$[i].description": description && description
            }
       },
       { 
        arrayFilters: [
            {
                "i._id": check[0].hmoPackages[0]._id
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
                { $push: { hmoPackages: { 
        
                    hmoName: hmoName && hmoName,
                    features: features && features,
                    description: description && description
        
                 }}
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
export default addDesignationHmo;



