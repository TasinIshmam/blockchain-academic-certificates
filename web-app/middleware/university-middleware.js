const logger = require('../services/logger');




function authenticateLogin (req, res, next) {
    try {
        if (req.session.user_type === "university") next();
        else throw new Error("Unauthorized access: Login first");
    } catch (e) {
        next(e);
    }
}

function redirectToDashboardIfLoggedIn(req,res,next) {
    try {
        if (req.session.user_type === "university") return res.redirect('/university/dashboard');
        else next();
    } catch (e) {
        next(e);
    }
}

//MUST BE FIRST MIDDLEWARE UNLESS DEBUGGING.
authenticate_if_logged_in_html_response = async (req, res, next) => {

    try {
        let user = await cms_user_database_interface.find_user_by_id(req.session.user_id);
        if (!user) {
            throw new Error();
        }
        return next();
    } catch (e) {
        return res.redirect('/');
    }

};

authenticate_if_manager_html_response = async (req, res, next) => {

    try {
        if(req.session.user_type === 'manager') {
            return next();
        } else {
            return res.redirect('/');
        }
    } catch (e) {
        return res.redirect('/');
    }
};

authenticate_if_admin_html_response = async (req, res, next) => {

    try {
        if(req.session.user_type === 'admin') {
            return next();
        } else {
            return res.redirect('/');
        }
    } catch (e) {
        return res.redirect('/');
    }
};

redirect_if_logged_in = async (req,res,next) => {

    try {
        if(req.session.user_type === 'admin') {
            return res.redirect('/admin');
        } else if (req.session.user_type === 'manager') {
            return res.redirect('/manager');
        } else {
            return next();
        }
    } catch (e) {
        return next();
    }
};




authenticate_if_logged_in_json_response = async (req, res, next) => {

    try {
        let user = await cms_user_database_interface.find_user_by_id(req.session.user_id);

        if (!user) {
            throw new Error();
        }
        return next();
    } catch (e) {
        return res.status(403).send(logger.generate_error_message("Access Denied. User is not authenticated. Please login first.", "AuthenticationError", ""));
    }

};


let allow_only_admin = async (req, res, next) => {

    if (req.session.user_type === 'admin') {
        return next();
    } else {
        return res.status(403).send({
            "error": logger.generate_error_message("You do not have access to get this resource.", "AuthException", "")
        });
    }

};


module.exports = {authenticateLogin, redirectToDashboardIfLoggedIn};



