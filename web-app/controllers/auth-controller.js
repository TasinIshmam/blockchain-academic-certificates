let universities = require('../database/models/universities');
let fabricEnrollment  = require('../services/fabric/enrollment');

//
async function registerUniversity(req, res, next) {
    try {
        let keys = await fabricEnrollment.registerUser(req.body.name);
        let dbResponse = await universities.create({
            name : req.body.name,
            email: req.body.email,
            description: req.body.description,
            location: req.body.location + `, ${req.body.division} Division`,
            password: req.body.password,
            publicKey: keys.publicKey
        });
        //todo invoke chaincode to update university profile in the channel.

        res.render("register-success", {});
    }
    catch (e) {
        next(e);
    }
}


module.exports = {registerUniversity};