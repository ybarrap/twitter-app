# twitter-app
Twitter API using Node.js 

Uses Oath to get Access Token and Access Token Secret
Uses localhost or remote host for callback
Uses Twitter API to search User and Home Timeline
Adding support for general Search in future version
Consumer Key and Key Secret passed in through environment variables

To run:

node app.js

Examples:

Get count=10 tweets from user screen_name: ybarrap that are older than tweets associated with id_str=1145402002974871558 (i.e. Snowflake timestamp):

http://192.168.1.4:8080/home/user?count=10&max_id=1145402002974871558&screen_name=ybarrap

Get your own timeline:

http://192.168.1.4:8080/home/timeline?count=10&since_id=1145438457491349506



