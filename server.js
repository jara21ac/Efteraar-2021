//npm init for at vi kan bruge node_modules 

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//Imports
    //npm i express. Express server, application server
    //npm i ejs vores template sprog
    //npm i --save-dev ("for development only") nodemon (genstarter serveren hver gang der gemmes)
    //dotenv gør det muligt for os at bruge "environment variables" som vi kan lagre i en dotenv fil som vi derved loade ind i vores server.
    //Vi tilføjer .env(da den kunne indholde sensitive oplysninger) og nodemodules til vores .gitignore fil


    //Import Express
const express = require('express')
    //app variable
const app = express()
    //hashedPassowrd
const bcrypt = require('bcrypt')
    //Authenticate
const passport = require('passport')
    //
const flash = require('express-flash')
    //
const session = require('express-session')
    //Gør det muligt for os at bruge PUT og DELETE i vores EJS filer
const methodOverride = require('method-override')
    //Gør det muligt for os at gemme data i JSON filer
const fs = require('fs')

const initializePassport = require('./passport-config')
const { request } = require('http')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


//User 

const users = [];

//PORT
//Export, app.adress (error)
module.exports = app.listen(3001), users

//app.set/use

app.set('views', './views')
//Muliggøre EJS syntaks
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
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
//Export, app.adress
module.exports = app.listen(3000), users

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

//layout

//localhost:3000

app.get('/', checkAuthenticated, (req, res) => {
    //"/" hjemmeside ruten
    //Authentication funktionen bruges til at tjekke ???
    //(req, res) request og response variable
    //=> function sender dem til vores index
    res.render('index.ejs', { name: req.user.name })
}) //<form> i EJS for at definere vores inputs

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
//DELETE til at slette
app.delete('/logout', (req, res) => {
    //logout som vi kan bruger fra vores ???
    req.logout()
    res.redirect('/login')
})

//localhost:3000/ --> delete
app.delete('/', (req, res) => {
    //Vi sletter (splice) hos "users" den højre del (index 1) af objektet
    users.splice(0, users.length);
    //Vi bruger fs til at gemme filer. De bliver skrevet hen i sen synkron form til vores "user.json" i "Profiles" mappen.
    //Dertil bruger vi JSON.stringify til at gøre vores users fra objekt til stringes
    //For at gøre det nemmere at se på bruger vi null, 2 så det står under hinanden i stedet for i forlængelse
    fs.writeFileSync('Profiles/user.json', JSON.stringify(users, null, 2));
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
        //hashedpassword for at kryptere adgangskoden
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
        //Hvis det lykkes bliver vi ført hen til /login
        fs.writeFileSync('Profiles/user.json', JSON.stringify(users, null, 2));
    } catch {
        //Hvis det fejler bliver vi ført hen til /register
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
        fs.writeFileSync('Profiles/user.json', JSON.stringify(users, null, 2));
    } catch {
        res.redirect('/update')
    }
    //console.log(users)
})



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
    fs.writeFileSync('Profiles/product.json', JSON.stringify(product, null, 2));
    //console.log(product)
    //Testing
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
        product.splice(0, 1);
        res.redirect("/product")
        fs.writeFileSync('Profiles/product.json', JSON.stringify(product, null, 2));
    } catch {
        res.redirect("/updateProduct")
    }
    console.log(product)
})

//Delete Product
app.delete("/product", (req, res) => {
    product.splice(0, product.length);
    res.redirect("/product")
    fs.writeFileSync('Profiles/product.json', JSON.stringify(product, null, 2));
    console.log(product);
})

//One Category

app.get("/product/:category", checkAuthenticated, (req, res) => {
    const categories = product.find(c => c.category === req.params.category)
    if (!categories) return "Wrong category"
    res.render("categoryProduct.ejs", {categories: categories})
})

//CSS
app.use(express.static(__dirname + '/public'));