import MediaFeed from '../../model/MediaFeeds.js';


const publishMediaFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;

    const mediaFeed = await MediaFeed.findByIdAndUpdate(
      id,
      {
        published: publish,
        publishedDate: new Date()
      },
      { new: true }
    );

    if (!mediaFeed) {
      return res.status(404).json({
        success: false,
        message: 'Media feed not found'
      });
    }

    res.status(200).json({
      success: true,
      data: mediaFeed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing media feed',
      error: error.message
    });
  }
}

export default publishMediaFeed;
