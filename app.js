const express = require('express')
require('./db/mongoose')
const app = express()
const userRouter = require('./routes/user')
const vechileRouter = require('./routes/vechile')
const repairRouter = require('./routes/repair')
const homeRouter = require('./routes/home')
const tireRouter = require('./routes/tire')
const consignorRouter = require('./routes/consignor')
const lrRouter = require('./routes/lr')
const port = process.env.PORT
const path = require('path')

app.use(express.urlencoded({ extended: false }));

const publicDirectoryPath = path.join(__dirname,'/templates')
app.use(express.static(publicDirectoryPath))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(userRouter)
app.use(vechileRouter)
app.use(repairRouter)
app.use(homeRouter)
app.use(tireRouter)
app.use(consignorRouter)
app.use(lrRouter)

app.listen(port,()=>{
    console.log('server is connected to the port : '+port)
})