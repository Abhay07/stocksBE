const User = require('./../models/user.model');

exports.getBalance = function (req,res){
	return res.status(200).send({balance:req.user.balance});
}

exports.updateBalance = function (req,res){
	const balance = Number(req.body.balance);
	if(isNaN(balance) || balance < 0 || balance > 100000){
		return res.sendStatus(422);
	}
	User.findByIdAndUpdate(req.user._id,{balance:balance},
	function(err,result){
		if(err){
			console.log(err);
			return res.sendStatus(500);
		}
		return res.sendStatus(200);
	})
}