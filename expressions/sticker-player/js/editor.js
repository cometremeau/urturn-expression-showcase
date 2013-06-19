UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc: jQuery("#desc"),
    image: jQuery('#image'),
    sticker: jQuery('#sticker'),
    player: jQuery('#player'),
    list: jQuery('#list'),
    listbutton: jQuery('#listbutton')
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
  })
  .on('utImage:change', function(event, newValues){
    var hasImage = !!newValues.data;
    if(hasImage) {
      that.adaptHeight(that.view.image.height());
      post.valid(true);
      that.view.sticker.utSticker('show');
      that.view.sticker.utSticker('save');
      that.createAudioSticker();
    } else {
      post.valid(false);
      that.view.sticker.utSticker('hide');
    }
  })
  .on('utImage:resize', function(event, image) {
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

  that.view.list.find('li').on('click', function(){
    var url = $(this).data('value');
    post.storage.audioUrl = url;
    post.save();
    that.createAudioSticker();
    that.view.list.addClass('hidden_list');
    that.view.listbutton.show();
  });

  that.view.listbutton.on('click', function(){
    that.view.list.removeClass('hidden_list');
    that.view.listbutton.hide();
  });

  that.createAudioSticker = function(){
    console.log('create sticker',post.storage.audioUrl)
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

  that.adaptHeight = function(){
    post.size({
      height: that.view.image.height()
    });
  };
});
