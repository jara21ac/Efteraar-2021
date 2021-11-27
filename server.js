if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//Imports
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

//app.set/use
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//PORT
app.listen(3000)

//layout

    //localhost:3000
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name})
})

    //localhost:3000/login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

    //localhost:3000/ --> Logout
app.delete('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

    //localhost:3000/ --> delete
app.delete('/', (req, res) => {
    users.splice(0, users.length);
    req.logOut()
    res.redirect('/login')
})

    //localhost:3000/register

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

    //localhost:3000/update
app.get('/update', checkAuthenticated, (req, res) => {
    res.render('update.ejs')
})

app.put('/update', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: req.user.id,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        users.splice(0, 1); //I dont know
        res.redirect('/')
    } catch {
        res.redirect('/update')
    }   
    //console.log(users)
})


    //Authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


//Create Product

const product = [];

app.get('/product', checkAuthenticated, (req, res) => {
    res.render('product.ejs', {
        name: req.user.name,
        product: product
    }) 
})

app.post('/', checkAuthenticated, (req, res) => {
    product.push({
        id: req.user.id,
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        image: req.body.image
    })
    res.redirect('/product')
})

//Update Product

app.get("/updateProduct", checkAuthenticated, (req, res) => {
    res.render("updateProduct.ejs")
})

app.put("/updateProduct", async (req, res) => {
    try {
        product.push({
            id: req.user.id,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image: await req.body.image
        })
        product.splice(0,1);
        res.redirect("/product")
    } catch {
        res.redirect("/updateProduct")
    }
    console.log(product)
})

//Delete Product
app.delete("/product", (req, res) => {
    product.splice(0, product.length);
    res.redirect("/product")
    console.log(product);
})

//One Category
app.get("/categoryProduct", (req, res) => {
    res.render("categoryProduct.ejs")
})

