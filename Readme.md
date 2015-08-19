# brainpm-youtube

a transform stream that turns vanilla links to youtube video pages into divs as expected by [lazy-youtube][1]. Additionally adds a `div` containing some meta-data.

Turns this

``` html
    <a href="https://www.youtube.com/watch?v=JafQYA7vV6s">bla1</a>
```

into this

``` html
    <div class="video">
        <div class="lazyYT" data-youtube-id="JafQYA7vV6s"></div>
        <div class="credits">
            <span class="title">5 Hole Paper Tape - Computerphile</span>
            <span class="channel">
                <a href="https://www.youtube.com/channel/UC9-y-6csu5WGm29I7JiwpnA">Computerphile</a>
            </span>
            <span class="license">youtube</span>
            <span class="publishedAt">2015-03-31T15:31:32.000Z</span>
        </div>
    </div>
```

[1]: https://www.npmjs.com/package/lazy-youtube

