UT.Expression.ready(function(post) {
  "use strict";
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image')
  };

  that.data = post.storage;

  post.on('resize',function(){
    that.view.desc.show();
    that.view.image.utImage();
  });

  post.size({'height': that.view.desc.width() / 0.7529});
});
