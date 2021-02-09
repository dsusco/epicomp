jQuery.extend(jQuery.expr.pseudos, {
  focusable: function (el) {
    var
      $el = $(el),
      fieldset,
      hasTabindex = el.tabIndex !== undefined && +el.tabIndex > -1,
      map,
      mapName,
      nodeName = el.nodeName.toLowerCase(),
      returnValue = false;

    function parentsVisible ($el) {
      var visibility = $el.css('visibility');

      while (visibility === 'inherit') {
        $el = $el.parent();

        visibility = $el.css('visibility');
      }

      return visibility !== 'hidden';
    }

    if ('a' === nodeName ) {
      returnValue = hasTabindex && el.href !== undefined && el.href !== '';
    } else if ('area' === nodeName) {
      map = el.parentNode;
      mapName = map.name;

      if (el.href && mapName && map.nodeName.toLowerCase() === 'map') {
        returnValue = $("img[usemap='#" + mapName + "']").length > 0;
      }
    } else if (/^(button|input|object|select|textarea)$/.test(nodeName)) {
      returnValue = !el.disabled;

      if (returnValue) {
        fieldset = $el.closest('fieldset')[0];

        if (fieldset && !$el.closest('legend')[0]) {
          returnValue = !fieldset.disabled;
        }
      }
    } else {
      returnValue = hasTabindex;
    }

    return returnValue && $el.is(':visible') && parentsVisible($el);
	}
});
