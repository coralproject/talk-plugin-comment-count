# talk-plugin-comment-count

This plugin enables a simple little embed that can live alongside any given Talk
install:

```html
<a href="#talk_thread" class="talk_comment_count">Comments</a>
<script src="{{ TALK_URL }}/static/embed/count.js"></script>
...
<div id="talk_thread"></div> // The div where the Talk thread will load.
```

Which will add the comment count to the page on the selected element! It'll even
be translated!

## Options

The reference to the `/embed/count.js` accepts a few parameters:

- `id` (optional, but highly recommended) - if provided it will lookup the
  counts for the asset directly, possibly without even hitting MongoDB.
- `url` (optional) - if provided, it will lookup the asset referenced by the url
  and return the count, this should be the same URL that you provide the Talk
  widget directly.
- `selector` (optional, defaults to `.talk_comment_count`) - if provided, you can specify a [selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
  where all matching elements will have their innerText replaced by the comment
  count.
- `notext` (optional) - when specified, it will not add the `Comment(s)` text
  to the element, and will only replace the count. By default, it will include
  the translated text version of `Comment(s)`.

Note that these parameters are required to be URI encoded, you can utilize the
[`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
method to encode each parameter.

## Loading Strategies

In order to facilitate easy loading, the `count.js` script will try various
strategies to determine which Asset is being referenced.

1. If the `id` is specified, then return the count for the asset with that ID.
2. If the `url` is specified, then return the count for the asset referenced by
   that URL.
3. If the element targeted by the selector contains a `data-talk-id=`
   parameter, it will be used in step 1.
4. If the element targeted by the selector contains a `data-talk-url=`
   parameter, it will be used in step 2.
5. If the page contains a [canonical url](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Choosing_between_www_and_non-www_URLs#Using_%3Clink_relcanonical%3E) tag, the URL will be inferred from that, and will be
   used in step 2.
6. The URL of the page will be inferred from the current page url, and will be
   used in step 2.

## License

Released under the [Apache License, v2.0](/LICENSE).
