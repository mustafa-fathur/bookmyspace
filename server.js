const createError = require('http-errors');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const AuthRouter = require('./routes/AuthRouter');
const AdminRouter = require('./routes/AdminRouter');
const UserRouter = require('./routes/UserRouter');
const dotenv = require('dotenv');
const cookieParse = require('cookie-parser');
const path = require('path');
const { isLogin } = require('./middleware/UserMiddleware')
dotenv.config();

//Views
// Set up views directory
app.set('views', path.join(__dirname, '/views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "/node_modules/preline/dist")));
app.use(express.static(path.join(__dirname, "/public")))


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error'); // Render the error view for internal server errors
});


//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParse())
app.use(morgan("dev"))
app.use(cors())

//Routing
app.use('/admin', AdminRouter)
app.use('/user', UserRouter)
app.use('/auth', AuthRouter)
app.get('/login', (req, res) => {
    res.render('login2')
})

app.get('/', isLogin, (req, res) => {
    res.render('index')
})


//Server
const port = process.env.PORT
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});