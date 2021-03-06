var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var user = require('./routers/user');
var poem = require('./routers/poem');
var pimage = require('./routers/pimage');
var wy = require('./routers/wy');
var ali = require('./routers/ali');
var message = require('./routers/message');
var admin = require('./routers/admin');
var chat = require('./routers/chat');
var banner = require('./routers/banner');
var famous = require('./routers/famous');
var star = require('./routers/star');
var discuss = require('./routers/discuss');
var comment = require('./routers/comment');
var love = require('./routers/love');
var cloud_config = require('./routers/cloud_config');

var log4js = require('./utils/log4jsutil');

log4js.use(app);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

app.use('/images', express.static('images'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.use('/user', user);
app.use('/poem', poem);
app.use('/pimage', pimage);
app.use('/wy', wy);
app.use('/ali', ali);
app.use('/message', message);
app.use('/admin', admin);
app.use('/chat', chat);
app.use('/banner', banner);
app.use('/famous', famous);
app.use('/star', star);
app.use('/discuss',discuss);
app.use('/comment',comment);
app.use('/love',love);
app.use('/cloud_config', cloud_config);

app.use(function(err, req, res, next) {
  // 业务逻辑
  console.log(err)
});

var server = app.listen(9001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});