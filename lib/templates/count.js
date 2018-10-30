(() => {
  // Select all the elements containing the selector, and replace their inner text
  // with the comment count.
  const elements = document.querySelectorAll(
    "{% if commentCountSelectorRef %}[data-talk-ref='{{ commentCountSelectorRef }}']{% else %}{{ commentCountSelector }}{% endif %}"
  );
  // https://developer.mozilla.org/en-US/docs/Web/API/NodeList documents a 
  // IE11 "safe" way to iterate over elements:
  Array.prototype.forEach.call(elements, function(element) {
    element.innerText = '{{ commentCountText }}';
  });
})();
