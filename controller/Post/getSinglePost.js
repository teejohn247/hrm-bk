import Post from '../../model/Post';

const getPost = async (req, res) => {
    try {
        let postId = req.params.id;
        let post = await Post.findOne({ _id: postId });
        if (!post) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'This post Not found'
            })
            return;
        }
        res.status(200).json({
            status: 200,
            success: true,
            data: post
        })
    }catch(err){
        res.status(400).json({
            status: 400,
            success: false,
            error: err
        })
    }
}

export default getPost;