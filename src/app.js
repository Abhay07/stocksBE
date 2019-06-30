const express = require('express');
const bodyParser = require('body-parser');
const config = require('./../config');
const baseRoute = require('./routes/base.route');
const stockRoute = require('./routes/stock.route');
const balanceRoute = require('./routes/balance.route');
const app = express();
let port = process.env.PORT || 8080;

const mongoose = require('mongoose');

mongoose.connect(`mongodb://${config.uName}:${config.uPassword}@ds343887.mlab.com:43887/stock`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());

//Allow Cors and custom header i.e. access-token
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, access-token');
  
  //For options call, just send 200 OK response
  if(req.method === 'OPTIONS'){
  	res.send();
  }
  else{
  	next();
  }
});

//Routes assignment
app.use('/stock',stockRoute)
app.use('/balance',balanceRoute)
app.use('/',baseRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
