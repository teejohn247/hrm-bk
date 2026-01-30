import mongoose from 'mongoose';
import moment from 'moment/moment';


const MediaFeedsSchema = new mongoose.Schema({
    companyId: { type: String },
    companyName: { type: String },
    postTitle: {type: String, required: true, unique: true},
    content: {type: String, required: true},
    image: {type: String},
    published:{
        type: Boolean, default: false
    },
    imageType:{
        type: String,
        enum: ['portrait', 'landscape'],
    },
    publishedDate:{
        type: Date
    }
 
}, { timestamps: true })


module.exports = mongoose.model("MediaFeeds", MediaFeedsSchema);