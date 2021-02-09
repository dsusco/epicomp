jQuery.extend(jQuery.expr.pseudos, {
  'all-focusable': function (el) {
    var
      hasTabindex = el.tabIndex !== undefined && +el.tabIndex > -1,
      map,
      mapName,
      nodeName = el.nodeName.toLowerCase(),
      returnValue = false;

    if ('a' === nodeName ) {
      returnValue = hasTabindex && el.href !== undefined && el.href !== '';
    } else if ('area' === nodeName) {
      map = el.parentNode;
      mapName = map.name;

      if (el.href && mapName && map.nodeName.toLowerCase() === 'map') {
        returnValue = $("img[usemap='#" + mapName + "']").length > 0;
      }
    } else if (/^(button|input|object|select|textarea)$/.test(nodeName)) {
      returnValue = true;
    } else {
      returnValue = hasTabindex;
    }

    return returnValue;
	}
});
