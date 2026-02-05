import dotenv from 'dotenv';
import HelpSupport from '../../model/HelpSupport';

dotenv.config();

const fetchTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Ticket ID is required"
            });
        }

        const ticket = await HelpSupport.findOne({ _id: id });

        if (!ticket) {
            return res.status(404).json({
                status: 404,
                error: "Ticket not found"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: ticket
        });

    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchTicketById;
