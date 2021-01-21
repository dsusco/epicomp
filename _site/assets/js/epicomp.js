---
---
//= import baseline

$(function () {
  var
    $modal = $('#modal'),
    images = [],
    modalBodyTemplate = _.template($($modal.data('modal_body_template')).text().trim());

  $.getJSON('/epicomp/assets/json/images.json', function (data) {
    images = data;

    images = images.reduce(function (images, image) {
      images[image.public_id] = image;

      return images;
    }, {})

    delete images.sample;
  });

  // gallery and year image card
  $('a[data-img-template]').each(function () {
    var
      $a = $(this),
      options = Object.assign({
        delay: Math.floor(Math.random() * 6) * 1000 + 5000, // replace every 5 to 10 seconds
        entranceAnimation: 'animate__delay-1s animate__slow animate__fadeIn',
        entranceCss: { opacity: '' },
        exitAnimation: 'animate__delay-1s animate__slow animate__fadeOut',
        exitCss: { opacity: 0 },
        exitTimeout: 2500, // slightly longer that animate__slow
        imgTemplate: ''
      }, $a.data()),
      imgTemplate = _.template($(options.imgTemplate).text().trim()),
      tags = _.compact([this.getAttribute('data-year'), this.getAttribute('data-category')]),
      transformation = $a.find('img').data('transformation');

    setInterval(function () {
      var
        $exitingImg = $a.find('img'),
        image = _.sample(_.filter(Object.values(images), function (image) { // choose a different random image from the same year/category
          return $exitingImg.data('public_id') !== image.public_id && _.difference(tags, image.tags).length === 0 ;
        })),
        $img = $(imgTemplate(Object.assign({ transformation: transformation }, options, { image: image })));

      if (!$a.is(':focus') && !$a.is(':hover')) {
        $exitingImg
          .animateCss(options.exitAnimation)
          .after(
            $img
              .css(options.exitCss)
              .animateCss(options.entranceAnimation)
              .each(function () {
                // animationend event buggy when window was minimized, using this instead
                setTimeout(function () {
                  $img
                    .css(options.entranceCss)
                    .prevUntil()
                      .remove();
                }, options.exitTimeout);
              })
          );
        }
    }, options.delay);
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
