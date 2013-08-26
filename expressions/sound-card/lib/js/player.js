UT.Expression.ready(function(post) {
  "use strict";

  var that = {};

  that.view = {
    desc:       $("#desc"),
    image:      $('#image'),
    utimage:    $('#utimage'),
    player:     $('#player'),
    stickerArea:$('#stickerArea'),
    logo:       $('#logo')
  };

  that.view.player.hide();

  that.state = 'launch';

  that.adaptPlayButton = function() {
    var $sticker = $("#sticker");
    var hh = $sticker.height();
    if(hh > 0) {
      $sticker.css('fontSize', hh + 'px');
      $sticker.css('lineHeight', (hh+12) + 'px');
    }
  };

  that.view.utimage.on("utImage:mediaReady", function() {
    that.addSticker();
  });

  that.view.utimage.on("utImage:resize", function(event, data) {
    post.size(data.height, function() {
      that.view.stickerArea.find(".ut-sticker").utSticker("update");
    });
    //adapt logo image height
    that.view.logo.height(that.view.logo.width()/2.05);
  });

  that.view.utimage.utImage({
    ui: {
      source: false
    }
  });

  that.addSticker = function() {
    that.view.stickerArea.empty();
    $('<div id="sticker" class="ut-audio-skin-sticker ut-audio-state-launch"><div class="ut-audio-ui-play"><span class="icon_spinner ut-audio-ui-seek-icon"></span><span class="icon_play ut-audio-ui-play-icon"></span><span class="icon_pause ut-audio-ui-pause-icon"></span></div></div>')
      .appendTo(that.view.stickerArea)
      .utSticker({
        id: "sticker",
        editable: {
          movable: true,
          resizable: true
        },
        ui: {
          edit: true
        },
        styles: {
          pos: {
            width: "30%",
            ratio: 1
          },
          parentIndent: {
            top: "0",
            left: "0",
            right: "0",
            bottom: "45px"
          },
          sizeLimits: {
            minWidth: "60px",
            minHeight: "60px"
          }
        }
      });

    that.view.stickerArea.on("utSticker:resize", "#sticker", function(){
      that.adaptPlayButton();
    });
    that.view.stickerArea.on("utSticker:change", "#sticker", function(){
      that.adaptPlayButton();
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
  }).on('utAudio:mediaReady',function(e, data) {
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
  }).on('utAudio:timeUpdate',function(e,s){
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

if(!$.fn.alterClass) {
  $.fn.alterClass = function ( removals, additions ) {
    "use strict";

    var self = this;
    if ( removals.indexOf( '*' ) === -1 ) {
      self.removeClass( removals );
      return !additions ? self : self.addClass( additions );
    }

    var patt = new RegExp( '\\s' +
      removals.
        replace( /\*/g, '[A-Za-z0-9-_]+' ).
        split( ' ' ).
        join( '\\s|\\s' ) +
      '\\s', 'g' );

    self.each( function ( i, it ) {
      var cn = ' ' + it.className + ' ';
      while ( patt.test( cn ) ) {
        cn = cn.replace( patt, ' ' );
      }
      it.className = cn.trim();
    });

    return !additions ? self : self.addClass( additions );
  };
}