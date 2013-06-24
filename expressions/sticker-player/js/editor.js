UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc:       jQuery("#desc"),
    image:      jQuery('#image'),
    utimage:    jQuery('#utimage'),
    player:     jQuery('#player'),
    list:       jQuery('#list'),
    listbutton: jQuery('#listbutton'),
    stickerArea:jQuery('#stickerArea')
  };

  that.data = {
    stickerData: post.storage.stickerData,
    imagePresent: false
  };

  that.adaptPlayButton = function() {
    var hh = $("#sticker").height();
    if(hh > 0) {
      $("#sticker").css('fontSize', hh + 'px');
      $("#sticker").css('lineHeight', (hh+6) + 'px');
    }
  };

  that.onImageSizeChangedOutside = function(size) {
    console.log("onImageSizeChangedOutside", size.width, size.height);
    var height = size.height || that.view.desc.height();
    var width = size.width || that.view.desc.width();
    var dwidth = Math.floor(width*(that.view.desc.height()/height));
    var dheight = Math.floor(height*(that.view.desc.width()/width));

    if(dheight <= that.view.desc.height()){
      that.view.image.css({
        height: dheight+'px',
        marginTop: -Math.round(dheight/2)+'px',
        top: '50%',
        left: "", width: "", marginLeft:""
      });
    } else {
      that.view.image.css({
        width: dwidth+'px',
        marginLeft: -Math.round(dwidth/2)+'px',
        left: '50%',
        top: "", height: "", marginTop:""
      });
    }
    that.view.stickerArea.utStickersBoard("update", {
      movableArea: {left:0, top:0, width:1, height:1 - 40/that.view.image.height() }
    });
    setTimeout(function(){
      that.adaptPlayButton();
    }, 0);
  };

  that.view.utimage.utImage({
    width: 576,
    flexRatio: true,
    autoCrop: true
  });
  that.view.utimage.on('utImage:change', function(event, newValues){
    var hasImage = !!newValues.data;
    if(hasImage) {
      that.data.imagePresent = true;
      that.view.listbutton.show();
      if(post.storage.audioUrl) {
        post.valid(true);
        that.hideList();
      } else {
        that.showList();
      }
    } else {
      that.data.imagePresent = false;
      that.view.stickerArea.hide();
      that.view.listbutton.hide();
      post.valid(false);
    }
  });
  that.view.utimage.on('utImage:resize', function(event, image) {
    that.onImageSizeChangedOutside(image);
  });
  that.view.utimage.on('utImage:ready', function(event, image) {
    that.view.utimage.utImage('dialog');
  });

//  that.view.sticker.utSticker({
//    top: 100,
//    left: 100, //Math.round(that.view.desc.width() / 3),
//    width: 100, //Math.round(that.view.desc.width() / 3),
//    height: 100, //Math.round(that.view.desc.width() / 3),
//    autoSave: true,
//    ui:{
//     remove:false
//    }
//  });
//  that.view.sticker.on('utSticker:change', function(e,v){
//    if(v.height){
//      that.adaptPlayButton();
//    }
//  });

  that.adaptPlayButton();
//  that.view.sticker.utSticker('hide');

  that.showList = function(){
    post.valid(false);
    that.view.list.removeClass('hidden_list');
    that.view.listbutton.hide();
    that.view.stickerArea.hide();
  };

  that.hideList = function(e){
    that.view.list.addClass('hidden_list');
    that.view.listbutton.show();
    if(e) {
      e.stopPropagation();
    }

    if(that.data.imagePresent && post.storage.audioUrl) {
      that.view.stickerArea.show();
      that.adaptPlayButton();
      post.valid(true);
    }
  };

  that.view.stickerArea.utStickersBoard({
    post: post,
    items: [{
      object: '<div id="sticker" class="ut-audio-skin-bottom-over ut-audio-state-launch"><div class="ut-audio-ui-play"><span class="icon_spinner ut-audio-ui-seek-icon"></span><span class="icon_play ut-audio-ui-play-icon"></span><span class="icon_pause ut-audio-ui-pause-icon"></span></div></div>',
      key: "sticker",
      originalWidth: 0.3,
      originalHeight: 0.3 * that.view.image.width()/that.view.image.height()
    }],
//    classResize: "resize icon_fullscreen",
    parameters: that.data.stickerData,
    rotateable: true,
    scaleable: true,
    movableArea: {left:0, top:0, width:1, height:1 - 40/that.view.image.height() },
    deleteButton: false,
    design: 7,
    flipContent: false,
    minSize: { width: 0.01, height: 0.01 },
    maxSize: { width: 1, height: 1 },
//    zIndexByClick: true,
//    onRemove: function(key, data) {
//      that.parameters.itemsdata = data;
//      that.removeItemById(key);
//      that.saveParametersData();
//      that.checkValidContent();
//      if(that.parameters.items.length <= 0) {
//        that.currentSelectedKey = "";
//      } else {
//        that.image.utStickersBoard("selectItem", that.parameters.items[that.parameters.items.length-1].id);
//      }
//    },
    onChanging: function() {
      that.adaptPlayButton();
//      jQuery(this).find(".scPlayerContainer").utCirclePlayer("updatePlayerSize");
    },
    onChanged: function(data) {
      that.data.stickerData = data;
      post.storage.stickerData = that.data.stickerData;
      post.save();
      that.adaptPlayButton();
//      that.saveParametersData();
    }
//    onSelected: function(key) {
//      that.currentSelectedKey = key;
//    },
//    onFocus: function() {
//      that.image.utImagePanel("killFocus");
//    },
//    onBlur: function(){
//      that.currentSelectedKey = "";
//    }
  });
  that.view.stickerArea.utStickersBoard("edit");

  that.view.list.find('li').on('click', function(){
    var url = $(this).data('value');
    post.storage.audioUrl = url;
    post.save();
    that.hideList();
    that.view.listbutton.html("Change song");
  });

  $("#list .close").on("click", that.hideList);
  $("#list ul").thinScrollBar({});
  that.view.listbutton.on('click', that.showList);

  if(post.storage.audioUrl) {
    that.hideList();
    that.view.listbutton.html("Change song");
  }

  $("#container").addClass("show");
});
