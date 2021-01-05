require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')




const PORT = process.env.PORT || 3000
app.use(flash())

app.use(express.json())
app.use(express.urlencoded({
    extended: false
  }));
app.use(express.static('public'))


mongoose.connect("mongodb://localhost:27017/pizza",{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex:true
});
const connection = mongoose.connection;
connection.once('open',()=>{
    console.log("Database connected...");
}).catch(err=>{
    console.log("connection Failed...");
});

//session store
let mongoStore = new MongoDbStore({
    mongooseConnection:connection,
    collection:"sessions"
})



//session config
app.use(session({
    secret: process.env.COOKIE_S,
    store:mongoStore,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 60 * 24} //24 hours
}))
//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())




app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})


// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)

app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`)
}) 