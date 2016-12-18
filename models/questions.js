var mongoose = require('mongoose');
var db = require('./db');
var Schema = mongoose.Schema;
/**
 * Schema structure = User --> Apps --> Datas (with redundancies)
 */
var questionSchema = new Schema({    
    question: String,
    answer: String,     
    image: String, 
    source: String   
}, {
    timestamps: true
});

var Questions = mongoose.model('Questions', questionSchema);

// make this available to our users in our Node applications
module.exports = Questions;