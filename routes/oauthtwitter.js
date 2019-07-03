var express = require("express");
var router = express.Router();
var consumer = require("../oauthSetup");

router.get("/connect", function(req, res) {
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

router.get("/callback", function(req, res) {
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

router.get("*", function(req, res) {
  res.redirect("/home");
});

module.exports = router;
