import Permissions from '../../model/createPermissions';
import dotenv from 'dotenv';


dotenv.config();


const fetchPermissions = async(req, res) => {
    try{
        const { page, limit } = req.query;

        const fetchPermissions = await Permissions.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await Permissions.find().countDocuments();


        if(!fetchPermissions){
            res.status(404).json({
                status:404,
                success: false,
                error:'No Role Found'
            })
            return
        }else{
            res.status(201).json({
                status: 201,
                success: true,
                data:fetchPermissions,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            })
        }
       
    }catch(err){
        res.status(500).json({
            status: 500,
            success: false,
            error: err
        })
    }
}

export default fetchPermissions;
