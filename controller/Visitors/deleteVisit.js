
import dotenv from 'dotenv';
import Role from '../../model/Visitor';


import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const deleteVisit = async (req, res) => {

    try {


        const role = await Role.find({_id: req.params.id})

        if(!role){
            res.status(404).json({
                status:404,
                success: false,
                error:'No role Found'
            })
            return
        }
        Role.remove({ _id: req.params.id },
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
                        data: "Role Deleted successfully!"
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
export default deleteVisit;



