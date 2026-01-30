import Post from '../../model/Post';
import Company from '../../model/Company';

const updatePost = async (req, res) => {
    try {
        let postId = req.params.id;
        let authorId = req.payload.id;
        let { post, image } = req.body;

        let isSuperAdmin = await Company.findOne({ _id: authorId });

        if (!isSuperAdmin) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'You are not authorized to update a post'
            })
            return;
        }

        let findPost = await Post.findOne({ _id: postId });

        if (!findPost) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'This post does not exist'
            })
            return;
        }

        

        await Post.updateOne({ _id: postId }, { post, image }).then((post) => {
            
            res.status(200).json({
                status: 200,
                success: true,
                data: 'Post updated successfully'
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


export default updatePost;