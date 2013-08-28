/* global UT */
UT.Expression.ready(function(post) {
  "use strict";

  post.enableRotation(true);
  document.addEventListener('touchmove', function(event) {event.preventDefault();event.stopPropagation();});
  var that = {};
  that.parameters = post.storage.parameters || { items:[] };
  that.isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;

  /********************************************************************************
   * contain image to expression
   ********************************************************************************/
  that.onImageSizeChangedOutside = function(width, height) {
    if(!height){
      height = that.desc.height();
    }
    if(!width){
      width = that.desc.width();
    }

    var dwidth = Math.floor(width*(that.desc.height()/height));
    var dheight = Math.floor(height*(that.desc.width()/width));

    if(dheight <= that.desc.height()){
      that.image.css({
        height:dheight+'px',
        marginTop:-dheight/2+'px',
        top:'50%',
        left: "", width: "", marginLeft:""
      });
    } else {
      that.image.css({
        width:dwidth+'px',
        marginLeft:-dwidth/2+'px',
        left:'50%',
        top: "", height: "", marginTop:""
      });
    }

    that.image.utImage('update');
    that.image.find(".ut-sticker").utSticker('update');
  };

  that.checkValidContent = function() {
    if(that.parameters.items.length > 1) {
      that.image.removeClass("onceItem");
    } else {
      that.image.addClass("onceItem");
    }
    var res = (that.parameters.items.length > 0 && !!that.image.utImage("data"));
    try {
      post.valid(res);
    } catch(e) {}
  };

  /********************************************************************************
   * main container
   ********************************************************************************/
  var element = $(post.node);
  element.addClass("giraffe");
  if(that.isTouch) {
    element.addClass("mobile");
  }

  that.container = $("<div>", {"class":"container"}).appendTo(element);
  that.desc = $("<div>", {"class":"desc"}).appendTo(that.container);
  that.image = $("<div>", {"id":"back", "class":"image"}).appendTo(that.desc);

  that.image.on("utImage:ready", function(event, data){
    if(data.data) {
      if(!that.parameters.items || that.parameters.items.length <= 0) {
        that.parameters.items = [];
        that.addButtonClick();
      }
    } else {
      if(!post.context.mediaFirst) {
        that.image.utImage("dialog", {dialog: {fastQuit:true}});
      }
    }
  });

  that.image.on("utImage:mediaAdd", function(event, data){
    if(((data.width/data.height) > 1 && (that.desc.width()/that.desc.height()) < 1) ||
      ((data.width/data.height) < 1 && (that.desc.width()/that.desc.height()) > 1)) {
      post.notification('suggestRotation');
    }
  });

  that.image.on("utImage:mediaReady", function(event, data){
    that.image.find(".ut-sticker").utSticker("show");
    that.desc.addClass("show");
    that.onImageSizeChangedOutside(data.width, data.height);
    if(!that.parameters.items || that.parameters.items.length <= 0) {
      that.image.addClass("onceItem");
      that.addButtonClick();
    }
    that.checkValidContent();
  });

  that.image.on("utImage:focus", function(){
    that.image.find(".ut-sticker").utSticker("blur");
  });

  that.image.on("utImage:mediaRemove", function() {
    that.onImageSizeChangedOutside();
    that.image.find(".ut-sticker").utSticker("hide");
    that.checkValidContent();
  });

  that.image.utImage({
    styles:{
      width: 576,
      minHeight: 150,
      maxHeight: 1500,
      autoResize: false
    }
  });

  /********************************************************************************
   * sticker object
   ********************************************************************************/
  that.addSticker = function(giraffeId) {
    var newId = (new Date()).getTime() + "_" + parseInt(Math.random()*10000,10),
    iData = { id: newId, giraffeId: giraffeId };
    that.parameters.items.push(iData);
    post.storage.parameters = that.parameters;
    post.save();
    that._addSticker(iData);
    $(that.image.find(".ut-sticker").get(-1)).utSticker("focus");
    that.checkValidContent();
  };

  that.removeItemById = function(sId) {
    var qq,ww;
    for(qq = 0; qq < that.parameters.items.length; qq++) {
      if(that.parameters.items[qq].id === sId) {
        that.parameters.items.splice(qq, 1);
        post.storage.parameters = that.parameters;
        post.storage.save();
        return;
      }
    }
  };

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

  that.image.on("utSticker:destroy", function(e, id){
    that.removeItemById(id);
    that.checkValidContent();
    if(that.parameters.items.length > 0) {
      $(that.image.find(".ut-sticker").get(-1)).utSticker("focus");
    }
  });

  that.image.on("utSticker:focus", function(e, id){
    that.image.utImage("blur");
  });

  $.each(that.parameters.items, function(i,v) {
    that._addSticker(v);
  });

  /********************************************************************************
   * toolbar and menu
   ********************************************************************************/
  jQuery("<div>", {"class":"white_image_cover"}).appendTo(that.image);

  that.addButtonClick =  function(e) {
    that.image.find(".white_image_cover").css("display", "block");
    that.menu.utPopupChooser('show', function(type) {});

    if(e && e.stopPropagation) {
      e.stopPropagation();
    }
    if(e && e.preventDefault) {
      e.preventDefault();
    }
  };

  that.menu = $("<div>",{'class':'menu'}).appendTo(that.desc);
  that.menu.utPopupChooser({
    title:'Choose giraffe',
    items:[
      {html:'<div class="skin1"><span></span></div>', value:0},
      {html:'<div class="skin2"><span></span></div>', value:1},
      {html:'<div class="skin3"><span></span></div>', value:2},
      {html:'<div class="skin4"><span></span></div>', value:3},
      {html:'<div class="skin5"><span></span></div>', value:4},
      {html:'<div class="skin6"><span></span></div>', value:5},
      {html:'<div class="skin7"><span></span></div>', value:6},
      {html:'<div class="skin8"><span></span></div>', value:7}
    ],
    onChanged:function(type){
      that.image.find(".white_image_cover").css("display", "none");
      that.menu.utPopupChooser('hide');
      that.addSticker(type);
      that.image.utImage('editable', true);
      that.addButton.show();
    },
    onShow: function(){
      that.image.utImage('editable', false);
      that.addButton.hide();
    },
    onClose: function() {
      that.image.utImage('editable', true);
      that.addButton.show();
      that.image.find(".white_image_cover").css("display", "none");
    }
  });

  var tbPanel = $("<div>", {"class":"buttons buttons_left"}).appendTo(that.image);
  that.addButton = $("<a>", {"class":"ut-edit-button spaced-right large-button button bttnAddSticker"}).appendTo(tbPanel).html("<span class='sticker_icon'></span><span class='text'>Add a giraffe</span>");
  that.addButton.on("click", that.addButtonClick);

  /********************************************************************************
   * init and start expression
   ********************************************************************************/
  post.note = post.note ? post.note : "#giraffe";

  that.image.find(".ut-sticker").utSticker("editable", true);
  if(that.parameters.items.length > 0) {
    $(that.image.find(".ut-sticker").get(-1)).utSticker("focus");
  }

  post.on("resize", function() {
    var wdt = that.desc.width();
    var ratio = that.image.utImage("ratio");
    if(ratio) {
      that.onImageSizeChangedOutside(wdt, wdt/ratio);
    } else {
      that.onImageSizeChangedOutside();
    }
  });

  that.checkValidContent();
  return that;
});
