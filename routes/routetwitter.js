var express = require("express");
var router = express.Router();
var inspect = require("util-inspect");
var querystring = require("querystring");
var consumer = require("../oauthSetup");

// https://api.twitter.com/1.1/statuses/home_timeline.json

router.get("/timeline", function(req, res) {
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

// https://api.twitter.com/1.1/statuses/retweets_of_me.json

router.get("/rtofme", function(req, res) {
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
    `https://api.twitter.com/1.1/statuses/retweets_of_me.json?count=${count}${since_id}${max_id}&include_user_entities=true&include_entities=true`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    function(error, data, response1) {
      if (error) {
        //console.log(error)
        res.redirect("/sessions/connect");
      } else {
        var tweets = JSON.parse(data);
        // console.log(tweets[0].entities.user_mentions[0].screen_name);
        // console.log(tweets);
        // res.send("You are signed in: " + inspect(parsedData));
        res.send(parseTweet2(tweets));
        // res.send(inspect(tweets[0]));
        //   console.log(parsedData[i].text);
        for (var i = 0, len = tweets.length; i < len; i++) {
          console.log(
            `Mentions: ${parseMentions(
              tweets[i].entities.user_mentions
            )} Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
              tweets[i].text
            }`
          );
        }
      }
    }
  );
});

// https://api.twitter.com/1.1/statuses/user_timeline.json

router.get("/user", function(req, res) {
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
        // for (var i = 0, len = tweets.length; i < len; i++) {
        //   console.log(
        //     `Screen Name: ${
        //       tweets[i].user.screen_name
        //     } Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
        //       tweets[i].text
        //     }`
        //   );
        // }
      }
    }
  );
});

// https://api.twitter.com/1.1/statuses/mentions_timeline.json

router.get("/mentions", function(req, res) {
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
        // for (var i = 0, len = tweets.length; i < len; i++) {
        //   console.log(
        //     `Date: ${parseTwitterDate(tweets[i].created_at)} Tweet: ${
        //       tweets[i].text
        //     }`
        //   );
        // }
      }
    }
  );
});

// https://api.twitter.com/1.1/favorites/list.json

router.get("/liked", function(req, res) {
  //   console.log(
  //     "******* res.query.q = ",
  //     querystring.stringify({ q: req.query.q || "from:ybarrap" })
  //   );
  const query =
    "&" + querystring.stringify({ q: req.query.q || "from:ybarrap" });
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
    `https://api.twitter.com/1.1/favorites/list.json?count=${count}${max_id}${since_id}${query}`
  );
  consumer.get(
    `https://api.twitter.com/1.1/favorites/list.json?count=${count}${max_id}${since_id}${query}`,
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
        // console.log(tweets.tweets);
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

// https://api.twitter.com/1.1/search/tweets.json

router.get("/search", function(req, res) {
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

router.get("/", function(req, res) {
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

router.get("*", function(req, res) {
  res.redirect("/home");
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

function parseTweet2(tweets) {
  var d = "";
  for (var i = 0, len = tweets.length; i < len; i++) {
    d += `<li> Mentions: ${parseMentions(
      tweets[i].entities.user_mentions
    )}  Since_id: ${tweets[i].id_str} Date: ${parseTwitterDate(
      tweets[i].created_at
    )} Tweet: ${tweets[i].text}</li>`;
  }
  return d;
}

function parseMentions(mentions) {
  d = "";
  for (var i = 0, len = mentions.length; i < len; i++) {
    d += `${mentions[i].screen_name} `;
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

module.exports = router;
