
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Holiday from '../../model/Meetings';
// import Employee from '../../model/Employees';




// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const createMeeting = async (req, res) => {

//     try {
       
//         const { meetingDate, location, meetingStartTime, meetingEndTime, invitedGuests } = req.body;
        
//         let emp = await Employee.findOne({ _id: req.payload.id });
//         let comp = await Company.findOne({ _id: req.payload.id });


//         console.log({emp})

//         if(emp){

//         let company = await Company.findOne({ _id: emp.companyId });
//         console.log({company})

//         if(!meetingDate || meetingDate == ''){

//             res.status(400).json({
//                 status: 400,
//                 error: 'meetingDate is required'
//             })
//             return;
//         }

//         let groups = [];
    
//         for (const groupId of invitedGuests) {
//             console.log({ groupId });
    
//             try {
//                 const group = await Employee.findOne({ email: groupId });

//                 console.log({group})
                
//                 groups.push({
//                     employeeId: groupId,
//                     employeeName: group.fullName,
//                     profilePics: group.profilePic
//                 });
//                 console.log({ group });
//             } catch (err) {
//                 console.error(err);
//             }
//         }

//         // let designation = await Holiday.findOne({ companyId:company._id,  holidayName: holidayName });

//         // console.log({company})

//         // if (!company.companyName) {

//         //     res.status(400).json({
//         //         status: 400,
//         //         error: 'No company has been created for this account'
//         //     })
//         //     return;
//         // }


//         // if (designation) {

//         //     res.status(400).json({
//         //         status: 400,
//         //         error: 'This holidayName already exist'
//         //     })
//         //     return;
//         // }

//        let holiday = new Holiday({
//             meetingDate,
//             location,
//             meetingStartTime,
//             meetingEndTime,
//             invitedGuests: groups,
//             companyId: emp.companyId,
//             companyName: emp.companyName,
//             employeeId: req.payload.id
           
//         })
        
//         await holiday.save().then((adm) => {    
//             console.log(adm)
//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: adm
//             })
//         }).catch((err) => {
//                 console.error(err)
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 })
//             })}

//             else if(comp){
//                 const { meetingDate, location, meetingStartTime, meetingEndTime, invitedGuests } = req.body;
        
              
        
        
//                 console.log({comp})
        
//                 if(comp){
        
//                 let company = await Company.findOne({ _id: req.payload.id });
//                 console.log({company})
        
//                 if(!meetingDate || meetingDate == ''){
        
//                     res.status(400).json({
//                         status: 400,
//                         error: 'meetingDate is required'
//                     })
//                     return;
//                 }
        
//                 let groups = [];

//                 console.log({invitedGuests});
            
//                 for (const groupId of invitedGuests) {
            
//                     try {
//                         const group = await Employee.findOne({ email: groupId });
        
                        
//                         groups.push({
//                             employeeId: groupId,
//                             employeeName: group.fullName,
//                             profilePics: group.profilePic
//                         });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }
        
//                 // let designation = await Holiday.findOne({ companyId:company._id,  holidayName: holidayName });
        
//                 // console.log({company})
        
//                 // if (!company.companyName) {
        
//                 //     res.status(400).json({
//                 //         status: 400,
//                 //         error: 'No company has been created for this account'
//                 //     })
//                 //     return;
//                 // }
        
        
//                 // if (designation) {
        
//                 //     res.status(400).json({
//                 //         status: 400,
//                 //         error: 'This holidayName already exist'
//                 //     })
//                 //     return;
//                 // }

//                 console.log({groups})
        
//                let holiday = new Holiday({
//                     meetingDate,
//                     location,
//                     meetingStartTime,
//                     meetingEndTime,
//                     invitedGuests: groups,
//                     companyId: req.payload.id,
//                     companyName: comp.companyName,
                   
                   
//                 })
                
//                 await holiday.save().then((adm) => {
//                     console.log(adm)
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: adm
//                     })
//                 }).catch((err) => {
//                         console.error(err)
//                         res.status(400).json({
//                             status: 400,
//                             success: false,
//                             error: err
//                         })
//                     })}
//             }
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default createMeeting;

import dotenv from 'dotenv';
import { google } from 'googleapis';
import Meeting from '../../model/Meetings';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import Notification from '../../model/Notification';

dotenv.config();

// Initialize Google Calendar API
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Create Google Calendar event with Google Meet link
 */
const createGoogleCalendarEvent = async (meetingData, attendees) => {
    try {
        const event = {
            summary: meetingData.title || 'Team Meeting',
            location: meetingData.location || 'Online',
            description: meetingData.description || 'Meeting scheduled via company portal',
            start: {
                dateTime: meetingData.meetingStartTime,
                timeZone: meetingData.timeZone || 'UTC'
            },
            end: {
                dateTime: meetingData.meetingEndTime,
                timeZone: meetingData.timeZone || 'UTC'
            },
            attendees: attendees.map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 }
                ]
            }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all'
        });

        return {
            eventId: response.data.id,
            meetLink: response.data.hangoutLink,
            htmlLink: response.data.htmlLink
        };
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        return null;
    }
};

