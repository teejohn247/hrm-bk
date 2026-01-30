import Post from '../../model/Post';

const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;  // Set default values for page and limit
        let companyId; 
        
        if(req.payload.isSuperAdmin === true){
            companyId = req.payload.id;
        }else{
            companyId = req.payload.companyId;
        }

        // Fetch posts based on the query
        const result = await Post.find({ authorId:  companyId})
            .populate('authorId', 'email')
            .sort({ _id: -1 })
            .limit(limit * 1)  // Ensure limit is an integer
            .skip((page - 1) * limit)
            .exec();

        // Fetch total post count for pagination
        const count = await Post.find({ authorId:  companyId}).countDocuments();

        // Return the response
        res.status(200).json({
            status: 200,
            success: true,
            data: result,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('An error occurred while fetching posts: ', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching posts.',
            error: error.message,
        });
    }
};

export default getPosts;
