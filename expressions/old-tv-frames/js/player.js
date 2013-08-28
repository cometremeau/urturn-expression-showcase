/* global UT:true */

UT.Expression.ready(function (post) {
  "use strict";

  var that = {};
  that.ui = {};
  that.data = {};
  that.methods = {};

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

  that.readyStateController.setKeys(["image","overlay"], function(){
    post.size($(post.node).width()/post.storage.ratio);
  });

  /**
   * prepare ref to UI elements
   */
  that.ui.container = $(".container");
  that.ui.videos = $(".video_element");

  that.ui.container.height($(post.node).width()/post.storage.ratio);

  /**
   * prepare working data
   */
  that.data.currentElement = post.storage.design || 0;
  that.data.isPlayed = false;
  that.data.expWidth = $(post.node).width();

  /**
   * expression's methods
   */
  that.methods.onPlay = function() {
    that.ui.container.removeClass("playing paused").addClass("playing");
    that.data.isPlayed = true;
  };

  that.methods.onPause = function() {
    that.ui.container.removeClass("playing paused").addClass("paused");
    that.data.isPlayed = false;
  };

  /**
   * first time expression init
   */
  // attach events
  if(that.isTouch) {
    that.ui.container.addClass("mobile");
  }
  var obj = that.ui.container.find(".video_element");
  obj.addClass("video" + (that.data.currentElement + 1));

  switch(parseInt(that.data.currentElement, 10)) {
    case 0: that.readyStateController.cacheImage("overlay", "images/1_export.png"); break;
    case 1: that.readyStateController.cacheImage("overlay", "images/2_export.png"); break;
    case 2: that.readyStateController.cacheImage("overlay", "images/3_export.png"); break;
    case 3: that.readyStateController.cacheImage("overlay", "images/4_export.png"); break;
    case 4: that.readyStateController.cacheImage("overlay", "images/5_export.png"); break;
    default: that.readyStateController.readyKey("overlay"); break;
  }

  // set scale as width/576 * 100%
  obj.css("font-size", (that.data.expWidth/5.76) + "%");

  var tmp = $("#videoPlayer");

  tmp.on("utVideo:ready", function(event, data) {
    if(!data.data) {
      that.readyStateController.readyKey("image");
    }
  });

  tmp.on("utVideo:mediaReady", function(event, data) {
    if(data.thumbnail_url) {
      that.readyStateController.cacheImage("image", data.thumbnail_url);
    } else {
      that.readyStateController.readyKey("image");
    }
  });
  tmp.utVideo();

  // show content
  return this;
});
