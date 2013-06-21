UT.Expression.ready(function(post) {
  var that = {};

  that.view = {
    desc:       jQuery("#desc"),
    image:      jQuery('#image'),
    utimage:    jQuery('#utimage'),
    sticker:    jQuery('#sticker'),
    player:     jQuery('#player')
  };

  that.view.player.hide();

  that.state = 'launch';

  that.adaptPlayButton = function(){
    that.view.sticker.css('fontSize',that.view.sticker.height()+'px');
    that.view.sticker.css('lineHeight',that.view.sticker.height()+6+'px');
  };

  that.view.utimage.utImage()
  .on('utImage:resize', function(event, image) {
    post.size(image.height);
  });

  that.view.sticker.utSticker({editable:false});

  that.view.player.empty().utAudio({
    data:post.storage.audioUrl,
    skin:'bottom-over',
    ui:{
      artwork: false,
      play:false
    },
    editable: false
  }).on('utAudio:change',function(){
    //console.log('--- utAudio:change -> audio data/parameters was changed');
  }).on('utAudio:ready',function(e){
    //console.log('--- utAudio:ready -> audio component ready to accept events');
  }).on('utAudio:canplay',function(e, data){
    //console.log('--- utAudio:canplay -> audio ready to be played', data);
  }).on('utAudio:play',function(){
    //console.log('--- utAudio:play -> audio started to play');
    that.view.sticker.alterClass('ut-audio-state-*', 'ut-audio-state-play');
    that.state = 'play';
  }).on('utAudio:pause',function(){
    //console.log('--- utAudio:pause -> audio paused');
    that.view.sticker.alterClass('ut-audio-state-*', 'ut-audio-state-pause');
    that.state = 'pause';
  }).on('utAudio:stop',function(){
    //console.log('--- utAudio:stop -> audio stopped');
    that.view.sticker.alterClass('ut-audio-state-*', 'ut-audio-state-launch');
    that.state = 'launch';
  }).on('utAudio:finish',function(){
    //console.log('--- utAudio:finish -> audio finished');
  }).on('utAudio:timeupdate',function(e,s){
    //console.log('--- utAudio:timeupdate -> audio time updated', s);
    that.view.sticker.alterClass('ut-audio-state-*', 'ut-audio-state-play');
    that.state = 'play';
  }).on('utAudio:seek',function(){
    //console.log('--- utAudio:seek -> audio seek started');
    that.view.sticker.alterClass('ut-audio-state-*', 'ut-audio-state-seek');
    that.state = 'seek';
  });

  that.adaptPlayButton();

  that.view.sticker.on('click', function(){
    that.view.player.utAudio('play');
    that.view.player.show();
  });
});


if(!$.fn.alterClass) {

  $.fn.alterClass = function (removals, additions) {
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
