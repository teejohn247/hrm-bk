import mongoose from 'mongoose';

const csvSchema = new mongoose.Schema({
  Sr: {
    type: String,
    required: true,
  },
  Cheque_No: {
    type: String,
    required: true,
  },
  Amount: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("csvRecords", csvSchema);
