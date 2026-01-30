
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Holiday from '../../model/Meetings';
import Employee from '../../model/Employees';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const createMeeting = async (req, res) => {

    try {
       
        const { meetingDate, location, meetingStartTime, meetingEndTime, invitedGuests } = req.body;
        
        let emp = await Employee.findOne({ _id: req.payload.id });
        let comp = await Company.findOne({ _id: req.payload.id });


        console.log({emp})

        if(emp){

        let company = await Company.findOne({ _id: emp.companyId });
        console.log({company})

        if(!meetingDate || meetingDate == ''){

            res.status(400).json({
                status: 400,
                error: 'meetingDate is required'
            })
            return;
        }

        let groups = [];
    
        for (const groupId of invitedGuests) {
            console.log({ groupId });
    
            try {
                const group = await Employee.findOne({ email: groupId });

                console.log({group})
                
                groups.push({
                    employeeId: groupId,
                    employeeName: group.fullName,
                    profilePics: group.profilePic
                });
                console.log({ group });
            } catch (err) {
                console.error(err);
            }
        }

        // let designation = await Holiday.findOne({ companyId:company._id,  holidayName: holidayName });

        // console.log({company})

        // if (!company.companyName) {

        //     res.status(400).json({
        //         status: 400,
        //         error: 'No company has been created for this account'
        //     })
        //     return;
        // }


        // if (designation) {

        //     res.status(400).json({
        //         status: 400,
        //         error: 'This holidayName already exist'
        //     })
        //     return;
        // }

       let holiday = new Holiday({
            meetingDate,
            location,
            meetingStartTime,
            meetingEndTime,
            invitedGuests: groups,
            companyId: emp.companyId,
            companyName: emp.companyName,
            employeeId: req.payload.id
           
        })
        
        await holiday.save().then((adm) => {    
            console.log(adm)
            res.status(200).json({
                status: 200,
                success: true,
                data: adm
            })
        }).catch((err) => {
                console.error(err)
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })}

            else if(comp){
                const { meetingDate, location, meetingStartTime, meetingEndTime, invitedGuests } = req.body;
        
              
        
        
                console.log({comp})
        
                if(comp){
        
                let company = await Company.findOne({ _id: req.payload.id });
                console.log({company})
        
                if(!meetingDate || meetingDate == ''){
        
                    res.status(400).json({
                        status: 400,
                        error: 'meetingDate is required'
                    })
                    return;
                }
        
                let groups = [];

                console.log({invitedGuests});
            
                for (const groupId of invitedGuests) {
            
                    try {
                        const group = await Employee.findOne({ email: groupId });
        
                        
                        groups.push({
                            employeeId: groupId,
                            employeeName: group.fullName,
                            profilePics: group.profilePic
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }
        
                // let designation = await Holiday.findOne({ companyId:company._id,  holidayName: holidayName });
        
                // console.log({company})
        
                // if (!company.companyName) {
        
                //     res.status(400).json({
                //         status: 400,
                //         error: 'No company has been created for this account'
                //     })
                //     return;
                // }
        
        
                // if (designation) {
        
                //     res.status(400).json({
                //         status: 400,
                //         error: 'This holidayName already exist'
                //     })
                //     return;
                // }

                console.log({groups})
        
               let holiday = new Holiday({
                    meetingDate,
                    location,
                    meetingStartTime,
                    meetingEndTime,
                    invitedGuests: groups,
                    companyId: req.payload.id,
                    companyName: comp.companyName,
                   
                   
                })
                
                await holiday.save().then((adm) => {
                    console.log(adm)
                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: adm
                    })
                }).catch((err) => {
                        console.error(err)
                        res.status(400).json({
                            status: 400,
                            success: false,
                            error: err
                        })
                    })}
            }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default createMeeting;



