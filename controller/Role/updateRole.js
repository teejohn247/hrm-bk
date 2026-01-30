
import dotenv from 'dotenv';
import Role from '../../model/Role';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateRole = async (req, res) => {

    try {

        const {roleName} = req.body;
        const role = await Role.find({_id: req.params.id})

        if(!role){
            res.status(404).json({
                status:404,
                success: false,
                error:'No role Found'
            })
            return
        }

        Role.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                roleName: roleName && roleName,
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
export default updateRole;



