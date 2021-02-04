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

  // nav disclosure
  $('#nav > ul')
    .disclosure({
      control: '#nav > button'
    });

  // slideshow
  $('[data-slideshow-template]').each(function () {
    var
      slideshow = this,
      $slideshow = $(slideshow),
      options = Object.assign({
        delay: Math.floor(Math.random() * 5) * 1000 + 4000, // replace every 4 to 8 seconds
        entranceAnimation: 'animate__delay-1s animate__slow animate__fadeIn',
        exitAnimation: 'animate__delay-1s animate__slow animate__fadeOut',
        exitTimeout: 2700, // slightly longer that animate__slow
        tags: 'year, category',
        target: '> :first-child',
        transformation: null
      }, $slideshow.data()),
      template = _.template($(options.slideshowTemplate).text().trim()),
      tags = options.tags.split(',').reduce(function (tags, tag) {
        tag = slideshow.getAttribute('data-' + tag.trim());

        if (tag !== null) {
          tags.push(tag);
        }

        return tags;
      }, []);

    if (options.transformation === null) {
      options.transformation = $slideshow.find('[data-transformation]').data('transformation');
    }

    setInterval(function () {
      var
        $exitingSlide = $(options.target, $slideshow),
        image = _.sample(_.filter(Object.values(images), function (image) { // choose a different random image from the same year/category
          return $exitingSlide.find('[data-public_id]').data('public_id') !== image.public_id && _.difference(tags, image.tags).length === 0 ;
        })),
        $enteringSlide = $(template(Object.assign({ image: image }, options)));

      if (!$exitingSlide.is(':focus') && !$exitingSlide.is(':hover')) {
        $exitingSlide
          .attr('tabindex', -1)
          .animateCss(options.exitAnimation)
          .after(
            $enteringSlide
              .animateCss(options.entranceAnimation)
              .each(function () {
                // animationend event buggy when window was minimized, using this instead
                setTimeout(function () {
                  $enteringSlide
                    .prevUntil($exitingSlide)
                    .add($exitingSlide)
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
      control: '#category_gallery > a',
      closingAnimation: 'animate__fadeOut',
      openingAnimation: 'animate__fadeIn'
    })
    .on('modal:opening', function (event, openEvent) {
      var
        $a = $(openEvent.delegateTarget),
        $enteringBody = $(modalBodyTemplate({ image: images[$a.find('img').data('public_id')] })),
        $exitingBody = $modal.find('.modal-body'),
        $prev = $a.prev(),
        $next = $a.next();

      if ($prev.length < 1) {
        $prev = $a.siblings().last();
      }

      if ($next.length < 1) {
        $next = $a.siblings().first();
      }

      $enteringBody
        .one('click', '.previous', function () {
          $modal.data('last-focus', $prev[0]);
          $modal.trigger('modal:opening', { delegateTarget: $prev[0], enteringBody: true });
        })
        .one('click', '.next', function () {
          $modal.data('last-focus', $next[0]);
          $modal.trigger('modal:opening', { delegateTarget: $next[0], enteringBody: true });
        })
        .animateCss('animate__fadeIn');

      $exitingBody
        .after($enteringBody)
        .each(function () {
          if (openEvent.enteringBody) {
            $exitingBody
              .animateCss('animate__fadeOut')
              .one('animationend', function () {
                $enteringBody
                  .prevUntil($exitingBody)
                  .add($exitingBody)
                    .remove();
              });
          } else {
            $exitingBody.remove();
          }
        });
    });
});
