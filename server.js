const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const AuthRouter = require('./routes/AuthRouter');
const AdminRouter = require('./routes/AdminRouter');
const dotenv = require('dotenv');
const cookieParse = require('cookie-parser');
dotenv.config();

//Views
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(express.json())
app.use(cookieParse())
app.use(morgan("dev"))
app.use(cors())

//Routing
app.use('/admin', AdminRouter)
app.use('/ruangpinjam/auth', AuthRouter)


app.get('/', (req, res) => {
    res.render('index')
})

//Server
const port = process.env.PORT
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
