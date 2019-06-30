const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
let UserSchema = new Schema({
    username: {
    	type: String, 
    	required: [true,'username required'], 
    	match:[/^[\w]{4,}$/,'Invalid username, minimum 4 characters, no special characters'],
    	minLength:[4,'Minimum 4 characters required'],
        unique:true,
    },
    password: {
    	type: String, 
    	required: [true,'password required'], 
    	match:[/^[^\s]{6,}$/,'Invalid password'],
    	minLength:[6, 'Minimum 6 characters required']
    },
    balance:{
        type:Number,
        default:0,
        min:0,
    },
    name: {
    	type: String, 
    	required:[true,'name required'], 
    	match:[/^[A-Za-z]+[A-Za-z\s]+$/,'Name cannot contain numbers or special character'],
    	minLength:[3,'Minimum 3 characters required']
    },
    _id:{
    	type:String,
        default:shortid.generate
    },
    portfolio:[{
        count:Number,
        name:String,
    }]
});

module.exports = mongoose.model('Users', UserSchema);