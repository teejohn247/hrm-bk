import MediaFeeds from '../../model/MediaFeeds.js';
import Company from '../../model/Company.js';

const createMediaFeed = async (req, res) => {
    try {

        console.log(req.payload)
        const {content, image, published, 
            companyId = req.body.companyId ? req.body.companyId : (req.payload.companyId || req.payload.id),
            postTitle, imageType, publishedDate } = req.body;

        // Find company to get its name
        const company = await Company.findById(companyId);

        console.log({company})
        if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
        }

        // Create new media feed
        const newMediaFeed = new MediaFeeds({
            postTitle,
            content,
            image,
            imageType,
            companyId,
            companyName: company.companyName
        });

        // Save to database
        const savedMediaFeed = await newMediaFeed.save();

        res.status(200).json({
            success: true,
            message: 'Media feed created successfully',
            data: savedMediaFeed
        });

    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry found. PostType, content',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating media feed',
            error: error.message
        });
    }
};

export default createMediaFeed;
