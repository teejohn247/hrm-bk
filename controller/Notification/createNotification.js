
import dotenv from 'dotenv';
import Notification from '../../model/Notification';



dotenv.config();


const createNotifications = async (req, res) => {

    try {

        const { notificationName, availableTo } = req.body;
        const check = await Notification.find({notificationName: notificationName})
    

        if (check.length > 0) {
            res.status(400).json({
                status: 400,
                error: 'Notification name already exists'
            })
            return;
        }


        let notifications = new Notification ({
            notificationName,
            availableTo,
            created_by: req.payload.id
        })

        await notifications.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: notifications
        })

       

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default createNotifications;
