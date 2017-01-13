const app = require('../lib/app');
const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const connection = require('./setup-mongoose-test');
const userModel = require('../lib/models/user');
chai.use(chaiHttp);

describe('tests articles api end point', () => {
    
    before(done => {
        const drop = () => connection.db.dropDatabase(done);
        if (connection.readyState === 1) drop();
        else connection.on('open', drop);
    });

    const daAdmin = {
        username: 'DaMan',
        password: 'DaBoss',
        roles: ['admin']
    };

    before(done => {
        const newAdmin = new userModel(daAdmin);
        newAdmin.generateHash(daAdmin.password);
        newAdmin.save(done);
    });

    const request = chai.request(app);

    const articleOne = {
        author: 'doko',
        title: 'qux',
        category: 'yup',
        link: 'http://iamawesome.com',
        publishedOn: '2016-09-10',
        image: 'http://whatever.com',
        body: 'whatever whatever'
    };

    const articleTwo = {
        author: 'kino',
        title: 'foo',
        category: 'yup',
        link: 'http://iamawesome.com',
        publishedOn: '2016-10-10',
        image: 'http://whatever.com/yup',
        body: 'whatever whatever whatever'
    };

    const articleThree = {
        author: 'me',
        title: 'bar',
        category: 'yup',
        link: 'http://iamawesome.com',
        publishedOn: '2016-11-10',
        image: 'http://whatever.com/yargh',
        body: 'whatever whatever whatever whatever'
    };

    const update = {
        category: 'anime',
        link: 'http://files.gamebanana.com/img/ico/sprays/522bda181b134.png'
    };

    function articlePost(address, token, send, done) {
        request
            .post(address)
            .set('authorization', `Bearer ${token}`)
            .send(send)
            .then(res => {
                assert.isOk(res.body);
                const {article} = res.body;
                send._id = article._id;
                assert.equal(article.author, send.author);
                assert.equal(article.publishedOn.split('T')[0], send.publishedOn);
                done();
            })
            .catch(done);
    };

    let adminToken = '';

    it('retrieves token from server for admin', done => {
        request
            .post('/api/users/signin')
            .send(daAdmin)
            .then(res => {
                const {username, token} = res.body;
                adminToken = token;
                assert.equal(username, daAdmin.username);
                done();
            })
            .catch(done);
    });

    it('posts the first article', done => {
        articlePost('/api/articles', adminToken, articleOne, done);
    });

    it('posts the second article', done => {
        articlePost('/api/articles', adminToken, articleTwo, done);
    });

    it('posts the third article', done => {
        articlePost('/api/articles', adminToken, articleThree, done);
    });

    it('gets all articles without need for authorization', done => {
        request
            .get('/api/articles/all')
            .then(res => {
                const {articles} = res.body;
                assert.equal(articles.length, 3);
                assert.isAbove(articles[0].publishedOn, articles[2].publishedOn);
                done();
            })
            .catch(done);
    });

    it('updates an article with admin authorization', done => {
        request
            .put(`/api/articles/${articleOne._id}`)
            .set('authorization', `Bearer ${adminToken}`)
            .send(update)
            .then(res => {
                const {article} = res.body;
                assert.equal(article.link, update.link);
                assert.equal(article.category, update.category);
                done();
            })
            .catch(done);
    });

    it('deletes an article using the admin authorization', done => {
        request
            .del(`/api/articles/${articleTwo._id}`)
            .set('authorization', `Bearer ${adminToken}`)
            .then(res => {
                const {message} = res.body;
                assert.equal(message, `article with ${articleTwo._id} was removed from the database`);
                done();
            })
            .catch(done);
    });

    it('checks that the total number of articles in the database has decreased', done => {
        request
            .get('/api/articles/all')
            .then(res => {
                const {articles} = res.body;
                assert.equal(articles.length, 2);
                done();
            })
            .catch(done);
    });
});