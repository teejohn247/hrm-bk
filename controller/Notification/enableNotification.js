import Notification from '../../model/Notification';
import dotenv from 'dotenv';


dotenv.config();


const enableNotification = async(req, res) => {
    try{
        const notification = await  Notification.find({_id: req.params.id});


        if (notification.length < 1) {
            res.status(400).json({
                status: 400,
                error: 'Template does not exist'
            })
            return;
        }

        console.log('tt')
        console.log(notification)




        if (notification[0].enabled == true) {
            res.status(400).json({
                status: 400,
                error: 'Notification already enabled'
            })
            return;
        }


        await notification[0].update({
            enabled: true
    }, notification);


        res.status(201).json({
            status: 201,
            success: true,
            data: "Notificatione Enabled",
        })

       
    }catch(err){
        res.status(500).json({
            status: 500,
            success: false,
            error: err
        })
    }
}

export default enableNotification;
