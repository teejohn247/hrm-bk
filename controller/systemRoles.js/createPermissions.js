
import dotenv from 'dotenv';
import Roles from '../../model/createPermissions';



dotenv.config();


const createPermissions = async (req, res) => {

    try {



        const { permissions } = req.body;


        let roles = new Roles ({
            // role_name, 
            permissions,
            created_by: req.payload.id
        })

        await roles.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: roles
        })

       

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default createPermissions;
