import Post from '../../model/Post';
import Company from '../../model/Company';

const createPost = async (req, res) => {
    try {
        const { post, image } = req.body;
        let authorId = req.payload.id;

        let isSuperAdmin = await Company.findOne({ _id: authorId });

        if (!isSuperAdmin) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'You are not authorized to create a post'
            })
            return;
        }
        
        let result = new Post({
            post,
            authorId,
            image
        })

        await result.save().then((post) => {
            console.log(post)
            res.status(200).json({
                status: 200,
                success: true,
                data: post
            })
        }).catch((err) => {
            console.error(err)
            res.status(400).json({
                status: 400,
                success: false,
                error: err
            })
        })
    }
    catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}

export default createPost;