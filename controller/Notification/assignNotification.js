
import dotenv from 'dotenv';
import Notification from '../../model/Notification';
import School from '../../model/School';

dotenv.config();

const assignNotification = async (req, res) => {

    try {


        const { notificationId, target, medium, assigned_to } = req.body;

        let ids = [];

        assigned_to.map((assign, index) => {
            console.log(assign.school_id)
            ids.push(assign.school_id)
        })

        const school = await School.find({ _id: { $in : ids }});
        const notification = await Notification.findOne({ _id: notificationId });


        if (!school) {
            res.status(404).json({
                status: 404,
                error: 'One or more schools does not exist'
            })
            return
        }

        if (!notification) {
            res.status(404).json({ 
                status: 404,
                error: 'This form does not exist'
            })
            return
        }
       


        let checks_sch = await School.find({ _id: { $in : ids }},
            { notification_types: { $elemMatch: { notification_id: notificationId } } })

        
        let checks_notification = await Notification.find({ _id: notificationId},
                { assigned_to: { $elemMatch: { school_id: { $in : ids } }}})


                if (checks_notification[0].assigned_to.length > 0) {
                    res.status(400).json({
                        status: 400,
                        error: 'This notification type has already been assigned to school'
                    })
                    return
                }

                
                if (checks_sch[0].notification_types.length > 0) {
                    res.status(400).json({
                        status: 400,
                        error: 'This school has already been assigned this notificaation type'
                    })
                    return
                }

        
            School.update({ _id: { $in : ids }}, { $push: { notification_types: { notification_id: notificationId, notification_name: notification.notificationName }, 
            },
            $set: {
                'notifications_settings.notification_targets': target,
                'notifications_settings.notification_channels': medium
            }, 
           },
           {multi: true},
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


                Notification.findOneAndUpdate({ _id: notificationId }, { $push: { assigned_to:  {  $each: assigned_to } } },

                { upsert: true },
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

                    }
                    else {

                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: result
                        })
                       
                    }
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
export default assignNotification;
