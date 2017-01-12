const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    author: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    link: {
        type: String
    },
    publishedOn: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    },
    body: {
        type: String
    }
});

module.exports = mongoose.model('Articles', articleSchema);