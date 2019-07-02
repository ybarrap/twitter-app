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
var inspect = require("util-inspect");
var oauth = require("oauth");
var querystring = require("querystring");

var app = express();

// Get your credentials here: https://dev.twitter.com/apps
var _twitterConsumerKey = process.env._twitterConsumerKey;
var _twitterConsumerSecret = process.env._twitterConsumerSecret;

var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token",
  "https://twitter.com/oauth/access_token",
  _twitterConsumerKey,
  _twitterConsumerSecret,
  "1.0A",
  "http://192.168.1.4:8080/sessions/callback",
  "HMAC-SHA1"
);

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

app.get("/sessions/connect", function(req, res) {
  consumer.getOAuthRequestToken(function(
    error,
    oauthToken,
    oauthTokenSecret,
    results
  ) {
    if (error) {
      res.send("Error getting OAuth request token : " + inspect(error), 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      console.log("Double check on 2nd step");
      console.log("------------------------");
      console.log("<<" + req.session.oauthRequestToken);
      console.log("<<" + req.session.oauthRequestTokenSecret);
      res.redirect(
        "https://twitter.com/oauth/authorize?oauth_token=" +
          req.session.oauthRequestToken
      );
    }
  });
});

app.get("/sessions/callback", function(req, res) {
  console.log("------------------------");
  console.log(">>" + req.session.oauthRequestToken);
  console.log(">>" + req.session.oauthRequestTokenSecret);
  console.log(">>" + req.query.oauth_verifier);
  consumer.getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        res.send(
          "Error getting OAuth access token : " +
            inspect(error) +
            "[" +
            oauthAccessToken +
            "]" +
            "[" +
            oauthAccessTokenSecret +
            "]" +
            "[" +
            inspect(results) +
            "]",
          500
        );
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

        res.redirect("/home");
      }
    }
  );
});

// https://api.twitter.com/1.1/statuses/home_timeline.json

app.get("/home/timeline", function(req, res) {
  const count = req.query.count || 3;
  var since_id = "";
  var max_id = "";
  if (req.query.max_id) {
    max_id = "&max_id=" + req.query.max_id;
    since_id = "";
  } else if (req.query.since_id) {
    since_id = "&since_id=" + req.query.since_id;
    max_id = "";
  }

  consumer.get(
    `https://api.twitter.com/1.1/statuses/home_timeline.json?count=${count}${since_id}${max_id}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var tweets = JSON.parse(data);
        // res.send("You are signed in: " + inspect(parsedData));
        res.send(parseTweet(tweets));
        // res.send(inspect(tweets[0]));
        //   console.log(parsedData[i].text);
        for (var i = 0, len = tweets.length; i < len; i++) {
          console.log(
            `Screen Name: ${tweets[i].user.screen_name} Since_id: ${
              tweets[i].id_str
            }Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
              tweets[i].text
            }`
          );
        }
      }
    }
  );
});

// https://api.twitter.com/1.1/statuses/user_timeline.json

app.get("/home/user", function(req, res) {
  const count = req.query.count || 3;
  const screen_name = req.query.screen_name || "ybarrap";
  var since_id = "";
  var max_id = "";
  if (req.query.max_id) {
    max_id = "&max_id=" + req.query.max_id;
    since_id = "";
  } else if (req.query.since_id) {
    since_id = "&since_id=" + req.query.since_id;
    max_id = "";
  }
  consumer.get(
    `https://api.twitter.com/1.1/statuses/user_timeline.json?count=${count}&screen_name=${screen_name}${since_id}${max_id}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var tweets = JSON.parse(data);
        // res.send("You are signed in: " + inspect(parsedData));
        res.send(parseTweet(tweets));
        // res.send(inspect(tweets[0]));
        //   console.log(parsedData[i].text);
        for (var i = 0, len = tweets.length; i < len; i++) {
          console.log(
            `Screen Name: ${
              tweets[i].user.screen_name
            } Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
              tweets[i].text
            }`
          );
        }
      }
    }
  );
});

// https://api.twitter.com/1.1/statuses/mentions_timeline.json

