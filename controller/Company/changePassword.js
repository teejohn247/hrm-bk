
import dotenv from 'dotenv';
import Admin from '../../model/Company';
import bcrypt from 'bcrypt';
// import utils from '../../config/utils';
import HTTP_STATUS from 'http-status-codes';

dotenv.config();



const changePassword = async (req , res)=> {

    try {


			const { oldPassword, newPassword } = req.body 
	
			const user = await Admin.findOne({ email: req.payload.email });
			if(!user){
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: 'User does not exist'
                    })

					return;
			}

			const isMatch = await bcrypt.compare(oldPassword, user?.password);
			if (!isMatch) {
					res.status(404).json({
							status: 404,
							success: false,
							error: 'Incorrect password'
					});
					return;
			}

			const salt = await bcrypt.genSalt(10);
			const hashed = await bcrypt.hash(newPassword, salt);

			await user.updateOne({
					password: hashed
			});

			res.status(HTTP_STATUS.CREATED).json({
				status: HTTP_STATUS.CREATED,
				success: true,
				data: 'Password change successful'
			});
	}catch(error){
			res.status(500).json({
					status: 500,
					success: false,
					error:'server error'
			});
	};
};
export default changePassword;
