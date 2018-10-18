(() => {
  // Select all the elements containing the selector, and replace their inner text
  // with the comment count.
  const elements = document.querySelectorAll(
    "{% if commentCountSelectorRef %}[data-talk-ref='{{ commentCountSelectorRef }}']{% else %}{{ commentCountSelector }}{% endif %}"
  );
  for (const element of elements) {
    element.innerText = '{{ commentCountText }}';
  }
})();
