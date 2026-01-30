import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    post: { type: String},
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
},
{ timestamps: true });

module.exports = mongoose.model("Post", postSchema);