$(function () {
  var
    $modal = $('#modal'),
    modalBodyTemplate = _.template($($modal.data('modal_body_template')).text().trim()),
    images = [];

  $.getJSON('/epicomp/assets/json/images.json', function (data) {
    images = data;

    images = images.reduce(function (images, image) {
      images[image.public_id] = image;

      return images;
    }, {})

    delete images.sample;
  });

  // gallery and year image card
  $('a[data-img_template]').each(function () {
    var
      $a = $(this),
      img_template = _.template($($a.data('img_template')).text().trim()),
      tags = _.compact([this.getAttribute('data-year'), this.getAttribute('data-category')]),
      transformation = $a.find('img').data('transformation');

    setInterval(function () {
      var
        image = _.sample(_.filter(Object.values(images), function (image) { // choose a different random image from the same year/category
          return $a.find('img').data('public_id') !== image.public_id && _.difference(tags, image.tags).length === 0 ;
        })),
        $img = $(img_template(_.assign({ transformation: transformation }, $a.data(), { image: image })));

      if (!$a.is(':focus') && !$a.is(':hover')) {
        $a.find('img')
          .animateCss('animate__slow animate__fadeOut')
          .after(
            $img
              .css('opacity', 0) // so fadeIn works correctly
              .animateCss('animate__slow animate__fadeIn')
              .each(function () {
                // animationend event buggy when window was minimized, using this instead
                setTimeout(function () {
                  $img
                    .css('opacity', '')
                    .prevUntil()
                      .remove();
                }, 2000); // change timeout to match animateCSS animate__* speed
              })
          );
        }
    }, Math.floor(Math.random() * 6) * 1000 + 5000); // replace every 5 to 10 seconds
  });

  // category modal
  $modal
    .modal({
      control: '.category-linked-figure',
      closingAnimation: 'animate__fadeOut',
      openingAnimation: 'animate__fadeIn'
    })
    .on('modal:opening', function (event, openEvent) {
      var
        $a = $(openEvent.delegateTarget),
        $prev = $a.prev(),
        $next = $a.next(),
        $modalBody = $(modalBodyTemplate({ image: images[$a.find('img').data('public_id')] }));

      if ($prev.length < 1) {
        $prev = $a.siblings().last();
      }

      if ($next.length < 1) {
        $next = $a.siblings().first();
      }

      $modal.find('.modal-body')
        .each(function () {
          if (openEvent.previous) {
            $(this).animateCss('animate__fadeOutRight');
          } else if (openEvent.next) {
            $(this).animateCss('animate__fadeOutLeft');
          }
        })
        .after(
          $modalBody
            .one('click', '.previous', function () {
              $modal.data('last-focus', $prev[0]);
              $modal.trigger('modal:opening', { delegateTarget: $prev[0], previous: true });
            })
            .one('click', '.next', function () {
              $modal.data('last-focus', $next[0]);
              $modal.trigger('modal:opening', { delegateTarget: $next[0],  next: true });
            })
            .each(function () {
              if (openEvent.previous || openEvent.next) {
                if (openEvent.previous) {
                  $modalBody.animateCss('animate__fadeInLeft');
                } else {
                  $modalBody.animateCss('animate__fadeInRight');
                }

                setTimeout(function () {
                  $modalBody
                    .prevUntil('.modal-header')
                      .remove();
                }, 1000); // change timeout to match animateCSS animate__* speed
              }
            })
        );
    });
});
