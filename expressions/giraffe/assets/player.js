UT.Expression.ready(function(post) {
  "use strict";

  $(post.node).css("font-size", "10px");

  var $background = $('.post-background');

  var drawSticker = function(data){
    $('<img class="sticker-giraffe" src="assets/images/giraffe_'+data.name+'.png"/>')
      .appendTo(post.node)
      .utSticker({ id: data.stickerId });
  };

  $background.utImage()
    .on('utImage:change', function(){
      post.size($(this).height(), function(){
        $.each(post.storage.stickers, function() {
          drawSticker(this);
        });
      });
    });
});
