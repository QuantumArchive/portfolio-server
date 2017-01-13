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

    function goodRequest(url, send, done) {
        request
            .post(url)
            .send(send)
            .then(res => {
                const {username, token} = res.body;
                assert.equal(username, send.username)
                assert.isOk(token);
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

    const goodUserTwo = {
        username: 'qux',
        password: 'foo'
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
                const {username, token} = res.body;
                assert.equal(username, goodUser.username);
                assert.isOk(token);
                userToken = token;
                done();
            })
            .catch(done);
    });

    it('signs in a second user and gets back a token and username', done => {
        goodRequest('/api/users/signup', goodUserTwo, done);
    });

    it('validates token received', done => {
        request
            .post('/api/users/validate')
            .set('authorization', `Bearer ${userToken}`)
            .then(res => {
                assert.isOk(res.body);
                const {valid, username} = res.body;
                assert.equal(username, goodUser.username);
                assert.isTrue(valid);
                done();
            })
            .catch(done);
    });

    it('signs in user', done => {
        request
            .post('/api/users/signin')
            .send(goodUser)
            .then(res => {
                const {username, token} = res.body;
                assert.equal(username, goodUser.username);
                userToken = token;
                done();
            })
            .catch(done);
    });

    it('signs in admin', done => {
        request
            .post('/api/users/signin')
            .send(daAdmin)
            .then(res => {
                const {username, token} = res.body;
                assert.equal(username, daAdmin.username);
                adminToken = token;
                done();
            })
            .catch(done);
    });

    it('uses admin account to upgrade goodUsers status', done => {
        request
            .put('/api/users/upgrade')
            .set('authorization', `Bearer ${adminToken}`)
            .send({
                username: goodUser.username,
                roles: ['admin']
            })
            .then(res => {
                const {user, message} = res.body;
                goodUser._id = user._id;
                goodUser.__v = user.__v;
                assert.equal(message, `${goodUser.username} has been granted the following roles: admin`);
                done();
            })
            .catch(done);
    });

    it('gets the total number of users in the database', done => {
        request
            .get('/api/users/totalusers')
            .set('authorization', `Bearer ${adminToken}`)
            .then(res => {
                const {count} = res.body;
                assert.equal(count, 3);
                done();
            })
            .catch(done);
    });

    it('deletes goodUser by his id', done => {
        request
            .del(`/api/users/${goodUser._id}`)
            .set('authorization', `Bearer ${adminToken}`)
            .then(res => {
                const {message} = res.body;
                assert.equal(message, `user with id ${goodUser._id} was removed from the database`);
                done();
            })
            .catch(done);
    });

    it('deletes goodUserTwo by his name', done => {
        request
            .del('/api/users')
            .set('authorization', `Bearer ${adminToken}`)
            .send({username: goodUserTwo.username})
            .then(res => {
                const {message} = res.body;
                assert.equal(message, `user with username ${goodUserTwo.username} was removed from the database`);
                done();
            })
            .catch(done);
    });

    it('ensures only one person left in the database after users were deleted', done => {
        request
            .get('/api/users/totalusers')
            .set('authorization', `Bearer ${adminToken}`)
            .then(res => {
                const {count} = res.body;
                assert.equal(count, 1);
                done();
            })
            .catch(done);
    });
});