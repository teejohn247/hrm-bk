import dotenv from 'dotenv';

dotenv.config();

/**
 * Controller for uploading a screenshot for a user complaint
 * This is similar to the addImage controller but specific to complaint screenshots
 * @route POST /api/complaints/upload-screenshot
 */
const uploadScreenshot = async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Screenshot image data is required'
            });
        }
        
        // No need to store the image in this controller
        // Just return the image URL/data that was sent
        // The createComplaint or updateComplaint controller will store this with the complaint
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Screenshot uploaded successfully',
            data: {
                screenshotUrl: image
            }
        });
        
    } catch (error) {
        console.error('Error uploading screenshot:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while uploading the screenshot'
        });
    }
};

export default uploadScreenshot; 