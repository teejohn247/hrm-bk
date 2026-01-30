
import dotenv from 'dotenv';
import Notification from '../../model/Notification';
import bcrypt from 'bcrypt';



dotenv.config();


const editNotification = async (req, res) => {

    try {

        const { notificationName, availableTo } = req.body;


        let notification = await Notification.findOne({ _id: req.params.id });

        if (!notification) {
            res.status(400).json({
                status: 400,
                error: 'Notification does not exist'
            })
            return;
        }

        
        // const check = await Notification.find({notificationName: notificationName})
    

        // if (check.length > 0) {
        //     res.status(400).json({
        //         status: 400,
        //         error: 'Notification name already exists'
        //     })
        //     return;
        // }
        

        await notification.updateOne({

            notificationName: notificationName && notificationName,
            availableTo: availableTo && availableTo
        
        });



        await notification.save();

        res.status(201).json({
            status: 201,
            success: true,
            data: "Update Successful",
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default editNotification;
