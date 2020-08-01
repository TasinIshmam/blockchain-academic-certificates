const mongoose = require('mongoose');
const validator = require('validator');


const certificateSchema = new mongoose.Schema({

    studentName: {
        type: String,
        required: true,
        trim: true,

    },
    studentEmail: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    universityName: {
        type: String,
        required: true,
        trim: true,
    },
    universityEmail: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    major: {
        type: String,
        required: true,
        trim: true
    },
    departmentName: {
        type: String,
        required: true,
        trim: true
    },
    cgpa: {
        type: Number,
        required: true,
        min: [0, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
        max: [4, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).']
    },
    dateOfIssuing: {
        type: Date,
        required: true
    },
});

certificateSchema.index({"studentEmail" : 1});
certificateSchema.index({"universityEmail" : 1});

let certificates = mongoose.model("certificates", certificateSchema);
certificates.createIndexes();

module.exports = certificates;
