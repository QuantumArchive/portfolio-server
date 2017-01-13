const jwt = require('jsonwebtoken');
const sekritToken = process.env.SEKRIT || 'SaltyToken';

module.exports = {
    sign(user) {
        return new Promise( (resolve, reject) => {
            const payload = {
                username: user.username,
                _id: user._id,
                roles: user.roles
            };
            jwt.sign(payload, sekritToken, null, (err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
        });
    },
    verify(token) {
        return new Promise( (resolve, reject) => {
            jwt.verify(token, sekritToken, (err, payload) => {
                if (err) return reject(err);
                resolve(payload);
            });
        });
    }
};