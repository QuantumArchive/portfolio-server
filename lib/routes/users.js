const router = require('express').Router();
const bodyParser = require('body-parser').json();
const token  = require('../auth/token');
const userModel = require('../models/user');
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-role');

router
    .get('/totalusers', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        userModel
            .find()
            .count()
            .then(count => {
                res.send({count});
            })
            .catch(next);
    })
    .post('/validate', bodyParser, ensureAuth, (req, res, next) => { // eslint-disable-line
        res.send({valid: true, username: req.user.username});
    })
    .post('/signup', bodyParser, (req, res, next) => {
        const {username, password, roles} = req.body;
        if (!username || !password) {
            return next({code: 400, error: 'valid username and password required'});
        };

        if (roles) {
            return next({code: 400, error: 'user cannot designate their roles'});
        };

        userModel
            .find({username})
            .count()
            .then(count => {
                if (count) throw {code: 400, error: `Username ${username} already taken`};
                const user = new userModel(req.body);
                user.generateHash(password);
                return user.save();
            })
            .then(user => {
                return token.sign(user);
            })
            .then(token => {
                res.send({username, token});
            })
            .catch(next);
    })
    .post('/signin', bodyParser, (req, res, next) => {
        const {username, password} = req.body;
        delete req.body.password;

        userModel
            .findOne({username})
            .then(user => {
                if (!user || !user.compareHash(password)) throw {code: 400, error: 'Invalid username or password'};
                return token.sign(user);
            })
            .then(token => {
                res.send({username, token});
            })
            .catch(next);
    })
    .put('/upgrade', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        const {username, roles} = req.body;
        userModel
            .findOneAndUpdate({username}, {roles}, {new: true})
            .then(user => {
                res.send({user, message: `${username} has been granted the following roles: ${roles}`});
            })
            .catch(next);
    })
    .delete('/:id', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        userModel
            .findByIdAndRemove(req.params.id)
            .then(user => {
                res.send({message: `user with id ${user._id} was removed from the database`});
            })
            .catch(next);
    })
    .delete('/', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        const {username} = req.body;
        userModel
            .findOne({username})
            .then(user => {
                return user.remove();
            })
            .then(user => {
                res.send({message: `user with username ${user.username} was removed from the database`});
            })
            .catch(next);
    });

module.exports = router;