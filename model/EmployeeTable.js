import mongoose from 'mongoose';

const EmployeeTableSchema = new mongoose.Schema({
    EmployeeTable:
        [{
            key: {
                type: String,
            },
            label: {
                type: String,
            },
            order: {
                type: Number,
            },
            columnWidth: {
                type: String,
            },
            cellStyle: {
                type: String,
            },
            sortable: {
                type: Boolean
            }
        }],

})

module.exports = mongoose.model("EmployeeTable", EmployeeTableSchema);