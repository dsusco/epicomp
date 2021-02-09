jQuery.fn.extend({
  menu: function (menuOptions) {
    return this.each(function () {
      var
        $menu = $(this),
        $menuItems = $menu.find(':all-focusable'),
        options = $.extend({
          resetOnResize: true
        }, $menu.data(), menuOptions),
        $control;

      try {
        $control = $(options.control);
      } catch (e) {
        if (options.control.charAt(0) === '#') {
          $control = $(document.getElementById(options.control.substr(1)));
        }
      }

      function close (event) {
        if (!$menu.hasClass('closing')) {
          $menu
            .addClass('closing')
            .trigger('menu:closing', event);

          $control.addClass('menu-closing');

          if (options.closingAnimation !== undefined) {
            $menu
              .animateCss(options.closingAnimation)
              .one('animationend', function () {
                finishClosing(event);
              });
          } else {
            finishClosing(event);
          }
        }
      }

      function finishClosing (event) {
        $menu
          .removeClass('opened')
          .addClass('closed')
          .prop('hidden', true);

        $control
          .attr('aria-expanded', false)
          .removeClass('menu-closing');

        $menu
          .removeClass('closing')
          .trigger('menu:closed', event);
      }

      function open (event) {
        if (!$menu.hasClass('opening')) {
          $menu
            .addClass('opening')
            .trigger('menu:opening', event);

          $control.addClass('menu-opening');

          $menu
            .removeClass('closed')
            .addClass('opened')
            .prop('hidden', false);

          $control.attr('aria-expanded', true);

          if (event.key === 'ArrowUp') {
            $menuItems[$menuItems.length - 1].focus();
          } else {
            $menuItems[0].focus();
          }

          if (options.openingAnimation !== undefined) {
            $menu
              .animateCss(options.openingAnimation)
              .one('animationend', function () {
                finishOpening(event);
              });
          } else {
            finishOpening(event);
          }
        }
      }

      function finishOpening (event) {
        $control.removeClass('menu-opening');

        $menu
          .removeClass('opening')
          .trigger('menu:opened', event);
      }

      $menuItems
        .attr('role', 'menuitem')
        .attr('tabindex', -1);

      $menu
        .id('menu') // for aria-controls
        .addClass('menu')
        .attr('role', 'menu')
        .data('hidden', $menu.prop('hidden')) // for reset on resize
        .on('menu:open.baseline', open)
        .on('menu:close.baseline', close)
        .on('keydown', function (event) { // move menu item focus or close on Tab
          var
            index = $menuItems.index($menuItems.filter(':focus')),
            key = event.key;

          if (key === 'ArrowUp' && index - 1 < 0) {
            key = 'End';
          } else if (key === 'ArrowDown' && index + 1 >= $menuItems.length) {
            key = 'Home';
          }

          switch (key) {
            case 'ArrowDown':
              $menuItems[index + 1].focus();
              event.preventDefault();
              break;
            case 'ArrowUp':
              $menuItems[index - 1].focus();
              event.preventDefault();
              break;
            case 'Home':
              $menuItems[0].focus();
              event.preventDefault();
              break;
            case 'End':
              $menuItems[$menuItems.length - 1].focus();
              event.preventDefault();
              break;
            case 'Tab':
              close(event);
          }
        });

      $control
        .attr('aria-controls', (($control.attr('aria-controls') || '') + ' ' + $menu.attr('id')).trim())
        .attr('aria-haspopup', true)
        .attr('aria-expanded', $menu.is(':visible'))
        .on('click', function (event) { // open/close on click
          $menu.is(':visible') ? close(event) : open(event);
        })
        .on('keydown', function (event) { // open on down arrow
          if ($menu.is(':hidden') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            open(event);

            // don't scroll down
            event.preventDefault();
          }
        });

      if (options.resetOnResize) {
        $(window).on('resize', function () { // reset on resize
          $menu
            .removeClass('closed opened')
            .prop('hidden', $menu.data('hidden'));
          $control.attr('aria-expanded', $menu.is(':visible'));
        });
      }

      $(document)
        .on('click', function (event) { // close on non-menu click
          var $target = $(event.target);

          if ($menu.is(':visible') && !$target.is($control) && $target.closest($menu).length < 1) {
            close(event);
          }
        })
        .on('keydown', function (event) { // close on Esc
          if (event.key === 'Escape' && $menu.is(':visible')) {
            close(event);

            $control[0].focus();
          }
        });
    });
  }
});
