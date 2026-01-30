
import dotenv from 'dotenv';
// import utils from '../../config/utils';
import { Request, Response} from 'express';

import HTTP_STATUS from 'http-status-codes';
import jwt_decode from 'jwt-decode';

// eslint-disxzable-next-line @typescript-eslint/no-var-requires
dotenv.config();


const verifyToken = async (req, res) => {

    try {

	 const { token } = req.body;
	
	 if(!token){
		res.status(HTTP_STATUS.BAD_REQUEST).json({
			status: HTTP_STATUS.BAD_REQUEST,
			error: 'verification token is required'
		});

		return;
	 }
	 const payload = jwt_decode(token);
	 console.log({payload})
	 if (!payload) {
		 throw new Error('Token cannot be decoded');
	 } else {
		
			res.status(HTTP_STATUS.OK).json({
				status: HTTP_STATUS.OK,
				success: true,
				data: payload.email
			});
	  }
	}catch(error){
			res.status(500).json({
					status: 500,
					success: false,
					error:'Invalid token'
			});
	};
};
export default verifyToken;