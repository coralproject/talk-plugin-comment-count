# talk-plugin-comment-count

This plugin enables a simple little embed that can live alongside any given Talk
install:

```html
<!-- By default, the /static/embed/count.js will replace the contents of the element targeted by the .talk_comment_count selector. Adding the href="#talk_embed" will allow when you click the comment count, it will jump to the comments! -->
<a href="#talk_embed" class="talk_comment_count">Comments</a>
<script src="{{ TALK_URL }}/static/embed/count.js"></script>

<!-- ... -->

<div id="talk_embed"></div> <!-- The div where the Talk embed will load. -->
<script src="{{ TALK_URL }}/static/embed.js" onload="
  Coral.Talk.render(document.getElementById('talk_embed'), {
    talk: '{{ TALK_URL }}'
  })
"></script>
```

Which will add the comment count to the page on the selected element! It'll even
be translated!

## Installing

**Currently in beta!**

Modify/create your `plugins.json` file to include the plugin:

```
{
  "server": [
    // ...
    {"@coralproject/talk-plugin-comment-count": "^0.0.1-beta"},
    // ...
  ],
  "client": [
    // ...
  ]
}
```

Which will enable it. You then need to add the `/static/embed/count.js` file on your HTML
page, which will allow the file to be generated that will add the comment count.

### URL Options

The reference to the `/static/embed/count.js` accepts query parameters which you
may combine in any order you choose:

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

#### Examples

Get the comment count for a specific Asset by ID:

```
/static/embed/count.js?id=a-specific-asset-id
```

Get the comment count for a specific Asset by URL:

```
/static/embed/count.js?url=https%3A%2F%2Fcoralproject.net%2Fblog%2Fhappy-hacktoberfest%2F
```

### Configuration

You can specify the following environment variables that can customize how the
comment count files that are generated are cached:

- `TALK_COMMENT_COUNT_CACHE_DURATION` (default `2m`) - a string representing the
  duration of time that a given count will have it's file cached for. Formatted
  via [ms](https://www.npmjs.com/package/ms).
- `TALK_COMMENT_DETECT_COUNT_CACHE_DURATION` (default `1h`) - a string
  representing the detection script will have it's file cached for. Formatted
  via [ms](https://www.npmjs.com/package/ms).

These will be manifested when the `/static/embed/count.js` file is served with
the appropriate query parameters via the `Cache-Control` header.

#### Example

```
TALK_COMMENT_COUNT_CACHE_DURATION=1m
TALK_COMMENT_DETECT_COUNT_CACHE_DURATION=10m

GET /static/embed/count.js?id=123
Cache-Control: public, max-age=60

GET /static/embed/count.js
Cache-Control: public, max-age=600
```

## Loading Strategies

In order to facilitate easy loading, the `/static/embed/count.js` script will try various
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
