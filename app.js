/* 
    Node.js, express, oauth example using Twitters API
    
    Install Dependencies:
        npm install express body-parser oauth express-logger cookie-parser express-session util-inspect oauth
    
    Create App File:
        Save this file to app.js
    
    Start Server:
        node app.js
    
    Navigate to the page:
        Local host: http://127.0.0.1:8080
        Remote host: http://yourserver.com:8080
    
    Logs go to log/express.log

    Author: Paul Ybarra
    Date: June 30, 2019
*/

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("express-logger");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var twitterapi = require("./routes/routetwitter");
var oauthapi = require("./routes/oauthtwitter");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger({ path: "log/express.log" }));
app.use(cookieParser());
app.use(
  session({ secret: "very secret", resave: false, saveUninitialized: true })
);

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use("/home", twitterapi);
app.use("/sessions", oauthapi);

app.listen(8080, function() {
  console.log("router runining on port 8080!");
});
