$(function () {
  var images = [];

  $.getJSON('/epicomp/assets/json/images.json', function (data) {
    images = data;
    images.pop(); // remove sample.jpg
  });

  // replace images with another from the same year or year/category
  $('a[data-img_template]').each(function () {
    var
      $a = $(this),
      img_template = _.template($($a.data('img_template')).text().trim()),
      tags = _.compact([this.getAttribute('data-year'), this.getAttribute('data-category')]),
      transformation = $a.find('img').data('transformation');

    setInterval(function () {
      var
        image = _.sample(_.filter(images, function (image) { // choose a different random image from the same year/category
          return $a.find('img').data('public_id') !== image.public_id && _.difference(tags, image.tags).length === 0 ;
        })),
        $img = $(img_template(_.assign({ transformation: transformation }, $a.data(), { image: image })));

      if (!$a.is(':focus') && !$a.is(':hover')) {
        $a.find('img')
          .addClass('animate__animated animate__slow animate__fadeOut')
          .each(function () {
            var img = this;

            // animationend event buggy when window was minimized, using this instead
            setTimeout(function () {
              img.remove();
            }, 2000); // change timeout to match animateCSS animate__* speed
          })
          .after(
            $img
              .css('opacity', 0) // so fadeIn works correctly
              .addClass('animate__animated animate__slow animate__fadeIn')
          );
        }
    }, Math.floor(Math.random() * 6) * 1000 + 5000); // replace every 5 to 10 seconds
  });
});
