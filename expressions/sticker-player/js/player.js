UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image'),
    sticker: jQuery('#sticker'),
    player: jQuery('#player')
  };

  that.view.image.utImage().on('utImage:change', function(event, image) {
    that.setHeight(that.view.image.height());
  });

  that.createAudioSticker = function(){
    that.view.player.empty().utAudio({
      data:post.storage.audioUrl,
      skin:'myskin',
      ui:{
        title:false,
        progress:false,
        source: false,
        time: false
      },
      editable: false
    });
  };

  that.setHeight = function(height){
    post.size({
      height: height
    },function(){
      that.view.sticker.utSticker();
    });
  };

  that.createAudioSticker();
});
