UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image'),
    sticker: jQuery('#sticker'),
    player: jQuery('#player')
  };

  that.view.image.utImage({
    size: {
      width: that.view.desc.width(),
      flexRatio: true,
      autoCrop: true
    },
    flexRatio: true,
    autoCrop: false,
    autoSave: true
  }).on('utImage:loaded', function(event, image) {
    that.adaptHeight(that.view.image.height())
    post.valid(true);
  }).on('utImage:removed',function() {
    post.valid(false);
  }).on('utImage:resize', function(event, image) {
    that.adaptHeight();
  });

  that.view.sticker.utSticker({
    top: 100,
    left: that.view.desc.width() / 3 | 0,
    width: that.view.desc.width() / 3 | 0,
    height: that.view.desc.width() / 3 | 0,
    autoSave: true,
    ui:{
     remove:false
    }
  });

  that.view.player.utAudio({
    data:"https://soundcloud.com/londongrammar/london-grammar-wasting-my",
    skin:'myskin',
    ui:{
      title:false,
      progress:false,
      source: false,
      time: false
    },
    editable: false
  });

  that.adaptHeight = function(){
    post.size({
      height: that.view.image.height()
    });
  };
});
