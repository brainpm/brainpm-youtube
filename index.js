var _ = require('lodash');
var through = require('through');
var getYouTubeID = require('get-youtube-id');
var dom5 = require('dom5');
var request = require('request');
var debug = require('debug')('brainpm-youtube');
var eachAsync = require('each-async');
var jade = require('jade');
var creditsTemplate = jade.compileFile(__dirname + '/credits.jade');

var requestInfo = function(id, cb) {
    request(
        "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU&id="+ id +"&part=snippet,contentDetails,status",
        function(err, response, body) {
            if (err) return cb(err);
            var data = {};
            try {
                data = JSON.parse(body);
            } catch (e) {
                return cb(e);
            }
            return cb(null, data.items[0]);
        }
    );
};

function getVideoCredits(id, cb) {
    requestInfo(id, function(err, data) {
        if (err) return cb(err);
        var embedAllowed = data.status.embeddable; 
        debug('title: ' + data.snippet.title);
        debug('embedable: ' + embedAllowed);

        var channelTitle = data.snippet.channelTitle;
        var channelId = data.snippet.channelId;
        debug('channel: ' + channelTitle + ' id: ' + channelId);
        var license = data.status.license;
        debug('license: ' + license);

        var publishedAt = data.snippet.publishedAt;
        debug('published at: ' + publishedAt);
        cb(null, creditsTemplate(data));
    });
}

function attrs(node) {
    var a = node.attrs;
    return  _.zipObject(_.pluck(a, 'name'), _.pluck(a, 'value'));
}
module.exports = function() {
    var buffers = [];
    var tr = through(function write(chunk) {
        buffers.push(chunk);
    }, function end() {
        var stream = this;
        var data = Buffer.concat(buffers);
        var html = data.toString();
        var doc = dom5.parseFragment(html);
        var isYoutubeLink = dom5.predicates.AND(
            dom5.predicates.hasTagName('a'),
            dom5.predicates.hasAttr('href'),
            function(node) {
                var a = attrs(node);
                return /youtube.com/.test(a.href);
            }
        );
        var links = dom5.queryAll(doc, isYoutubeLink);
        eachAsync(links, function(link, index, cb) {
            var href = attrs(link).href;
            var ytId = getYouTubeID(href);

            debug('youtube id: ' + ytId);

            getVideoCredits(ytId, function(err, credits) {
                if (err) return cb(err);

                var t = dom5.parseFragment('<div class="video"><div class="lazyYT" data-youtube-id="' + ytId + '"></div>'+credits+'</div>');
                var div = t.childNodes[0];
                dom5.insertBefore(link.parentNode, link, div);
                dom5.remove(link);
                cb(null);
            });
        }, function(err) {
            if (err) {
                console.log(err);
                throw err;
            }
            html = dom5.serialize(doc);
            stream.push(html);
            stream.push(null);
        });
    });
    return tr;
};

