const router = require('express').Router();
const bodyParser = require('body-parser').json();
const articleModel = require('../models/article');
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-role');

// TODO : consider if it's more sustainable to have website request articles by author
// or to just let the front end filter articles that it receives

router
    .get('/all', bodyParser, (req, res, next) => {
        articleModel
            .find()
            .sort('-publishedOn')
            .lean()
            .then(articles => {
                res.send({articles});
            })
            .catch(next);
    })
    .post('/', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        // make it so articles have ids attached? it's only my portfolio so we'll see...
        const article = new articleModel(req.body);
        article.save()
            .then(article => {
                // send the whole article back? Since only admins gan post that should be OK
                res.send({article});
            })
            .catch(next);
    })
    .put('/:id', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        const update = req.body;
        articleModel
            .findByIdAndUpdate(req.params.id, update, {new: true})
            .then(article => {
                res.send({article});
            })
            .catch(next);
    })
    .delete('/:id', bodyParser, ensureAuth, ensureRole(['admin']), (req, res, next) => {
        articleModel
            .findByIdAndRemove(req.params.id)
            .then(article => {
                res.send({message: `article with ${article._id} was removed from the database`});
            })
            .catch(next);
    });

module.exports = router;