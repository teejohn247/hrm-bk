
import dotenv from 'dotenv';
import HTTP_STATUS from 'http-status-codes';


// eslint-disxzable-next-line @typescript-eslint/no-var-requires
dotenv.config();


const showIndex = async(req, res) => {

	res.status(HTTP_STATUS.SUCCESS).json({
		status: HTTP_STATUS.SUCCESS,
		success: true,
		data: 'Welcome'
	});
}

export default showIndex;
