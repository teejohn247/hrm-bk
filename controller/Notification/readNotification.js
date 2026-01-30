import Notification from '../../model/Notification';
import dotenv from 'dotenv';


dotenv.config();


const readNotification = async(req, res) => {
    try{
        const notification = await  Notification.find({_id: req.params.id});
        if (notification.length < 1) {
            res.status(400).json({
                status: 400,
                error: 'Notification does not exist'
            })
            return;
        }
        await notification[0].update({
            read: true
    }, notification);
        res.status(201).json({
            status: 201,
            success: true,
            data: "Notification has been marked read",
        })
    }catch(err){
        res.status(500).json({
            status: 500,
            success: false,
            error: err
        })
    }
}

export default readNotification;
