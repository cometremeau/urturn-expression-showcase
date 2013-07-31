/* global UT */
UT.Expression.ready(function(post) {
  "use strict";

  var that = {};
  that.parameters = post.storage.parameters || { items:[] };
  that.isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;

  var element = $(post.node);
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
  });

  that.image.on("utImage:resize", function(event, data){
    post.size(data.height);
  });

  that.image.utImage();
});
