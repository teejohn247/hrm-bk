import mongoose from 'mongoose';
import moment from 'moment/moment';


const NotificationsSchema = new mongoose.Schema({
    notificationType: {type: String, required: true},
    notificationContent: {type: String, required: true},
    recipientId: {type: String, required: true},
    companyName: {type: String},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    read:{
        type: Boolean, default: false
    },
    created_by: {type: String, required: true},
    meetingId: {type: String},
    meetLink: {type: String},
}, { timestamps: true })


module.exports = mongoose.model("Notifications", NotificationsSchema);