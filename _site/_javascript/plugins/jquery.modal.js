jQuery.fn.extend({
  modal: function (modalOptions) {
    return this.each(function () {
      var
        $modal = $(this),
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
            this.setAttribute('tabindex', eval(this.getAttribute('data-tabindex')));
            this.setAttribute('data-tabindex', null);
          });

        $parent.removeClass('modal-overlay');

        $modal.data('last-focus').focus();

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
              this.setAttribute('data-tabindex', this.getAttribute('tabindex'));
              this.setAttribute('tabindex', -1);
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
        $modal.find(':focusable')[0].focus();

        $control.removeClass('modal-opening');

        $modal
          .removeClass('opening')
          .trigger('modal:opened', event);
      }

      $modal
        .addClass('modal')
        .attr('aria-modal', true)
        .on('modal:open.baseline', open)
        .on('modal:close.baseline', close)
        .appendTo($parent) // move to the end of parent;

      $control.on('click', function (event) { // open/close on click
        $modal.is(':visible') ? close(event) : open(event);

        // don't follow links
        event.preventDefault();
      });

      $(document)
        .on('click', function (event) { // close on non-modal click
          var $target = $(event.target);

          // close on .close or overlay click
          if ($modal.is(':visible') && ($target.closest('.close').length > 0 || $target.is($parent))) {
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
