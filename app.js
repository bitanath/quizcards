var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var jsonfile = require('jsonfile');
const port = 8081;
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
    Questions.find({
        flag: false
    }).random(30, true, function(err, questions) {
        if (err)
            res.status(500).send('DB Error!');
        else {
            var chronicles = questions.filter(question => question.source === 'Crucible Chronicles');
            var ibq = questions.filter(question => question.source === 'India Business Quiz');
            res.render('home', {
                title: 'Quiz Cards',
                chroniclesquestions: chronicles,
                ibqquestions: ibq
            });
        }

    });

});
app.get('/bookmark', function(req, res) {
    Questions.find({
        bookmark: true,
        flag: false
    }).random(30, true, function(err, questions) {
        if (err)
            res.status(500).send('DB Error!');
        else {
            var chronicles = questions.filter(question => question.source === 'Crucible Chronicles');
            var ibq = questions.filter(question => question.source === 'India Business Quiz');
            res.render('home', {
                title: 'Quiz Cards',
                chroniclesquestions: chronicles,
                ibqquestions: ibq
            });
        }

    });

});
app.get('/flag', function(req, res) {
    Questions.find({
        flag: true
    }).random(30, true, function(err, questions) {
        if (err)
            res.status(500).send('DB Error!');
        else {
            var chronicles = questions.filter(question => question.source === 'Crucible Chronicles');
            var ibq = questions.filter(question => question.source === 'India Business Quiz');
            res.render('home', {
                title: 'Quiz Cards',
                chroniclesquestions: chronicles,
                ibqquestions: ibq
            });
        }

    });
});
//POST routes for handling requests
app.post('/flagquestion/:id', function(req, res) {
    var id = req.params.id;
    if (!id)
        return res.status(500).json({
            message: 'No id sent'
        });
    Questions.findById(id, function(err, question) {
        if (err)
            return res.status(500).json({
                message: 'DB cannot be read'
            });
        else {
            question.flag = true;
            question.save(function(err) {
                res.status(200).json({
                    message: 'success'
                });
            });
        }
    });
});
app.post('/bookmarkquestion/:id', function(req, res) {
    var id = req.params.id;
    if (!id)
        return res.status(500).json({
            message: 'No id sent'
        });
    console.log('Bookmarking question',id);
    Questions.findById(id, function(err, question) {
        console.log('Found question',question);
        if (err)
            return res.status(500).json({
                message: 'DB cannot be read'
            });
        else {
            question.bookmark = true;
            question.save(function(err) {
                res.status(200).json({
                    message: 'success'
                });
            });
        }
    });
});
app.post('/unbookmarkquestion/:id', function(req, res) {
    var id = req.params.id;
    if (!id)
        return res.status(500).json({
            message: 'No id sent'
        });
    Questions.findById(id, function(err, question) {
        if (err)
            return res.status(500).json({
                message: 'DB cannot be read'
            });
        else {
            question.bookmark = false;
            question.save(function(err) {
                res.status(200).json({
                    message: 'success'
                });
            });
        }
    });
});
app.post('/unflagquestion/:id', function(req, res) {
    var id = req.params.id;
    if (!id)
        return res.status(500).json({
            message: 'No id sent'
        });
    Questions.findById(id, function(err, question) {
        if (err)
            return res.status(500).json({
                message: 'DB cannot be read'
            });
        else {
            question.flag = false;
            question.save(function(err) {
                res.status(200).json({
                    message: 'success'
                });
            });
        }
    });
});

var server = app.listen(port, function() {
    Questions.findOne({}, function(err, question) {
        if (!err && question) {
            console.log('Already have questions loaded in DB');
            return;
        }
        console.log('Loading questions from JSON');
        var quizJson = jsonfile.readFileSync('quizchronicles.json');
        var ibqJson = jsonfile.readFileSync('indiabusiness.json');
        var quizTemp = quizJson.results.filter(quiz => quiz).map(quiz => {
            quiz.source = 'Crucible Chronicles';
            quiz.bookmark = false;
            quiz.flag = false;
            return quiz;
        });
        var ibqTemp = ibqJson.results.filter(quiz => quiz).map(quiz => {
            quiz.source = 'India Business Quiz';
            quiz.bookmark = false;
            quiz.flag = false;
            return quiz;
        });
        var json = _.flatten([quizTemp, ibqTemp]);
        console.log('Read quiz questions', quizTemp[0], ibqTemp[0]);
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

});