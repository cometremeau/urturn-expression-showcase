UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image'),
    sticker: jQuery('#sticker'),
    player: jQuery('#player')
  };

  that.view.image.utImage().on('utImage:loaded', function(event, image) {
    that.setHeight(that.view.image.height());
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

  that.setHeight = function(height){
    post.size({
      height: height
    },function(){
      that.view.sticker.utSticker();
    });
  };
});