app.get("/home/mentions", function(req, res) {
  const count = req.query.count || 3;
  var since_id = "";
  var max_id = "";
  if (req.query.max_id) {
    max_id = "&max_id=" + req.query.max_id;
    since_id = "";
  } else if (req.query.since_id) {
    since_id = "&since_id=" + req.query.since_id;
    max_id = "";
  }
  consumer.get(
    `https://api.twitter.com/1.1/statuses/mentions_timeline.json?count=${count}${since_id}${max_id}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var tweets = JSON.parse(data);
        // res.send("You are signed in: " + inspect(parsedData));
        res.send(parseTweet(tweets));
        // res.send(inspect(tweets[0]));
        //   console.log(parsedData[i].text);
        for (var i = 0, len = tweets.length; i < len; i++) {
          console.log(
            `Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
              tweets[i].text
            }`
          );
        }
      }
    }
  );
});

// https://api.twitter.com/1.1/search/tweets.json

//https://api.twitter.com/1.1/search/tweets.json?count=${count}${since_id}${max_id}${query}${result_type}

//https://api.twitter.com/1.1/search/tweets.json?count=10&q=from%3Aybarrap

// https://api.twitter.com/1.1/search/tweets.json?count=10&q=from%3Aybarrap?q=castro%20near%3A"San%20Antonio%2C%20TX"%20within%3A15mi&src=typd&lang=en

// https://api.twitter.com/1.1/search/tweets.json?count=${count}${max_id}${result_type}${since_id}${query}

app.get("/home/search", function(req, res) {
  //   console.log(
  //     "******* res.query.q = ",
  //     querystring.stringify({ q: req.query.q || "from:ybarrap" })
  //   );
  const query =
    "&" + querystring.stringify({ q: req.query.q || "from:ybarrap" });
  console.log(query);
  const result_type = "&result_type=" + (req.query.result_type || "mixed");
  const count = req.query.count || 3;
  var since_id = "";
  var max_id = "";
  if (req.query.max_id) {
    max_id = "&max_id=" + req.query.max_id;
    since_id = "";
  } else if (req.query.since_id) {
    since_id = "&since_id=" + req.query.since_id;
    max_id = "";
  }
  console.log(
    `https://api.twitter.com/1.1/search/tweets.json?count=${count}${max_id}${since_id}${result_type}${query}`
  );
  consumer.get(
    `https://api.twitter.com/1.1/search/tweets.json?count=${count}${max_id}${result_type}${since_id}${query}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var { statuses } = JSON.parse(data);
        // res.send("You are signed in: " + inspect(parsedData));
        res.send(parseTweet(statuses));
        // res.send(inspect(tweets[0]));
        //   console.log(parsedData[i].text);
        // console.log(tweets.statuses);
        for (var i = 0, len = statuses.length; i < len; i++) {
          console.log(
            `Screen Name: ${
              statuses[i].user.screen_name
            } Date: ${parseTwitterDate(statuses[i].created_at)} Tweet: ${
              statuses[i].text
            }`
          );
        }
      }
    }
  );
});

app.get("/home", function(req, res) {
  consumer.get(
    "https://api.twitter.com/1.1/account/verify_credentials.json",
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var parsedData = JSON.parse(data);
        res.send("You are signed in: " + inspect(parsedData.screen_name));
      }
    }
  );
});

app.get("*", function(req, res) {
  res.redirect("/home");
});

app.listen(8080, function() {
  console.log("App runining on port 8080!");
});

function parseTweet(tweets) {
  var d = "";
  for (var i = 0, len = tweets.length; i < len; i++) {
    d += `<li> Screen Name: ${tweets[i].user.screen_name}  Since_id: ${
      tweets[i].id_str
    } Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
      tweets[i].text
    }</li>`;
  }
  return d;
}

function parseTwitterDate(tdate) {
  var system_date = new Date(Date.parse(tdate));
  var user_date = new Date();
  var diff = Math.floor((user_date - system_date) / 1000);
  if (diff <= 1) {
    return "just now";
  }
  if (diff < 20) {
    return diff + " seconds ago";
  }
  if (diff < 40) {
    return "half a minute ago";
  }
  if (diff < 60) {
    return "less than a minute ago";
  }
  if (diff <= 90) {
    return "one minute ago";
  }
  if (diff <= 3540) {
    return Math.round(diff / 60) + " minutes ago";
  }
  if (diff <= 5400) {
    return "1 hour ago";
  }
  if (diff <= 86400) {
    return Math.round(diff / 3600) + " hours ago";
  }
  if (diff <= 129600) {
    return "1 day ago";
  }
  if (diff < 604800) {
    return Math.round(diff / 86400) + " days ago";
  }
  if (diff <= 777600) {
    return "1 week ago";
  }
  return "on " + system_date;
}
