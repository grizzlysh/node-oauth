//jshint esversion:6
require('dotenv').config();
const express               = require('express');
const bodyParser            = require('body-parser');
const mongoose              = require('mongoose');
const ejs                   = require('ejs');
const session               = require('express-session');
const passport              = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app        = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// first set up session
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); // create a local login strategy, notice order!

passport.serializeUser(User.serializeUser()); // create cookies with data
passport.deserializeUser(User.deserializeUser()); // destory cookies, discover data

app.get("/", function (req, res) {
    res.render('home');
});

app.route("/login")
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res) {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err) {
            if (err){
                console.log(err);
            }
            else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect('/secrets');
                });
            }
        });
    });

app.route("/register")
    .get(function(req, res) {
        res.render('register');
    })
    .post(function(req, res) {

        // passport local mongoose package
        User.register({username: req.body.username}, req.body.password, function(err, user) {
            if (err) {
                console.log(err);
                res.redirect('/register');
            }
            else {
                passport.authenticate("local")(req, res, function() {
                    // callback  trigger is authenticate is success
                    res.redirect('secrets');
                })
            }
        })
    });

app.route("/secrets")
    .get(function(req, res) {
        if (req.isAuthenticated()){
            res.render('secrets');
        } 
        else {
            res.redirect('/login');
        }
    });

app.route("/logout")
    .get(function(req, res) {

        // deauthenthicaet user
        req.logout();
        res.redirect("/");
    });

app.listen(3000, function() {
    console.log('Server started on port 3000');
});