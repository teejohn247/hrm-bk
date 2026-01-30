

import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    employeeId:{ type: String },
    location:{ type: String },
    meetingStartTime:{ type:Date }, 
    meetingEndTime:{ type:Date },    
    invitedGuests:[
        {
            employeeId: { type: String },
            employeeName: { type: String },
            profilePics:{ type: String },
         
        }
    ],
    
}, { timestamps: true });


module.exports = mongoose.model("Meeting", MeetingSchema);