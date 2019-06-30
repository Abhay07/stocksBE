const User = require('./../models/user.model');
const axios = require('axios');
const config = require('./../../config');

exports.getStock = function(req,res){
	let id = req.params.id;
	let {lastResult, count} = req.query;
	if(isNaN(lastResult)){
		lastResult = 0;
	}
	if(isNaN(count)){
		count = 10;
	}
	User.findById(req.user._id,
		'portfolio -_id balance',
		{skip:Number(lastResult), limit:Number(count)},
		function(err, result){	
			if(err){
				console.log(err);
				return res.sendStatus(500);
			}
			res.send(result);
		}
	);
}

exports.searchStock = function(req,res){
	const symbol = req.query.symbol;
	if(symbol){
		axios
		.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${config.alphaApiKey}`)
		.then(response=>{
			if(response.data){
				return res.status(200).send(response.data);
			}
			throw 'Error'
		})
		.catch(err=>{
			res.sendStatus(500);
		})
	}
	else{
		res.sendStatus(422);
	}
}

exports.getStockQuote= function(req,res){
	let symbol = req.params.symbol;
	if(symbol){
		symbol = symbol.toUpperCase();
	}
	axios
	.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${config.alphaApiKey}`)
	.then((response)=>{
		if(response.data && response.data['Global Quote']){
			return res.status(200).send(response.data);
		}
	})
	.catch((err)=>{
		res.status(404).send({error:'Stock could not be found'});
	})

}

exports.updateStock = function(req,res){
	let type = req.query.type;
	if(!req.body.name ||!req.body.count){
		return res.sendStatus(422);
	}
	let reqStock = {
		name:req.body.name,
		count:req.body.count,
	}

	axios
	.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${reqStock.name}&apikey=${config.alphaApiKey}`)
	.then((res)=>{
		if(res.data && res.data['Global Quote'] && res.data['Global Quote']['05. price']){
			return Promise.resolve(res.data['Global Quote']['05. price'])
		}
		return Promise.reject();
	})
	.then((price)=>{
		reqStock.price = price;
		//Check if already bought same stock
		let existingStock = null;
		req.user.portfolio.forEach((stock)=>{
			if(stock.name == req.body.name){
				existingStock = stock;
			}
		})
		return Promise.resolve({existingStock})
	},_=>{
		return res.status(422).send({error:'Stock not found'});
	})
	.then(({existingStock})=>{
		if(type == 'BUY'){
			if(reqStock.price*reqStock.count > req.user.balance){
				return res.status(422).send({error:"Insufficent Balance"})
			}
			if(existingStock){
				User.findOneAndUpdate({_id:req.user._id,'portfolio.name':existingStock.name},
				{
					$inc:{
						'portfolio.$.count':req.body.count,
						'balance':-(reqStock.count*reqStock.price)
					}
				},
				function(err,result){
					if(err){
						console.log(err);
						return res.sendStatus(500);
					}
					return res.sendStatus(200);
				})
			}
			else{
				User.findByIdAndUpdate(req.user._id,
					{
						$addToSet:{
							'portfolio':reqStock
						},
						$inc:{
							'balance':-(reqStock.count*reqStock.price)
						}
					},
					function(err,result){
							if(err){
								console.log(err);
								return res.sendStatus(500);
							}
							return res.sendStatus(200);
					})
			}
		 }
		 else if(type == 'SELL'){
		 	if(existingStock){
		 		if(reqStock.count > existingStock.count){
		 			return res.status(422).send({error:'Stocks not available'});
		 		}
		 		let updateObj = null;
		 		if(reqStock.count == existingStock.count){
		 			updateObj = {
		 				"$pull":{
		 					"portfolio":{"name":existingStock.name}
		 				},
		 				"$inc":{
		 					'balance':reqStock.count*reqStock.price
		 				}
		 			}
		 		}
		 		else{
		 			updateObj = {
		 				"$inc":{
						'portfolio.$.count':-(req.body.count),
						'balance':reqStock.count*reqStock.price
						}
		 			}
		 		}
		 		User.findOneAndUpdate({_id:req.user._id,'portfolio.name':existingStock.name},updateObj,
				function(err,result){
					if(err){
						console.log(err);
						return res.sendStatus(500);
					}
					return res.sendStatus(200);
				})
		 	}
		 	else{
		 		res.status(404).send({error:"Stock not found in portfolio"});
			}
		 }
		 else{
		 	res.sendStatus(422);
		 }
	})
	.catch(err=>{
		console.log(err);
		res.sendStatus(500);
	})
}

exports.deleteStock = function(req,res){
	User.findByIdAndUpdate(req.user._id,{'portfolio':[]},
		function(err,result){
			if(err){
				console.log(err);
				res.sendStatus(500);
			}
			res.sendStatus(200);
		})
}

