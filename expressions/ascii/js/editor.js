UT.Expression.ready(function(post) {
  "use strict";
  var that = {};

  that.ASCIIStyles = post.storage.ASCIIStyles || null;
  that.ASCIIMap =  post.storage.ASCIIMap || null;
  that.imageOverlay = post.storage.imageOverlay || null;

  var element = $(post.node);

  that.desc = $("<div>").addClass("desc").appendTo(element);
  that.canvas = $("<canvas id='canvas'>").appendTo(that.desc);
  that.asciiContainer = $("<pre>").addClass("ascii").appendTo(that.desc);

  that.addButtonWrap = $("<div>").addClass("add-button-wrapper").appendTo(that.desc);

  that.addButton = $("<a href='#'>").addClass("ut-edit-button icon_camera spaced-right").text("Add Image").appendTo(that.addButtonWrap);

  that.removeButton = $("<a href='#'>").addClass("ut-edit-button icon_trash").appendTo(that.desc);

  that.showImageDialog = function() {
    post.dialog('image', {size: { width: 576, height: false, flexRatio: true, autoCrop: true }}, function(data, error) {
      if (error) {return;}
      if (data) {that.insertImage(data);}
    });
  };

  that.setASCIIStyles = function(ASCIIStyles) {
    that.ASCIIStyles = ASCIIStyles;
    that.asciiContainer
      .css('font-size', ASCIIStyles.fontSize)
      .css('line-height', ASCIIStyles.lineHeight)
      .css('letter-spacing', ASCIIStyles.letterSpacing)
      .css('width', ASCIIStyles.width)
      .css('height', ASCIIStyles.height);
  };

  that.scaleASCII = function() {
    that.scale = parseInt($(post.node).width(),10) / parseInt(that.asciiContainer.width(),10);
    that.asciiContainer
      .css("WebkitTransform", 'scale(' + that.scale + ')')
      .css("Moztransform", 'scale(' + that.scale + ')')
      .css("msTransform", 'scale(' + that.scale + ')')
      .css("OTransform", 'scale(' + that.scale + ')')
      .css("transform", 'scale(' + that.scale + ')');
  };


  that.setASCIIMap = function(ASCIIMap) {
    that.ASCIIMap = ASCIIMap;
    that.asciiContainer.html(ASCIIMap);
  };

  that.createGrdCanvas = function(){
    var grdCanvas = document.createElement("canvas");
    var grdCtx = grdCanvas.getContext("2d");

    grdCanvas.width = that.postWidth;
    grdCanvas.height = that.postHeight;

    grdCtx.rect(0, 0, that.postWidth, that.postHeight);

    var grd = grdCtx.createLinearGradient(0, 0, that.postWidth, 0);

    grd.addColorStop(0, 'transparent');
    grd.addColorStop(0.4, 'transparent');
    grd.addColorStop(0.6, '#000');
    grd.addColorStop(1, '#000');

    grdCtx.fillStyle = grd;
    grdCtx.fill();

    return grdCtx;
  };

  that.updateSize = function(){
    that.postWidth = $(post.node).width();
    that.postHeight = $(post.node).height();
  };

  that.createImgCanvas = function(){
    that.canvas.get(0).width = that.postWidth;
    that.canvas.get(0).height = that.postHeight;

    var imgCtx = that.canvas.get(0).getContext('2d');
    imgCtx.drawImage(that.img, 0, 0, that.postWidth, that.postHeight);

    return imgCtx;
  };

  that.createImageOverlay = function() {
    var imgCtx = that.createImgCanvas();
    var grdCtx = that.createGrdCanvas();

    var grdData = grdCtx.getImageData(0, 0, that.postWidth, that.postHeight),
        imgData = imgCtx.getImageData(0, 0, that.postWidth, that.postHeight),
        grdDataArr = grdData.data,
        imgDataArr = imgData.data;

    for (var i = 0; i < imgDataArr.length; i = i + 4) {
      imgDataArr[i + 3] = grdDataArr[i + 3];
      var brightness = 0.34 * imgDataArr[i] + 0.5 * imgDataArr[i + 1] + 0.16 * imgDataArr[i + 2];
      imgDataArr[i] = brightness;
      imgDataArr[i + 1] = brightness;
      imgDataArr[i + 2] = brightness;
    }

    imgCtx.putImageData(imgData, 0, 0);
    that.imageOverlay = new UT.Image(document.getElementById('canvas').toDataURL());
  };

  that.saveData = function() {
    post.storage.ASCIIStyles = that.ASCIIStyles;
    post.storage.ASCIIMap = that.ASCIIMap;
    post.storage.imageOverlay = that.imageOverlay;
    post.storage.save();

    var res = that.ASCIIStyles && that.ASCIIMap && that.imageOverlay;

    post.valid(res);
  };

  that.clear = function(){
    that.ASCIIStyles = null;
    that.ASCIIMap = null;
    that.imageOverlay = null;
    that.saveData();
    that.desc.removeClass('full');
    that.asciiContainer.html('').removeAttr('style');

    var imgCtx = that.canvas.get(0).getContext('2d');
    imgCtx.clearRect(0, 0, that.postWidth, that.postHeight);
    
    that.updateSize();
    that.showImageDialog();
  };

  that.setBackground = function(){
    that.updateSize();
    that.asciiContainer.css('visibility', 'visible');
    var img = new UT.Image(that.imageOverlay.url);
    img.editable(function(data){
      var ii = new Image();
      ii.src = data.url;
      ii.onload = function(){
        that.canvas.get(0).width = that.postWidth;
        that.canvas.get(0).height = that.postHeight;
        var imgCtx = that.canvas.get(0).getContext('2d');
        imgCtx.drawImage(ii, 0, 0, that.postWidth, that.postHeight);
      };
      that.saveData();
    });
  };

  that.createBackground = function(){
    that.updateSize();
    that.scaleASCII();
    that.asciiContainer.css('visibility', 'visible');
    that.createImageOverlay();
    that.saveData();
  };


  that.insertImage = function(data) {
    var ii = new UT.Image(data.url);
    ii.editable(function(data) {
      that.img = new Image();
      $(that.img).attr('asciify', 'true').attr('asciiresolution', 'low').attr('asciiscale', '1');
      that.img.src = data.url;
      that.img.onload = function() {
        jsAscii(that.img, function(ASCIIMap, ASCIIStyles) {
          that.desc.addClass('full');
          that.setASCIIStyles(ASCIIStyles);
          that.setASCIIMap(ASCIIMap);
          that.scaleASCII();
          if(that.postHeight === parseInt(that.asciiContainer.height() * that.scale, 10)){
            that.createBackground();
          }else{
            post.size({height:that.asciiContainer.height() * that.scale},function(){
              that.createBackground();
            });
          }
        });
      };
    });
  };

  that.addButton.on('mouseup touchend',that.showImageDialog);
  that.removeButton.on('mouseup touchend',that.clear);

  that.updateSize();

  post.on('resize', that.scaleASCII);

  if(that.ASCIIStyles && that.ASCIIMap && that.imageOverlay){
    that.desc.addClass('full');
    that.setASCIIStyles(that.ASCIIStyles);
    that.setASCIIMap(that.ASCIIMap);
    that.scaleASCII();
    if(that.postHeight === parseInt(that.asciiContainer.height() * that.scale, 10)){
      that.setBackground();
    }else{
      post.size({height:that.asciiContainer.height() * that.scale},function(){
        that.setBackground();
      });
    }
  } else {
    that.showImageDialog();
  }

  return that;
});
