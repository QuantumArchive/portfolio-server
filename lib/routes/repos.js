const router = require('express').Router();
const bodyParser = require('body-parser').json();
const superagent = require('superagent');
const githubToken = process.env.GITHUBTOKEN || 'mygithubtoken';
const githubLink = 'https://api.github.com/';

router
    .get('/', bodyParser, (req, res, next) => {
        // TODO: should the query string be placed here? It's probably OK
        // since we are limiting the user to only my 12 most recent repos
        superagent
            .get(`${githubLink}/users/QuantumArchive/repos?per_page=12&sort=updated`)
            .set('Authorization', `token ${githubToken}`)
            .then(data => {
                res.send({data});
            })
            .catch(next);
    });

module.exports = router;