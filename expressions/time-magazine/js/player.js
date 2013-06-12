UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image'),
    cover: jQuery('#cover')
  };

  that.data = post.storage;

  post.on('resize',function(){
    console.log(that.data.image)
    that.view.image[0].src = that.data.image.url;
    that.view.desc.show();
  })

  post.size({'height': that.view.desc.width() / 0.7529});
});
