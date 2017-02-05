const router = require('express').Router();
const bodyParser = require('body-parser').json();
const superagent = require('superagent');
const githubToken = process.env.GITHUBTOKEN || 'mygithubtoken';
const githubLink = 'https://api.github.com';

router
    .get('/', bodyParser, (req, res, next) => {
        // TODO: should the query string be placed here? It's probably OK
        // since we are limiting the user to only my 12 most recent repos
        let queryString = '/users/QuantumArchive/repos?per_page=12&sort=updated';
        superagent
            .get(`${githubLink}${queryString}`)
            .set('Authorization', `token ${githubToken}`)
            .then(data => {
                let repos = data.text;
                res.send({repos});
            })
            .catch(next);
    });

module.exports = router;