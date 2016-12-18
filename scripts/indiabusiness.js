var fs = require('fs');
var _ = require('underscore');
var to_json = require('xmljson').to_json;
var jsonfile = require('jsonfile');
var cheerio = require('cheerio');
var async = require('async');
var request = require('request');

request('https://indiabusinessquiz.com/sitemap.xml', function(err, resp, xml) {
    to_json(xml, function(error, data) {
        console.log(data);
        var urls = _.pluck(data.urlset.url, 'loc');
        var promises = [];
        _.each(urls, url => {
            promises.push(getQuestionsAndAnswers.bind(null, url));
        });
        console.log('Starting requests');
        async.parallelLimit(promises, 10, function(err, results) {
            var questions = _.flatten(results);
            console.log('Got results', questions.length);
            jsonfile.writeFileSync('indiabusiness.json', {
                results: questions.filter(res => res)
            });
        });
    });
});

function getQuestionsAndAnswers(url, callback) {
    request({
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        }
    }, function(error, response, body) {
        if (error || response.statusCode !== 200)
            return callback(null, false);
        var $ = cheerio.load(body);
        var question = false;
        var object = {};
        var objects = [];
        console.log('Got response from url %s and code %d', url, response.statusCode);
        $('.entry.clearfix>p').each(function(i, el) {
            var candidate = $(this).text();
            if (/^Q[^a-zA-Z]|^\d+[^\w]/i.test(candidate)) {
                if (!_.isEmpty(object))
                    objects.push(object);
                object = {};
                object.question = candidate;
                console.log('Found question ', candidate);
            } else if (object.question) {
                var type = candidate.length > 0 ? 'answer' : 'image';
                if (type === 'answer') {
                    object.answer = candidate;
                    if (!_.isEmpty(object))
                        objects.push(object);
                    object = {};
                    console.log('Found answer ', candidate);
                } else {
                    var $img = $(this).find('img');
                    if ($img && $img.attr('src')) {
                        object.image = $img.attr('src');
                        console.log('Found image ', $img.attr('src'));
                    }
                }
            }
        });
        return callback(null, objects);
    });
}