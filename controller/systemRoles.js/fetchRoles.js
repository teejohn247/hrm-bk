import Roles from '../../model/Roles';
import dotenv from 'dotenv';


dotenv.config();


const fetchRoles = async(req, res) => {
    try{
        const { page, limit } = req.query;

        const fetchRoles = await Roles.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();


        const count = await Roles.find().countDocuments();

        if(!fetchRoles){
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
                data: fetchRoles,
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

export default fetchRoles;
