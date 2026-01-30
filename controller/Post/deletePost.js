import Post from '../../model/Post';
import Company from '../../model/Company';

const deletePost = async (req, res) => {
    try {
        let postId = req.params.id;
        let authorId = req.payload.id;

        let isSuperAdmin = await Company.findOne({ _id: authorId });

        if (!isSuperAdmin) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'You are not authorized to delete a post'
            })
            return;
        }

        let post = await Post.findOne({ _id: postId });

        if (!post) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'This post does not exist'
            })
            return;
        }

        await Post.deleteOne({ _id: postId }).then((post) => {
            console.log(post)
            res.status(200).json({
                status: 200,
                success: true,
                data: 'Post deleted successfully'
            })
        })
        
    }catch(err){
        res.status(400).json({
            status: 400,
            success: false,
            error: err
        })
    }
}

export default deletePost;