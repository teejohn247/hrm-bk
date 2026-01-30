import MediaFeeds from '../../model/MediaFeeds.js';


const deleteMediaFeed = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaFeed = await MediaFeeds.findById(id);

    if (!mediaFeed) {
      return res.status(404).json({
        success: false,
        message: 'Media feed not found'
      });
    }

    // Check if the media feed is published
    if (mediaFeed.published) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a published media feed'
      });
    }

    await MediaFeeds.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Media feed deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting media feed',
      error: error.message
    });
  }
};

export default deleteMediaFeed;
