

import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
    ratingName: { type: String, unique: true },
    description: { type: String },
    value: { type: String }
    
}, { timestamps: true });


module.exports = mongoose.model("Rating", RatingSchema);