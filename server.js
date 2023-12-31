if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const port = process.env.PORT || 5000

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const cors = require('cors')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user=> user.email === email),
    id => users.find(user => user.id === id)
)


const app = express()
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cors())
app.use(methodOverride('_method'))


const users = []

app.get('/', checkAuthenticated, (req, res)=> {
    res.render('index.ejs', {name: req.user.name})
})
// __________________________________________________
app.get('/login', checkNotAuthenticated, (req, res)=> {
    res.render('login.ejs')
})
app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// __________________________________________________
app.get('/register',checkNotAuthenticated, (req, res)=> {
    res.render('register.ejs')
})
app.post('/register', checkNotAuthenticated, async (req, res)=> {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password:hashedPassword
        })
        
        res.redirect('/login')
    }catch {
        res.redirect('/register')
    }
    console.log(users)
})
// __________________________________________________

app.get('/logout', (req,res) => {
    res.render('logout.ejs')
})

app.delete('/logout', (req,res)=>{
    req.logout(function(err){
        if(err) {return next(err)}
       res.redirect('/logout')
    })
    console.log('User Logged Out')

})

// __________________________________________________

function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
 }

 function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
      return res.redirect('/')
    }
    next()
 }


// __________________________________________________


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})