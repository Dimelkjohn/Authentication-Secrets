require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch((err) => console.log(err));

async function main() 
{
    await mongoose.connect("mongodb://localhost:27017/userDB");

    const userSchema = new mongoose.Schema(
    {
        email: String,
        password: String
    });

    userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

    const User = new mongoose.model("User", userSchema);

    ///////////////////////////////////////// REGISTER REQUESTS ///////////////////////////////////////////////////
    app.route("/register")

    .get((req, res) => 
    {
        res.render("register");
    })

    .post((req, res) =>
    {
        const new_user = new User(
        {
            email: req.body.username,
            password: req.body.password
        });

        new_user.save((err) =>
        {
            if(!err)
            {
                res.render("secrets");
            }
            else
            {
                console.log(err);
            }
        });
    });

    ///////////////////////////////////////// LOG IN REQUESTS ///////////////////////////////////////////////////
    app.route("/login")

    .get((req, res) => 
    {
        res.render("login");
    })

    .post((req, res) =>
    {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}, (err, user) =>
        {
            if(!err)
            {
                if(user)
                {
                    if(user.password === password)
                    {
                        res.render("secrets");
                    }
                }
            }
            else
            {
                console.log(err);
            }
        });
    });
}

///////////////////////////////////////// HOME REQUESTS ///////////////////////////////////////////////////
app.route("/")

.get((req, res) => 
{
    res.render("home");
});

app.listen(3000, () =>
{
  console.log("Server started on port 3000");
});