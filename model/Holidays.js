import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
    holidayName: {
        type: String,
    },
    date: {
        type: String,
    },
    description: { type: String},
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    
})

module.exports = mongoose.model("Holidays", HolidaySchema);