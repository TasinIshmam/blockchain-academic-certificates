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
        type: String, //Saved as string because easier to hash.
        required: true,
        //todo Add custom validator to ensure is a number in the range 0-4
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
