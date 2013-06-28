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
    var obj = $("#sticker");
    var hh = obj.height();
    if(hh > 0) {
      obj.css('fontSize', hh + 'px');
      obj.css('lineHeight', (hh+10) + 'px');
    }
  };

  that.onImageSizeChangedOutside = function(size) {
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
    that.view.stickerArea.utStickersBoard("changeOptions", {
      movableArea: {left:0, top:0, width:1, height:1 - 50/that.view.image.height() }
    });
    that.view.stickerArea.utStickersBoard("update");
    setTimeout(function(){
      that.adaptPlayButton();
    }, 0);
  };

  that.view.utimage.utImage({
    width: 576,
    flexRatio: true,
    autoCrop: true
  });
  that.view.utimage.on('utImage:ready', function(event, image) {
    if(!image.data) {
      that.view.utimage.utImage('dialog');
    } else {
      $("#container").addClass("show");
      if(post.storage.audioUrl) {
        that.view.listbutton.css("display", "");
        that.view.stickerArea.css("display", "");
        that.view.desc.addClass("hasAudio");
      } else {
        that.view.desc.removeClass("hasAudio");
      }
      that.createPlayer();
    }
  });
  that.view.utimage.on('utImage:cancelDialog', function(event, image) {
    $("#container").addClass("show");
  });
  that.view.utimage.on('utImage:resize', function(event, image) {
    that.onImageSizeChangedOutside(image);
  });
  that.view.utimage.on('utImage:change', function(event, newValues){
    $("#container").addClass("show");
    var hasImage = !!newValues.data;
    if(hasImage) {
      that.data.imagePresent = true;
      that.view.listbutton.css("display", "");
      that.view.stickerArea.css("display", "");
      if(post.storage.audioUrl) {
        post.valid(true);
        that.hideList();
      } else {
        that.showList();
      }
    } else {
      that.view.listbutton.css("display", "none");
      that.view.stickerArea.css("display", "none");
      that.data.imagePresent = false;
      post.valid(false);
    }
  });

  that.adaptPlayButton();

  that.showList = function(){
    post.valid(false);
    that.view.desc.addClass("popupOpened");
    that.view.list.removeClass('hidden_list');
  };

  that.hideList = function(e){
    that.view.desc.removeClass("popupOpened");
    that.view.list.find(".preplay").utAudio("pause");
    that.view.list.addClass('hidden_list');
    if(e) {
      e.stopPropagation();
    }

    if(that.data.imagePresent && post.storage.audioUrl) {
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
    classResize: "resize icon_fullscreen",
    parameters: that.data.stickerData,
    rotateable: false,
    scaleable: true,
    movableArea: {left:0, top:0, width:1, height:1 - 50/that.view.image.height() },
    deleteButton: false,
    editButton: true,
    design: 7,
    flipContent: false,
    minSize: { width: 0.05, height: 0.05 },
    maxSize: { width: .9, height: .9 },
    onChanging: function() {
      that.adaptPlayButton();
    },
    onChanged: function(data) {
      that.data.stickerData = data;
      post.storage.stickerData = that.data.stickerData;
      post.save();
      that.adaptPlayButton();
    },
    onRemove: function() {
      post.storage.audioUrl =  null;
      post.save();
      post.valid(false);
      that.view.desc.removeClass("hasAudio");
      that.createPlayer();
      return false;
    },
    onEditClick: function() {
      that.showList();
    }
  });
  that.view.stickerArea.utStickersBoard("edit");

  that.attachPlayer = function(obj, url, num) {
    var playerObj = obj.find(".preplay");
    playerObj.attr("id", num);
    playerObj.utAudio({
      data: url,
      skin: 'preplay',
      ui:{
        play:    true,
        progress:false,
        time:    false,
        title:   false,
        source:  false,
        artwork: false
      },
      editable: false
    });
    playerObj.on('utAudio:canplay',function(e, data) {
      playerObj.attr("data-art", data.artwork_url);
    });
    playerObj.on("click", function(e){ e.stopPropagation(); });
  };

  that.createPlayer = function() {
    $("#player-area").empty();
    if(post.storage.audioUrl) {
      $("#player-area").utAudio({
        data: post.storage.audioUrl,
        skin: 'bottom-over',
        ui:{
          artwork: false,
          play:false
        },
        editable: false
      });
    }
  };

  var tmp = that.view.list.find("li");
  var qq;
  for(qq = 0; qq < tmp.length; qq++) {
    var obj = $(tmp.get(qq));
    var url = obj.attr("data-value");
    that.attachPlayer(obj, url, "prePlayer"+qq);
  }

  that.view.list.find('li').on('click', function(){
    var artwork = $(this).find(".preplay").attr("data-art");
    if(artwork) {
      $("#sticker").css("background-image", "url(" + artwork + ")");
    } else {
      $("#sticker").css("background-image", "");
    }

    var url = $(this).data('value');
    post.storage.audioUrl = url;
    post.save();
    that.hideList();
    that.view.desc.addClass("hasAudio");
    that.createPlayer();
    that.view.stickerArea.utStickersBoard("selectItem", "sticker", false);
  });

  $("#list .close").on("click", that.hideList);
  $("#list ul").thinScrollBar({});
  that.view.listbutton.on('click', that.showList);
  that.view.listbutton.css("display", "none");
  that.view.stickerArea.css("display", "none");
  that.hideList();
});
