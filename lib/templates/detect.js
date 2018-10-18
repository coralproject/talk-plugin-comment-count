(() => {
  // parses the Asset URL from the config variable
  function getCanonicalURL() {
    try {
      // Try to get the url from the canonical tag on the page.
      return document.querySelector('link[rel="canonical"]').href;
    } catch (e) {
      // Rebuild the origin if it isn't defined. This is our poor-mans polyfill
      // for the location API's.
      let origin = window.location.origin;
      if (!origin) {
        origin = `${window.location.protocol}//${window.location.hostname}${
          window.location.port ? `:${window.location.port}` : ''
        }`;
      }

      return origin + window.location.pathname;
    }
  }

  /**
   * This will inject a script tag onto the body that will load the comment
   * count.
   *
   * @param {string} url the URL for the Asset that we want to load the count
   * @param {string} id the ID of the Asset that we want to load the count
   * @param {string?} talkRef the reference possibly that will specify the selector details
   */
  function buildAndInjectScript(url, id, talkRef) {
    const script = document.createElement('script');
    script.src = `{{ STATIC_URL }}static/embed/count.js?`;

    // If the talkRef is provided, then use it instead of the selector.
    script.src += talkRef
      ? `ds=${encodeURIComponent(talkRef)}`
      : 'selector={{ commentCountSelector | urlencode }}';

    // Inject the ID if provided, and url otherwise.
    if (id) {
      script.src += `&id=${encodeURIComponent(id)}`;
    } else {
      script.src += `&url=${encodeURIComponent(url)}`;
    }

    document.body.appendChild(script);
  }

  /**
   * This will compute the data reference hash that can be used to deduplicate
   * and ensure minimal network requests.
   *
   * @param {Element} element the Element that contains at least one dataset.
   */
  const computeDataRef = element =>
    element.dataset.talkId
      ? btoa(element.dataset.talkId)
      : btoa(element.dataset.talkUrl);

  // Load all the selected elements, and determine if we have any data
  // attributes.
  const elements = document.querySelectorAll('{{ commentCountSelector }}');
  let hasDataAttributes = false;
  for (const element of elements) {
    if (element.dataset.talkId || element.dataset.talkUrl) {
      hasDataAttributes = true;
      break;
    }
  }

  if (hasDataAttributes) {
    // The elements contain data attributes, so we need to load many scripts.
    const talkRefs = [];
    for (const element of elements) {
      // Create a data ref element that we can use to associate with a given
      // element on the page.
      const talkRef = computeDataRef(element);
      element.dataset.talkRef = talkRef;

      // Don't insert the same script twice for comments!
      if (talkRefs.indexOf(talkRef) !== -1) {
        continue;
      }
      talkRefs.push(talkRef);

      // Inject the script with the reference talk url, id, and the target
      // reference.
      buildAndInjectScript(
        element.dataset.talkUrl,
        element.dataset.talkId,
        talkRef
      );
    }
  } else {
    // At this point, because no elements on the page contain the data elements,
    // we can just load the script for the canonical url.
    buildAndInjectScript(getCanonicalURL());
  }
})();
