UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc:       jQuery("#desc"),
    image:      jQuery('#image'),
    utimage:    jQuery('#utimage'),
    sticker:    jQuery('#sticker'),
    player:     jQuery('#player'),
    list:       jQuery('#list'),
    listbutton: jQuery('#listbutton')
  };

  that.adaptPlayButton = function(){
    that.view.sticker.css('fontSize',that.view.sticker.height()+'px');
    that.view.sticker.css('lineHeight',that.view.sticker.height()+6+'px');
  };

  that.onImageSizeChangedOutside = function(size) {
    var height = size.height || that.view.desc.height();
    var width = size.width || that.view.desc.width();
    var dwidth = Math.floor(width*(that.view.desc.height()/height));
    var dheight = Math.floor(height*(that.view.desc.width()/width));

    if(dheight <= that.view.desc.height()){
      that.view.image.css({
        height:dheight+'px',
        marginTop:-dheight/2+'px',
        top:'50%',
        left: "", width: "", marginLeft:""
      });
    } else {
      that.view.image.css({
        width:dwidth+'px',
        marginLeft:-dwidth/2+'px',
        left:'50%',
        top: "", height: "", marginTop:""
      });
    }
  };

  that.view.utimage.utImage({
    width: 576,
    flexRatio: true,
    autoCrop: true
  })
  .on('utImage:change', function(event, newValues){
    var hasImage = !!newValues.data;
    if(hasImage) {
      post.valid(true);
      that.view.sticker.utSticker('save');
      if(post.storage.audioUrl){
        that.view.sticker.utSticker('show');
        that.hideList();
      } else {
        that.showList();
      }
    } else {
      post.valid(false);
      that.view.sticker.utSticker('hide');
    }
  })
  .on('utImage:resize', function(event, image) {
    that.onImageSizeChangedOutside(image);
  })
  .on('utImage:ready', function(event, image) {
    that.view.utimage.utImage('dialog');
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
  }).on('utSticker:change', function(e,v){
    if(v.height){
      that.adaptPlayButton();
    }
  });

  that.adaptPlayButton();
  that.view.sticker.utSticker('hide');

  that.showList = function(){
    that.view.list.removeClass('hidden_list');
    that.view.listbutton.hide();
  };

  that.hideList = function(){
    that.view.list.addClass('hidden_list');
    that.view.listbutton.show();
  };

  that.view.list.find('li').on('click', function(){
    var url = $(this).data('value');
    post.storage.audioUrl = url;
    post.save();
    that.hideList();
    that.view.sticker.utSticker('show');
  });

  that.view.listbutton.on('click', that.showList);

});
