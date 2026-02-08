import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    employeeId: { type: String },
    location: { type: String },
    meetingStartTime: { type: Date }, 
    meetingEndTime: { type: Date },    
    invitedGuests: [
        {
            employeeId: { type: String },
            employeeName: { type: String },
            profilePics: { type: String },
        }
    ],
    // Additional fields for Google Meet integration
    title: {
        type: String,
        default: 'Team Meeting'
    },
    description: {
        type: String,
        default: ''
    },
    organizerName: {
        type: String
    },
    organizerEmail: {
        type: String
    },
    googleEventId: {
        type: String,
        default: null
    },
    meetLink: {
        type: String,
        default: null
    },
    calendarLink: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    timeZone: {
        type: String,
        default: 'UTC'
    }
    
}, { timestamps: true });

// Index for queries
MeetingSchema.index({ companyId: 1, meetingStartTime: 1 });
MeetingSchema.index({ employeeId: 1 });
MeetingSchema.index({ 'invitedGuests.employeeId': 1 });
MeetingSchema.index({ googleEventId: 1 });

module.exports = mongoose.model("Meeting", MeetingSchema);