UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc:       jQuery("#desc"),
    image:      jQuery('#image'),
    utimage:    jQuery('#utimage'),
    player:     jQuery('#player'),
    stickerArea:jQuery('#stickerArea')
  };

  that.data = { stickerData: post.storage.stickerData };

  that.view.player.hide();

  that.state = 'launch';

  that.adaptPlayButton = function(){
    var hh = $("#sticker").height();
    if(hh > 0) {
      $("#sticker").css('fontSize', hh + 'px');
      $("#sticker").css('lineHeight', (hh+12) + 'px');
    }
  };

  that.view.utimage.utImage();
  that.view.utimage.on('utImage:resize', function(event, image) {
    post.size(image.height, function(){
      that.addSticker();
    });
  });

  that.addSticker = function() {
    that.view.stickerArea.empty();
    that.view.stickerArea.utStickersBoard({
      post: post,
      items: [{
        object: '<div id="sticker" class="ut-audio-skin-sticker ut-audio-state-launch"><div class="ut-audio-ui-play"><span class="icon_spinner ut-audio-ui-seek-icon"></span><span class="icon_play ut-audio-ui-play-icon"></span><span class="icon_pause ut-audio-ui-pause-icon"></span></div></div>',
        key: "sticker",
        originalWidth: 0.3,
        originalHeight: 0.3 * that.view.image.width()/that.view.image.height()
      }],
      parameters: that.data.stickerData,
      rotateable: true,
      scaleable: true,
      movableArea: {left:0, top:0, width:1, height:1 },
      deleteButton: false,
      design: 7,
      flipContent: false,
      minSize: { width: 0.01, height: 0.01 },
      maxSize: { width: 1, height: 1 },
      onChanging: function() {
        that.adaptPlayButton();
      },
      onChanged: function(data) {
        that.data.stickerData = data;
        post.storage.stickerData = that.data.stickerData;
        post.save();
        that.adaptPlayButton();
      }
    });
    setTimeout(function(){
      that.adaptPlayButton();
    }, 0);
    that.adaptPlayButton();

    $("#sticker").on('click', function(){
      if(that.state !== "play") {
        that.view.player.utAudio('play');
        $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-seek');
      } else {
        that.view.player.utAudio('pause');
      }
      that.view.player.show();
    });
  };

  that.view.player.empty().utAudio({
    data:post.storage.audioUrl,
    skin:'bottom-over',
    ui:{
      artwork: false,
      play:true
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
    that.state = 'play';
  }).on('utAudio:pause',function(){
    //console.log('--- utAudio:pause -> audio paused');
    $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-pause');
    that.state = 'pause';
  }).on('utAudio:stop',function(){
    //console.log('--- utAudio:stop -> audio stopped');
    $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-launch');
    that.state = 'launch';
  }).on('utAudio:finish',function(){
    //console.log('--- utAudio:finish -> audio finished');
  }).on('utAudio:timeupdate',function(e,s){
    //console.log('--- utAudio:timeupdate -> audio time updated', s);
    $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-play');
    that.state = 'play';
  }).on('utAudio:seek',function(){
    //console.log('--- utAudio:seek -> audio seek started');
    $("#sticker").alterClass('ut-audio-state-*', 'ut-audio-state-seek');
    that.state = 'seek';
  });

  var src_lick = that.view.player.find(".ut-audio-ui-source");
  src_lick.on("click", function() {
    $("#sourceTip").toggleClass("show");
    return false;
  });

  $("#container").addClass("show");
});
