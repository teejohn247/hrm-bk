import dotenv from 'dotenv';
import Announcement from '../../model/Announcement';

dotenv.config();

const fetchAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Announcement ID is required"
            });
        }

        const announcement = await Announcement.findOne({ _id: id });

        if (!announcement) {
            return res.status(404).json({
                status: 404,
                error: "Announcement not found"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: announcement
        });

    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchAnnouncementById;
