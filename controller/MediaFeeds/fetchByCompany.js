import MediaFeed from '../../model/MediaFeeds.js';
import Company from '../../model/Company.js'


export const fetchByCompanyMediaFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const mediaFeed = await MediaFeed.find({ company: req.payload.id }) // Filter media feeds by companyId
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

      console.log(mediaFeed)

      const total = await MediaFeed.countDocuments({ company: req.payload.id }); // Count documents filtered by companyId

    res.status(200).json({
      success: true,
      data: mediaFeed,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching media feed',
      error: error.message
    });
  }
};

export default fetchByCompanyMediaFeed;