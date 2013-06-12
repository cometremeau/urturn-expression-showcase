UT.Expression.ready(function(post) {
  "use strict";
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image')
  };

  that.data = post.storage;

  post.on('resize',function(){
    that.view.image.utImage();
    that.view.desc.show();
  });

  post.size({'height': that.view.desc.width() / 0.7529});
});
