import Notifications from '../../model/Notification';
import Employee from '../../model/Employees';

import dotenv from 'dotenv';


dotenv.config();


const fetchNotifications = async(req, res) => {
    try{
        const { page, limit } = req.query;

        let employee = await Employee.findOne({ _id: req.payload.id })


        const notification = await Notifications.find({companyId: employee.companyId, recipientId: req.payload.id, read: false })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await Notifications.find().countDocuments({companyId: employee.companyId, recipientId: req.payload.id, read: false })


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

export default fetchNotifications;
