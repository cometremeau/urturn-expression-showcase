UT.Expression.ready(function(post) {
  var that = {};

  that.ASCIIStyles = post.storage.ASCIIStyles || null;
  that.ASCIIMap =  post.storage.ASCIIMap || null;
  that.imageOverlay = post.storage.imageOverlay || null;

  var element = $(post.node);

  that.container = $("<div>").addClass("container").appendTo(element);
  that.desc = $("<div>").addClass("desc").appendTo(that.container);
  that.canvas = $("<canvas id='canvas'>").appendTo(that.desc);
  that.asciiContainer = $("<pre>").addClass("ascii").appendTo(that.desc);

  that.addButtonWrap = $("<div>").addClass("add-button-wrapper").appendTo(that.desc);

  that.addButton = $("<a href='#'>").addClass("add-button dark-button icon_camera spaced-right large-button button").text("Add Image").appendTo(that.addButtonWrap);

  that.removeButton = $("<a href='#'>").addClass("remove-button action-button icon_trash large-button button").appendTo(that.desc);

  that.showImageDialog = function() {
    post.dialog('image', {size: { width: 576, height: false, flexRatio: true, autoCrop: true }}, function(data, error) {
      if (error) {return;}
      if (data) that.insertImage(data);
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
  }

  that.scaleASCII = function() {
    that.scale = parseInt($(post.node).width()) / parseInt(that.asciiContainer.width());
    that.asciiContainer
      .css("WebkitTransform", 'scale(' + that.scale + ')')
      .css("Moztransform", 'scale(' + that.scale + ')')
      .css("msTransform", 'scale(' + that.scale + ')')
      .css("OTransform", 'scale(' + that.scale + ')')
      .css("transform", 'scale(' + that.scale + ')');
  }


  that.setASCIIMap = function(ASCIIMap) {
    that.ASCIIMap = ASCIIMap;
    that.asciiContainer.html(ASCIIMap);
  }

  that.createGrdCanvas = function(){
    var grdCanvas = document.createElement("canvas");
    var grdCtx = grdCanvas.getContext("2d");

    grdCanvas.width = that.postWidth;
    grdCanvas.height = that.postHeight;

    grdCtx.rect(0, 0, that.postWidth, that.postHeight);

    var grd = grdCtx.createLinearGradient(0, 0, that.postWidth, 0);

    grd.addColorStop(0, 'transparent');
    grd.addColorStop(.4, 'transparent');
    grd.addColorStop(.6, '#000');
    grd.addColorStop(1, '#000');

    grdCtx.fillStyle = grd;
    grdCtx.fill();

    return grdCtx;
  }

  that.updateSize = function(){
    that.postWidth = $(post.node).width(),
    that.postHeight = $(post.node).height();
  }

  that.createImgCanvas = function(){
    that.canvas.get(0).width = that.postWidth;
    that.canvas.get(0).height = that.postHeight;

    var imgCtx = that.canvas.get(0).getContext('2d');
    imgCtx.drawImage(that.img, 0, 0, that.postWidth, that.postHeight);

    return imgCtx;
  }

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
  }

  that.saveData = function() {
    post.storage.ASCIIStyles = that.ASCIIStyles;
    post.storage.ASCIIMap = that.ASCIIMap;
    post.storage.imageOverlay = that.imageOverlay;
    post.storage.save();

    var res = that.ASCIIStyles && that.ASCIIMap && that.imageOverlay;

    post.valid(res);
  }

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
  }

  that.setBackground = function(){
    that.updateSize();
    that.asciiContainer.css('visibility', 'visible');
    var ii = new Image();
    ii.src = that.imageOverlay.url;
    ii.onload = function(){
      that.canvas.get(0).width = that.postWidth;
      that.canvas.get(0).height = that.postHeight;
      var imgCtx = that.canvas.get(0).getContext('2d');
      imgCtx.drawImage(ii, 0, 0, that.postWidth, that.postHeight);
    }
    that.saveData();
  }

  that.createBackground = function(){
    that.updateSize();
    that.scaleASCII();
    that.asciiContainer.css('visibility', 'visible');
    that.createImageOverlay()
    that.saveData();
  }


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
          post.on('resize', function() {
            post.off('resize');
            post.on('resize', that.scaleASCII);
            that.createBackground();
          });
          if(that.postHeight == parseInt(that.asciiContainer.height() * that.scale)){
            that.createBackground();
          }else{
            post.resize({height:that.asciiContainer.height() * that.scale})
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
    post.on('resize', function() {
      post.off('resize');
      post.on('resize', that.scaleASCII);
      that.setBackground();
    });
    if(that.postHeight == parseInt(that.asciiContainer.height() * that.scale)){
      that.setBackground();
    }else{
      post.resize({height:that.asciiContainer.height() * that.scale})
    }
  } else {
    that.showImageDialog();
  }

  return that;
});
