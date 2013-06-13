UT.Expression.ready(function(post) {
  "use strict";
  var that = {};

  var element = $(post.node);

  that.desc = $("<div>").addClass("desc").appendTo(element);
  that.canvas = $("<img id='canvas'>").appendTo(that.desc);
  that.asciiContainer = $("<pre>").addClass("ascii").appendTo(that.desc);

  that.canvas.get(0).src = post.storage.imageOverlay.url;

  var style = post.storage.ASCIIStyles;

  that.asciiContainer.html(post.storage.ASCIIMap);

  that.asciiContainer.css('font-size',style.fontSize)
            .css('line-height', style.lineHeight)
            .css('letter-spacing', style.letterSpacing)
            .css('width',style.width)
            .css('height',style.height);

  var scale = parseInt($(post.node).width(),10) / parseInt(that.asciiContainer.width(),10);

  that.asciiContainer.css("WebkitTransform", 'scale(' + scale + ')')
    .css("Moztransform", 'scale(' + scale + ')')
    .css("msTransform", 'scale(' + scale + ')')
    .css("OTransform", 'scale(' + scale + ')')
    .css("transform", 'scale(' + scale + ')');

  post.size({height:that.asciiContainer.height()*scale},function(){
    that.asciiContainer.css('visibility','visible');
  });

  return that;
});
