const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const AuthRouter = require('./routes/AuthRouter')
const AdminRouter = require('./routes/AdminRouter')
const dotenv = require('dotenv')
dotenv.config()

//Middleware
app.use(express.json())
app.use(morgan("dev"))
app.use(cors())

//Routing
app.use('/admin', AdminRouter)
app.use('/ruangpinjam/auth', AuthRouter)


app.get('/', (req, res) => {
    res.send('Hello World!')
})

//Server
const port = process.env.PORT
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
