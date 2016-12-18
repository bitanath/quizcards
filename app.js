var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var jsonfile = require('jsonfile');
const port = process.env.PORT || 8080;
var _ = require('underscore');
var Questions = require('./models/questions');
var random = require('mongoose-query-random');

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
//static directory is public
app.use(express.static('public'));

app.get('/', function(req, res) {
    Questions.find().random(100, true, function(err, questions) {
        if(err)
        res.status(500).send('DB Error!');
        else{
            var chronicles = questions.filter(question=>question.source === 'Crucible Chronicles');
            var ibq = questions.filter(question=>question.source === 'India Business Quiz');
            res.render('home', {
            title: 'Quiz Cards',
            chroniclesquestions: chronicles,
            ibqquestions: ibq
        });
        }
        
    });

});

var server = app.listen(port, function() {
    var quizJson = jsonfile.readFileSync('quizchronicles.json');
    var ibqJson = jsonfile.readFileSync('indiabusiness.json');
    var quizTemp = quizJson.results.filter(quiz => quiz).map(quiz => {
        quiz.source = 'Crucible Chronicles';
        return quiz;
    });
    var ibqTemp = ibqJson.results.filter(quiz => quiz).map(quiz => {
        quiz.source = 'India Business Quiz';
        return quiz;
    });
    var json = _.flatten([quizTemp,ibqTemp]);
    console.log('Read quiz questions', quizTemp[0],ibqTemp[0]);
    Questions.remove({}, function(err, removed) {
        console.log('Deleted all documents');
        Questions.collection.insert(json, {
            ordered: false
        }, function(err) {
            if (err) {
                console.log('Errored out while inserting', err);
            } else {
                console.log('Inserted all data sources');
                console.log('Listening on port', port);
            }
        });
    });
});