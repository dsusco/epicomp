jQuery.fn.extend({
  id: function (prepend) {
    prepend || (prepend = 'baseline');

    return this.each(function () {
      if (typeof this.id !== 'string' || this.id === '') {
        this.id = _.uniqueId('' + prepend + '_');
      }
    });
  }
});
