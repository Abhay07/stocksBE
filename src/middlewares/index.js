const Users = require('./../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('./../../config');
module.exports = function (req,res,next){
	const token = req.headers['access-token'];
	if(!token) return res.status(401).send('User not authrized');
	jwt.verify(token,config.secret,(err,decoded)=>{
		if(err) return res.status(401).send('User not authorized');
		Users.findById(decoded.id,(err,results)=>{
			if (err) return res.status(500).send('User not found');
			if(!results) return res.status(500).send('User not found');
			req.user = results;
			next();
		})
	})
}