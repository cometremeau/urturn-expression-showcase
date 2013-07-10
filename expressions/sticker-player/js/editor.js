UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc:       $("#desc"),
    image:      $('#image'),
    utimage:    $('#utimage'),
    player:     $('#player'),
    list:       $('#list'),
    hiddenlist: $('.hidden_list'),
    listbutton: $('#listbutton'),
    stickerArea:$('#stickerArea'),
    previewBtn: $('.preview-btn'),
    editBtn:    $('.edit-btn'),
    logo:       $('#logo')
  };

  that.data = {
    stickerData: post.storage.stickerData,
    imagePresent: false
  };

  that.settings = {
    isTouch: 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0,
    mode: 'edit',
    state: 'launch'
  };

  if (that.settings.isTouch) {
    that.view.desc.addClass('touch-device');
  }

  //check background for popup
  var tmpimage = new Image();
  tmpimage.src = 'images/background.png';
  tmpimage.onload = function() {
    that.view.list.css('opacity', '1');
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
      movableArea: {left:0, top:0, width:1, height:1 - 50/that.view.image.height()}
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
    that.adaptPopupSize();
    //adapt logo image height
    that.view.logo.height(that.view.logo.width()/2.05);
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

  that.view.utimage.on('utImage:focus', function() {
    that.view.stickerArea.utStickersBoard("killFocus");
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

  var stickerMinSize = 60 / that.view.image.width();

  that.view.stickerArea.utStickersBoard({
    post: post,
    items: [{
      object: '<div id="sticker" class="ut-audio-skin-sticker ut-audio-state-launch"><div class="ut-audio-ui-play"><span class="icon_spinner ut-audio-ui-seek-icon"></span><span class="icon_play ut-audio-ui-play-icon"></span><span class="icon_pause ut-audio-ui-pause-icon"></span></div></div>',
      key: "sticker",
      originalWidth: 0.3,
      originalHeight: 0.3 * that.view.image.width()/that.view.image.height()
    }],
    classResize: "resize icon_fullscreen",
    parameters: that.data.stickerData,
    rotateable: false,
    scaleable: true,
    movableArea: {left:0, top:0, width:1, height:1 - 50/that.view.image.height()},
    deleteButton: false,
    editButton: true,
    design: 7,
    flipContent: false,
    minSize: { width: stickerMinSize, height: stickerMinSize },
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
    },
    onFocus: function() {
      that.view.utimage.utImage('killFocus');
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
          play: true
        },
        editable: false
      }).on('utAudio:change',function(){
          //console.log('--- utAudio:change -> audio data/parameters was changed');
        }).on('utAudio:ready',function(e){
          //console.log('--- utAudio:ready -> audio component ready to accept events');
        }).on('utAudio:canplay',function(e, data) {
          //console.log('--- utAudio:canplay -> audio ready to be played', data);
          $("#sticker").css("background-image", "url(" + data.artwork_url + ")");
          if(data.service_name === "soundcloud") {
            $("#sourceTip").html('<a href="' + post.storage.audioUrl + '" target="_blank">Listen on SoundCloud</a>');
          } else {
            $("#sourceTip").html('<a href="' + post.storage.audioUrl + '" target="_blank">Buy on iTunes</a>');
          }
        }).on('utAudio:play',function(){
          //console.log('--- utAudio:play -> audio started to play');
          $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-play');
          that.settings.state = 'play';
        }).on('utAudio:pause',function(){
          //console.log('--- utAudio:pause -> audio paused');
          $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-pause');
          that.settings.state = 'pause';
        }).on('utAudio:stop',function(){
          //console.log('--- utAudio:stop -> audio stopped');
          $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-launch');
          that.settings.state = 'launch';
        }).on('utAudio:finish',function(){
          //console.log('--- utAudio:finish -> audio finished');
        }).on('utAudio:timeupdate',function(e,s){
          //console.log('--- utAudio:timeupdate -> audio time updated', s);
          $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-play');
          that.settings.state = 'play';
        }).on('utAudio:seek',function(){
          //console.log('--- utAudio:seek -> audio seek started');
          $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-seek');
          that.settings.state = 'seek';
        });
    }
  };

  that.adaptSize =  function(defText, obj) {
    if (obj.height() > 49) {
      var text = obj.html();
      text = text.substring(0, text.length - 1);
      obj.html(text);
      that.adaptSize(defText, obj);
    } else {
      if (defText !== obj.html()) {
        var tmp = obj.html();
        tmp = tmp.substring(0, tmp.length - 3) + '...';
        obj.html(tmp);
      }
    }
  };

  that.adaptPopupSize = function() {
    if (that.view.list.outerHeight() > 376 && !that.settings.isTouch) {
      that.view.list.css('height', '376px');
    }
    that.view.list.css('margin-top', - that.view.list.outerHeight() / 2);
    $('.antiscroll-wrapper').antiscroll();
  };

  that.changeMode = function(mode) {
    if (mode === 'edit') {
      that.settings.mode = 'edit';
      that.view.desc.removeClass('preview-mode').addClass('edit-mode');
      that.view.stickerArea.utStickersBoard("edit");
    } else {
      that.settings.mode = 'preview';
      that.view.desc.removeClass('edit-mode').addClass('preview-mode');
      that.view.stickerArea.utStickersBoard("view");
    }
  };

  that.view.previewBtn.on('click', function(){
    that.changeMode('preview');
  });

  that.view.editBtn.on('click', function(){
    that.changeMode('edit');
  });

  $("#sticker").on('click', function(){
    if (that.settings.mode === 'edit') {
      return false;
    }
    if(that.settings.state !== "play") {
      $("#player-area").utAudio('play');
      $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-seek');
    } else {
      $("#player-area").utAudio('pause');
    }
    //that.view.player.show();
  });

  $("#player-area").on("click", ".ut-audio-ui-source" , function() {
    if (that.settings.mode === 'edit') {
      return false;
    }
    $("#sourceTip").toggleClass("show");
    return false;
  });

  var tmp = that.view.list.find("li");
  var qq;
  for(qq = 0; qq < tmp.length; qq++) {
    var obj = $(tmp.get(qq));
    var url = obj.attr("data-value");
    that.attachPlayer(obj, url, "prePlayer"+qq);
  }

  //index of last player
  var lastIndex = tmp.length - 1;

  for (var j = 0; j < tracksList.length; j++) {
    var listNode = $('<li></li>')
      .appendTo(that.view.hiddenlist)
      .append('<div class="preplay"></div>')
      .append('<span>' + tracksList[j].html + '</span>')
      .attr('data-value', tracksList[j].url);

    that.attachPlayer(listNode, tracksList[j].url, "prePlayer" + (lastIndex + j + 1));
  }

  that.view.hiddenlist.find('li span').each(function(){
    var self = $(this);
    fontdetect.onFontLoaded("Roboto", function(){
      that.adaptSize(self.html(), self);
      that.adaptPopupSize();
    }, function(){console.error('BAD .. FONT NOT LOADED IN 10 SEC... editor.js line 339');}, {msInterval: 100, msTimeout: 10000});
  });

  //that.adaptPopupSize();

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
  that.view.listbutton.on('click', that.showList);
  that.view.listbutton.css("display", "none");
  that.view.stickerArea.css("display", "none");
  that.hideList();
});
