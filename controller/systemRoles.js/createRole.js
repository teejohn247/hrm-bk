
import dotenv from 'dotenv';
import Role from '../../model/Roles';
import Company from '../../model/Company';



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const createRole = async (req, res) => {

    try {
       
        const {roleName, permissions} = req.body;

        let roleN = await Role.findOne({ companyId: req.payload.id, roleName: roleName });

        let company = await Company.findOne({ _id: req.payload.id });

        console.log(roleN)



        if (roleN) {

            res.status(400).json({
                status: 400,
                error: 'This role Name already exist'
            })
            return;
        }

       let role = new Role({
            roleName,
            companyId: req.payload.id,
            companyName: company.companyName,
            
            permissions
        })


        await role.save().then((adm) => {

            // sgMail.send(msg)
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
export default createRole;



