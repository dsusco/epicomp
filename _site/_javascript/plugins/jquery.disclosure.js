jQuery.fn.extend({
  disclosure: function (disclosureOptions) {
    return this.each(function () {
      var
        $disclosure = $(this),
        options = $.extend({
          resetOnResize: true
        }, $disclosure.data(), disclosureOptions),
        $control;

      try {
        $control = $(options.control);
      } catch (e) {
        if (options.control.charAt(0) === '#') {
          $control = $(document.getElementById(options.control.substr(1)));
        }
      }

      function hide (event) {
        if (!$disclosure.hasClass('hiding')) {
          $disclosure
            .addClass('hiding')
            .trigger('disclosure:hiding', event);

          $control.addClass('disclosure-hiding');

          if (options.hidingAnimation !== undefined) {
            $disclosure
              .animateCss(options.hidingAnimation)
              .one('animationend', function () {
                finishHiding(event);
              });
          } else {
            finishHiding(event);
          }
        }
      }

      function finishHiding (event) {
        $disclosure
          .removeClass('shown')
          .addClass('hidden')
          .prop('hidden', true);

        $control
          .attr('aria-expanded', false)
          .removeClass('disclosure-hiding');

        $disclosure
          .removeClass('hiding')
          .trigger('disclosure:hidden', event);
      }

      function show (event) {
        if (!$disclosure.hasClass('showing')) {
          $disclosure
            .addClass('showing')
            .trigger('disclosure:showing', event);

          $control.addClass('disclosure-showing');

          $disclosure
            .removeClass('hidden')
            .addClass('shown')
            .prop('hidden', false);

          $control.attr('aria-expanded', true);

          if (options.showingAnimation !== undefined) {
            $disclosure
              .animateCss(options.showingAnimation)
              .one('animationend', function () {
                finishShowing(event);
              });
          } else {
            finishShowing(event);
          }
        }
      }

      function finishShowing (event) {
        $control.removeClass('disclosure-showing');

        $disclosure
          .removeClass('showing')
          .trigger('disclosure:showed', event);
      }

      function resetOnResize () {
        $disclosure
          .removeClass('hidden shown')
          .prop('hidden', $disclosure.data('hidden'));
        $control.attr('aria-expanded', $disclosure.is(':visible'));
      }

      if (!$disclosure.hasEventHandler('disclosure:hide.baseline', hide)) {
        $disclosure.on('disclosure:hide.baseline', hide);
      }
      if (!$disclosure.hasEventHandler('disclosure:show.baseline', show)) {
        $disclosure.on('disclosure:show.baseline', show);
      }

      $disclosure
        .id('disclosure') // for aria-controls
        .addClass('disclosure') // for media queries
        .data('hidden', $disclosure.prop('hidden')); // for reset on resize

      $control
        .attr('aria-controls', (($control.attr('aria-controls') || '') + ' ' + $disclosure.attr('id')).trim())
        .attr('aria-expanded', $disclosure.is(':visible'))
        .on('click', function (event) { // toggle on control click
          $disclosure.is(':visible') ? hide(event) : show(event);

          // don't follow links
          event.preventDefault();
        })
        .not('button, [type="button"], [type="image"], [type="reset"], [type="submit"]')
          .each(function () { // add tabindex to un-tabindexy controls
            if (this.getAttribute('tabindex') === null) {
              this.setAttribute('tabindex', 0);
            }
          })
          .on('keypress', function (event) { // toggle on Enter for those controls
            if (event.key === 'Enter') {
              $disclosure.is(':visible') ? hide(event) : show(event);
            }
          });

      if (options.resetOnResize && !$(window).hasEventHandler('resize', resetOnResize)) {
        $(window).on('resize', resetOnResize);
      }
    });
  }
});
