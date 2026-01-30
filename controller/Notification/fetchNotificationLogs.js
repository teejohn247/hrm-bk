import Notificatiotions from '../../model/NotificationLog'
import dotenv from 'dotenv';


dotenv.config();


const fetchNotificationLog = async(req, res) => {
    try{

        const { page, limit } = req.query;

        const notification = await Notificatiotions.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await Notificatiotions.find().countDocuments()

        if(!notification){
            res.status(404).json({
                status:404,
                success: false,
                error:'No notifications Found'
            })
            return
        }else{
            res.status(201).json({
                status: 201,
                success: true,
                data: notification,
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

export default fetchNotificationLog;
