import MediaFeed from '../../model/MediaFeeds.js';


const updateMediaFeed = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      // Remove fields that shouldn't be updated directly
      delete updateData.published;
      delete updateData.publishedDate;
      delete updateData.createdAt;
      delete updateData.updatedAt;
  
      const mediaFeed = await MediaFeed.findByIdAndUpdate(
        id,
        { 
          ...updateData,
          // Automatically set updatedAt
          updatedAt: new Date()
        },
        { 
          new: true,
          // Run validation on update
          runValidators: true 
        }
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
        message: 'Error updating media feed',
        error: error.message
      });
    }
  };

  export default updateMediaFeed