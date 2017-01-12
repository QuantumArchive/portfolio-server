const app = require('../lib/app');
const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const connection = require('./setup-mongoose-test');
const userModel = require('../lib/models/user');
chai.use(chaiHttp);

describe('tests users api end point', () => {

    before(done => {
        const drop = () => connection.db.dropDatabase(done);
        if (connection.readyState === 1) drop();
        else connection.on('open', drop);
    });

    before(done => {
        const daAdmin = {
            username: 'DaMan',
            password: 'DaBoss',
            roles: ['admin']
        };
        const newAdmin = new userModel(daAdmin);
        newAdmin.generateHash(daAdmin.password);
        newAdmin.save(done);
    });

    // recall that app here is just a request listener
    const request = chai.request(app);

    function badRequest(url, send, error, done) {
        request
            .post(url)
            .send(send)
            .then(() => done('status should not be 200'))
            .catch(res => {
                assert.equal(res.status, 400);
                assert.equal(res.response.body.error, error);
                done();
            })
            .catch(done);
    };

    const badUserOne = {
        username: 'whatever'
    };

    const badUserTwo = {
        password: 'whatever'
    };

    const badUserThree = {
        username: 'whatever',
        password: 'whatever',
        roles: ['admin']
    };

    const goodUser = {
        username: 'doko',
        password: 'desu'
    };

    let userToken = '';
    let adminToken = '';

    it('ensures you need a password with posted username', done => {
        badRequest('/api/users/signup', badUserOne, 'valid username and password required', done);
    });

    it('ensures you need a username with posted password', done => {
        badRequest('/api/users/signup', badUserTwo, 'valid username and password required', done);
    });

    it('ensures that a user is not allowed to designate their own roles', done => {
        badRequest('/api/users/signup', badUserThree, 'user cannot designate their roles', done);
    });

    it('signs up a new user and retrieves token and username', done => {
        request
            .post('/api/users/signup')
            .send(goodUser)
            .then(res => {
                const {token, username} = res.body;
                assert.isOk(res.body);
                assert.equal(username, goodUser.username);
                userToken = token;
                done();
            })
            .catch(done);
    });
});