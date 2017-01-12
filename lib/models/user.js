const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    usename: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: []
});

userSchema.methods.generateHash = function(password) {
    return this.password = bycrypt.hashSync(password, 8);
};

userSchema.methods.compareHash = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Users', userSchema);