/**
 * Create meeting with Google Calendar and Meet integration
 */
const createMeeting = async (req, res) => {
    try {
        const { 
            location, 
            meetingStartTime, 
            meetingEndTime, 
            invitedGuests,
            title,
            description,
            timeZone
        } = req.body;

        const userId = req.payload.id;

        // Validate required fields
        if (!meetingStartTime) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Meeting start time is required'
            });
        }

        if (!meetingEndTime) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Meeting end time is required'
            });
        }

        if (!invitedGuests || invitedGuests.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'At least one guest must be invited'
            });
        }

        // Parse dates to ensure proper format
        const startDate = new Date(meetingStartTime);
        const endDate = new Date(meetingEndTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-02-15T14:00:00)'
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Meeting end time must be after start time'
            });
        }

        // Check if user is company or employee
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let employee = null;
        let companyId;
        let companyName;
        let organizerEmail;
        let organizerName;

        if (isCompanyAccount) {
            companyId = company._id.toString();
            companyName = company.companyName;
            organizerEmail = company.email || '';
            organizerName = company.companyName;
        } else {
            employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            companyId = employee.companyId;
            companyName = employee.companyName;
            organizerEmail = employee.email;
            organizerName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
        }

        // Validate and get invited guests details
        const guestDetails = [];
        const guestEmails = [];

        for (const guestEmail of invitedGuests) {
            const guest = await Employee.findOne({ 
                email: guestEmail,
                companyId: companyId 
            });

            if (guest) {
                guestDetails.push({
                    employeeId: guest._id.toString(),
                    employeeName: guest.fullName || `${guest.firstName} ${guest.lastName}`,
                    profilePics: guest.profilePic || ''
                });
                guestEmails.push(guest.email);
            } else {
                console.warn(`Guest with email ${guestEmail} not found in company`);
            }
        }

        if (guestDetails.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No valid guests found in the company'
            });
        }

        // Create Google Calendar event with Meet link
        let googleEventData = null;
        try {
            googleEventData = await createGoogleCalendarEvent(
                {
                    title: title || 'Team Meeting',
                    description: description || '',
                    meetingStartTime: startDate.toISOString(),
                    meetingEndTime: endDate.toISOString(),
                    location: location || 'Online',
                    timeZone: timeZone || 'UTC'
                },
                guestEmails
            );

            if (googleEventData) {
                console.log('Google Calendar event created:', googleEventData);
            }
        } catch (googleError) {
            console.error('Failed to create Google Calendar event:', googleError);
        }

        // Create meeting in database
        const meeting = new Meeting({
            companyId: companyId.toString(),
            companyName,
            employeeId: isCompanyAccount ? null : userId.toString(),
            location: location || 'Online',
            meetingStartTime: startDate,
            meetingEndTime: endDate,
            invitedGuests: guestDetails,
            title: title || 'Team Meeting',
            description: description || '',
            organizerName,
            organizerEmail,
            googleEventId: googleEventData?.eventId || null,
            meetLink: googleEventData?.meetLink || null,
            calendarLink: googleEventData?.htmlLink || null,
            status: 'scheduled',
            timeZone: timeZone || 'UTC'
        });

        const savedMeeting = await meeting.save();

        const options = { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          };
          const timeOptions = { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          };
          
          console.log(`You have been invited to a meeting: ${title || 'Team Meeting'} on ${startDate.toLocaleDateString('en-GB', options)} at ${startDate.toLocaleTimeString('en-US', timeOptions)}`)

        // Send notifications to all invited guests
        const notifications = guestDetails.map(guest => ({
            notificationType: 'Meeting Invitation',
            notificationContent: `You have been invited to a meeting: ${title || 'Team Meeting'} on ${startDate.toLocaleDateString('en-GB', options)} at ${startDate.toLocaleTimeString()}`,
            recipientId: guest.employeeId,
            companyName,
            companyId: companyId.toString(),
            created_by: userId.toString(),
            read: false,
            meetingId: savedMeeting._id.toString(),
            meetLink: googleEventData?.meetLink || null
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`Sent ${notifications.length} meeting notifications`);
        }

        console.log(`Meeting created by ${organizerName} with ${guestDetails.length} guests`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: savedMeeting,
            message: `Meeting created successfully and invitations sent to ${guestDetails.length} guest(s)`,
            meetLink: googleEventData?.meetLink || null,
            calendarLink: googleEventData?.htmlLink || null
        });

    } catch (error) {
        console.error('Error creating meeting:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the meeting'
        });
    }
};

export default createMeeting;