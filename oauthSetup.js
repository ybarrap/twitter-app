var oauth = require("oauth");

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

module.exports = consumer;
