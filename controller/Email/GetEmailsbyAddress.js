import Email from '../../../model/Email';
import Customer from '../../../model/Employees';
import HTTP_STATUS from 'http-status-codes';

const getEmailsByAddress = async (req, res) => {
    try {
        const { email } = req.params;

        // Find the customer by email
        const customer = await Customer.findOne({ email });

        console.log(customer);

        if (!customer) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                success: false,
                message: 'Customer not found'
            });
        }

        // Fetch all emails for this customer
        const emails = await Email.find({ userId: customer._id })
            .sort({ receivedDate: -1 }); // Sort by most recent first

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            success: true,
            data: emails
        });

    } catch (error) {
        console.error('Error in getEmailsByAddress:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            success: false,
            error: 'An error occurred while fetching emails'
        });
    }
};

export default getEmailsByAddress;
