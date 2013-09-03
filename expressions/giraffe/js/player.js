/* global UT */
UT.Expression.ready(function(post) {
  "use strict";

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

  that.readyStateController.setKeys(["size","image","img1","img2","img3","img4","img5","img6","img7","img8"], function(keys){
    post.size(keys.size.data.height, function() {
      that.image.find(".ut-sticker").utSticker("update");
      post.display();
    });
  });

  that.readyStateController.cacheImage("img1", "images/giraffe_angry.png");
  that.readyStateController.cacheImage("img2", "images/giraffe_cry.png");
  that.readyStateController.cacheImage("img3", "images/giraffe_drunk.png");
  that.readyStateController.cacheImage("img4", "images/giraffe_glasses.png");
  that.readyStateController.cacheImage("img5", "images/giraffe_kiss.png");
  that.readyStateController.cacheImage("img6", "images/giraffe_regular.png");
  that.readyStateController.cacheImage("img7", "images/giraffe_smile.png");
  that.readyStateController.cacheImage("img8", "images/giraffe_tongue.png");

  that.parameters = post.storage.parameters || { items:[] };
  that.isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;

  var element = $(post.node);
  element.addClass("giraffe");
  if(that.isTouch) {
    element.addClass("mobile");
  }
  that.container = $("<div>", {"class":"container"}).appendTo(element);
  that.desc = $("<div>", {"class":"desc"}).appendTo(that.container);
  that.image = $("<div>", {"id":"back", "class":"image"}).appendTo(that.desc);

  that._addSticker = function(data) {
    var obj = $("<div>", {"class":"giraffe_" + data.giraffeId}).appendTo(that.image);
    obj.utSticker({
      id: data.id,
      styles: {
        pos: {
          width: "50%",
          ratio: 1
        },
        parentIndent: 0,
        selfOutdent: "70%",
        autoflip: false,
        sizeLimits: {
          minWidth: 50,
          minHeight: 50,
          maxWidth: "90%",
          maxHeight: "90%"
        }
      }
    });
  };

  that.image.on("utImage:mediaReady", function(){
    that.image.find(".ut-sticker").utSticker("remove");
    $.each(that.parameters.items, function(i,v) {
      that._addSticker(v);
    });
    that.readyStateController.readyKey("image");
  });

  that.image.on("utImage:resize", function(event, data){
    that.readyStateController.readyKey("size", data);
  });

  that.image.utImage();
});
