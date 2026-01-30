import mongoose from 'mongoose';

const AceErpsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'AceERP'},
    email: { type: String, required: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model("AceErps", AceErpsSchema);
