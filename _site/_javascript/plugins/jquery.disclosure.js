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

      $disclosure
        .id('disclosure') // for aria-controls
        .addClass('disclosure')
        .data('hidden', $disclosure.prop('hidden')) // for reset on resize
        .on('disclosure:show.baseline', show)
        .on('disclosure:hide.baseline', hide);

      $control
        .attr('aria-controls', (($control.attr('aria-controls') || '') + ' ' + $disclosure.attr('id')).trim())
        .attr('aria-expanded', $disclosure.is(':visible'))
        .on('click', function (event) { // show/hide on click
          $disclosure.is(':visible') ? hide(event) : show(event);
        });

      if (options.resetOnResize) { // reset on resize
        $(window).on('resize', function () {
          $disclosure
            .removeClass('hidden shown')
            .prop('hidden', $disclosure.data('hidden'));
          $control.attr('aria-expanded', $disclosure.is(':visible'));
        });
      }
    });
  }
});
