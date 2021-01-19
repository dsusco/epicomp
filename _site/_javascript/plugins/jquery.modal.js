jQuery.fn.extend({
  modal: function (modalOptions = {}) {
    return this.each(function () {
      var
        $modal = $(this).attr('aria-modal', true),
        options = $.extend({
          parent: 'body > div:first-of-type'
        }, $modal.data(), modalOptions),
        $control,
        $parent;

      try {
        $control = $(options.control);
      } catch (e) {
        if (options.control.charAt(0) === '#') {
          $control = $(document.getElementById(options.control.substr(1)));
        }
      }

      try {
        $parent = $(options.parent);
      } catch (e) {
        if (options.parent.charAt(0) === '#') {
          $parent = $(document.getElementById(options.parent.substr(1)));
        }
      }

      if ($parent.length < 1) {
        $parent = $('body');
      }

      function close (event) {
        if (!$modal.hasClass('closing')) {
          $modal
            .addClass('closing')
            .trigger('modal:closing', event);

          $control.addClass('modal-closing');

          if (options.closingAnimation !== undefined) {
            $modal
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
        $modal.prop('hidden', true);

        // allow focus again on non-modal elements
        $('[data-tabindex]')
          .each(function () {
            var $el = $(this);

            $el
              .attr('tabindex', eval($el.attr('data-tabindex')))
              .attr('data-tabindex', null);
          });

        $parent.removeClass('modal-overlay');

        $($modal.data('last-focus')).focus();

        $control.removeClass('modal-closing');

        $modal
          .removeClass('closing')
          .trigger('modal:closed', event);
      }

      function open (event) {
        if (!$modal.hasClass('opening')) {
          $modal
            .addClass('opening')
            .trigger('modal:opening', event);

          $control.addClass('modal-opening');

          $modal.data('last-focus', document.activeElement);

          $parent.addClass('modal-overlay');

          // remove focus on non-modal elements
          $(':all-focusable')
            .not($(':all-focusable', $modal))
            .not('[tabindex^=-]')
            .each(function () {
              var $el = $(this);

              $el
                .attr('data-tabindex', $el.attr('tabindex') || 'null')
                .attr('tabindex', '-1');
            });

          $modal.prop('hidden', false);

          if (options.openingAnimation !== undefined) {
            $modal
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
        $modal.find(':focusable').first().focus();

        $control.removeClass('modal-opening');

        $modal
          .removeClass('opening')
          .trigger('modal:opened', event);
      }

      if (!$modal.hasEventHandler('modal:close.baseline', close)) {
        $modal.on('modal:close.baseline', close);
      }
      if (!$modal.hasEventHandler('modal:open.baseline', open)) {
        $modal.on('modal:open.baseline', open);
      }

      $modal
        .addClass('modal') // for styles
        .appendTo($parent); // move to the end of parent

      $control
        .on('click', function (event) { // toggle on control click
          $modal.is(':visible') ? close(event) : open(event);

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
              $modal.is(':visible') ? close(event) : open(event);
            }
          });

      $(document)
        .on('click', function (event) { // close on .close or overlay click
          var $target = $(event.target);

          if (($target.closest('.close').length > 0 || $(event.target).is($parent)) && $modal.is(':visible')) {
            close(event);

            // don't follow links
            event.preventDefault();
          }
        })
        .on('keydown', function (event) { // close on Esc
          if (event.key === 'Escape' && $modal.is(':visible')) {
            close(event);
          }
        });
    });
  }
});
