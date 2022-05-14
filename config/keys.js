const req = require("express/lib/request");

if(process.env.NODE_ENV=="production")
{
  module.exports = require('./prod');
}
else
{
  module.exports = require('./dev');
}