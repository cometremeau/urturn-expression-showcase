UT.Expression.ready(function(post) {
  function resize() {
    post.size($('.frame').height());
  }

  function init() {
    $('.frame-content')
      .utImage()
      .on('utImage:change', function(event, newValues, oldValues) {
        resize();
        post.valid(!!newValues) // valid if there is a value;
        $('.sticker')
          .utSticker({
            id: 'sticker',
              ui: {
                remove: false,
              },
              pos: {
                width: 50,
                height: 50
              }
            })
          .show();
      });
    resize();
  }

  init()
});
