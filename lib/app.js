const express = require('express');
const app = express();

// middleware
const morgan = require('morgan');
const errorHandler = require('./error-handler');
const cors = require('cors')();
const redirectHttp = require('./redirect-http')();
const checkDb = require('./check-connection')();

//routes
const users = require('./routes/users');
// const articles = require('./routes/articles');

app.use(morgan('dev'));
if(process.env.NODE_ENV === 'production') {
    app.use(redirectHttp);
};
app.use(cors);
app.use(express.static('./public'));

app.use(checkDb);
app.use('/api/users', users);
// app.use('/api/articles', articles); 

app.use(errorHandler);

module.exports = app;