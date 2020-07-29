const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const universitySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    description: {
        type: String,
        required: true,
        trim: true,

    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 2
    },

    publicKey: {   //hex value of key
        type: String,
        required: true,
        minlength: 10
    }

});

universitySchema.statics.saltAndHashPassword = async function (password) {

    return new Promise( (resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    })

};



universitySchema.statics.validateByCredentials = function (email, password) {
    let User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    //Login was successful. Signals a successful login. Update
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};


universitySchema.pre('save', async function (next) {
    let user = this;
    //isModified(password) returns true if in this database update the password was modified.
    //We only resalt the password if the password was modified. Otherwise password is already salted.

    if (user.isModified('password')) {

        try {
            let hash = await user.schema.statics.saltAndHashPassword(this.password);
            user.password = hash;
        } catch (e) {
            return next();
        }
    } else {
        return next();
    }
});


universitySchema.index({"email" : 1}, {unique: true});
let universities = mongoose.model("universities", universitySchema);
universities.createIndexes();

module.exports = universities;

