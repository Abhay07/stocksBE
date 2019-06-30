const Users = require('./../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('./../../config');

exports.login = function(req,res){
	const username = req.body.username;
	const password = req.body.password;
	if(!username || !password) {return res.status(401).send('User not authorized');}

	Users.findOne({username:username}).exec((err,results)=>{
		if(err || !results) return res.status(401).send('User not authorized');
		const token = jwt.sign({id:results._id},config.secret)
		res.send({auth:true,token:token});
	})
}

exports.register = function(req,res){
		let user = new Users({
					username:req.body.username,
					password:req.body.password,
					name:req.body.name
		})
		var error = user.validateSync();
		if(error){
			return res.status(422).send(error.message);
		}
		user.save(function(err,user){
			if(err){
				return res.sendStatus(422);
			}
			const token = jwt.sign({id:user._id},config.secret)
			return res.send({auth:true,token:token});

		})
}