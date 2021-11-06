//jshint esversion:6
require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const ejs        = require('ejs');
const bcrypt     = require('bcrypt');

// const md5        = require('md5');
// const encrypt    = require('mongoose-encryption');

const saltRounds = 10; // thhe more the hard work
const app        = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/secretDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render('home');
});

app.route("/login")
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}, function(err, element) {
            if(err){
                console.log(err);
            }
            else{
                if(element){        
                    bcrypt.compare(password, element.password, function (err, result) {
                        if (result === true){
                            res.render('secrets');
                        }
                    })
                    // if(element.password === password){
                    //     // console.log(element);
                    //     res.render('secrets');
                    // }
                }
            }  
        })
    });

app.route("/register")
    .get(function(req, res) {
        res.render('register');
    })
    .post(function(req, res) {

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const newUser = new User ({
                email   : req.body.username,
                password: hash
            })
    
            newUser.save(function (err) {
                if(err){
                    console.log(err);
                }
                else{
                    res.render('secrets');
                }
            }); 
        });
    });

app.get("/register", function (req, res) {
    res.render('register');
});

app.listen(3000, function() {
    console.log('Server started on port 3000');
})