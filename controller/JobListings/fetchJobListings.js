
import dotenv from 'dotenv';
import JobPost from '../../model/JobPost';






dotenv.config();







const fetchJobListings = async (req, res) => {

    try {

        const { page, limit } = req.query;

        const jobListing = await JobPost.find({companyId: req.payload.id})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

            const count = await JobPost.find({companyId: req.payload.id}).countDocuments()

            res.status(200).json({
                status: 200,
                success: true,
                data: jobListing,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });

            return
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchJobListings;



