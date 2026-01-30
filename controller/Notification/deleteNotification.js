
import dotenv from 'dotenv';
import Notification from '../../model/Notification';
import School from '../../model/School';




dotenv.config();


const deleteNotification = async (req, res) => {

    try {
        console.log(req.payload)

        const { notification_id } = req.params;

        const check = await Notification.findOne({ _id: notification_id })

        console.log(check)

        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Notification doesn't exists"
            })
            return;
        }



        let ids = []

        console.log(check.assigned_to)


        check.assigned_to && check.assigned_to.map((assign, index) => {
                ids.push(assign.school_id)
            })


        School.update({ _id: { $in: ids } }, {
            $pull: { notification_types: { notification_id: notification_id } },
        },
            { multi: true },
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

                    Notification.remove({ _id: notification_id },
                        function (
                            err,
                            result
                        ) {

                            console.log(result)

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
                                    data: "Deleted successfully!"
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
export default deleteNotification;
