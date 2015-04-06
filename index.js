var _ = require('lodash');
var through = require('through');
var getYouTubeID = require('get-youtube-id');
var dom5 = require('dom5');

function attrs(node) {
    var a = node.attrs;
    return  _.zipObject(_.pluck(a, 'name'), _.pluck(a, 'value'));
}
module.exports = function() {
    var buffers = [];
    var tr = through(function write(chunk) {
        buffers.push(chunk);
    }, function end() {
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
        _.forEach(links, function(link) {
            var href = attrs(link).href;
            var ytId = getYouTubeID(href);
            var t = dom5.parseFragment('<div class="lazyYT" data-youtube-id="' + ytId + '"></div>');
            var div = t.childNodes[0];
            dom5.insertBefore(doc, link, div);
            dom5.remove(link);
        });
        html = dom5.serialize(doc);
        this.push(html);
        this.push(null);
    });
    return tr;
};

