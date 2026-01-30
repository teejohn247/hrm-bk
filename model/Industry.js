import mongoose from "mongoose";

const industrySchema = new mongoose.Schema({
    industryName: {
        type: String
    }

},{
    timestamps: true

})

module.exports = mongoose.model('Industry', industrySchema);