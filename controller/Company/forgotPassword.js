
import dotenv from 'dotenv';
import Admin from '../../model/Company';
// import utils from '../../config/utils';
import HTTP_STATUS from 'http-status-codes';
import {emailTemp} from '../../emailTemplate';
import utils from '../../config/utils';
import { sendEmail } from '../../config/email';
import Employees from '../../model/Employees';


// eslint-disxzable-next-line @typescript-eslint/no-var-requires
dotenv.config();


const forgotPassword = async (req, res) => {

    try {

			const { email } = req.body;

			const user = await Admin.findOne({ email });
			const emp = await Employees.findOne({ email });
			console.log({user, emp})

			if(user){
				const token = utils.encodeToken(user._id, user.isSuperAdmin, user.email);

				const msg = `<div>
				  <p style="padding: 32px 0; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
				  Hi ${ user?.firstName && user?.firstName },
				  </p>
		  
				  <p style="font-size: 16px;font-weight: 300;">
				  <br>
		  
				  Please, complete your reset your password using this link
				  <br>
						  <a href="https://www.acehr.app/set-password/${token}"><button>Reset Password</button></a>
				  <br><br>
				  </p>
				  <div>`;
		  
				const message = emailTemp(
				  msg,
				  'Password Reset'
				);
		  
					  // sendEmail(email, 'Password Reset', message);
		  
					  const receivers= [{
						  email: user.email
					  }]
					  await sendEmail(req, res, user.email, receivers, 'Reset Password', message);
		  
		  
					  res.status(HTTP_STATUS.ACCEPTED).json({
						  status: HTTP_STATUS.ACCEPTED,
						  success: true,
						  data: 'An email has been sent to change your password'
					  });
					
			}

			else if(emp){
				const token = utils.encodeToken(emp._id, false, emp.email);

				console.log({token})

				const msg = `<div>
				  <p style="padding: 32px 0; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
				  Hi ${ emp?.firstName && emp?.firstName },
				  </p>
		  
				  <p style="font-size: 16px;font-weight: 300;">
				  <br>
		  
				  Please, complete your reset your password using this link
				  <br>
						  <a href="https://www.acehr.app/set-password/${token}"><button>Reset Password</button></a>
				  <br><br>
				  </p>
				  <div>`;
		  
				const message = emailTemp(
				  msg,
				  'Password Reset'
				);
		  
					  // sendEmail(email, 'Password Reset', message);
		  
					  const receivers= [{
						  email: emp.email
					  }]
					  await sendEmail(req, res, emp.email, receivers, 'Reset Password', message);
		  
		  
					  res.status(200).json({
						status: 200,
						  success: true,
						  data: 'An email has been sent to change your password'
					  });
					
					}
	
	}catch(error){
			res.status(500).json({
					status: 500,
					success: false,
					error:'server error'
			});
	};
};
export default forgotPassword;
