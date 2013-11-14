var request = require('request');

request({
  host: 'localhost',
  port: 5984,
  path: '/registry'
}, function(err, res, data){
  console.log(res);
});
