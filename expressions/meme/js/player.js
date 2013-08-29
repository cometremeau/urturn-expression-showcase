/* global UT:true, jQuery:true */
;(function(UT, $) {
  "use strict";
  
  UT.Expression.ready(function(post) {
    var that = {};
    // ========= ready state controller begin ==========//
    // TODO: move this controller to API somewhere//
    /* global fontdetect:true */
    that.readyStateController = {
      setKeys:function(keys, onReady){
        var that = this;
        that.keys = {};
        that.onReady = onReady;
        keys.map(function(key){that.keys[key] = {ready:false, data:false};});
      },
      readyKey:function(key,data){
        var that = this;
        if(!that.keys) {console.error('Please call setKeys with defined array of keys before calling readyKey for partiqular key');return;}
        if(!that.keys[key]) {console.error('wrong key, that was not defined in setKeys');return;}
        that.keys[key].ready = true;
        that.keys[key].data = data || false;
        console.log('==> readyStateController -> "',key,'" - ', data);
        for(var i in that.keys){if(!that.keys[i].ready) {return;}}
        console.log('======> YEAH :) all medias/fonts/etc.. are ready',that.keys);
        that.onReady(that.keys);
      },
      cacheImage: function(key, url) {
        var self = this;
        var tmpImg = new Image();
        tmpImg.onload = function() {
          self.readyKey(key, tmpImg);
        };
        tmpImg.onerror = function() {
          self.readyKey(key, tmpImg);
        };
        tmpImg.src = url;
      },
      cacheFont: function(key, name) {
        var self = this;
        fontdetect.onFontLoaded(name, function(){
          self.readyKey(key, name);
        }, function() {
          console.error('BAD .. FONT NOT LOADED IN 10 SEC...');
          self.readyKey(key, name);
        }, {msInterval: 100, msTimeout: 10000});
      }
    };
    // ========= ready state controller end ==========//

    that.readyStateController.setKeys(["size","image","font"], function(keys){
      post.size(keys.size.data.height);
    });

    that.readyStateController.cacheFont("font", "antonregular");

    $(post.node).addClass('image-is-present');

    $("#meme")
      .utImage()
      .on('utImage:resize', function(event, data) {
        that.readyStateController.readyKey("size", data);
      })
      .on("utImage:mediaReady", function() {
        that.readyStateController.readyKey("image");
      });

    $("#header_text")
      .utText({
        maxFontSize: 72,
        minFontSize: 24,
        fixedSize: true,
        chars: 60,
        reuse: true
      });
    $("#footer_text")
      .utText({
        maxFontSize: 72,
        minFontSize: 24,
        fixedSize: true,
        chars: 60
      });
  });
}(UT, jQuery));