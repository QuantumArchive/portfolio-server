module.exports = function getRedirectHttp() {
    // this is for heroku which will set this header to
    // communicate what incoming protocol was used
    // will allow use of https
    return function redirectHttp(req, res, next) {
        if(req.headers['x-forwarded-proto'] === 'https') next();
        else res.redirect(`https://${req.hostname}${req.url}`);
    };
};