UT.Expression.ready(function(post) {
  var that = {};

  var element = $(post.node);

  that.container = $("<div>").addClass("container").appendTo(element);
  that.desc = $("<div>").addClass("desc").appendTo(that.container);
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

  var scale = parseInt($(post.node).width()) / parseInt(that.asciiContainer.width());

  that.asciiContainer.css("WebkitTransform", 'scale(' + scale + ')')
    .css("Moztransform", 'scale(' + scale + ')')
    .css("msTransform", 'scale(' + scale + ')')
    .css("OTransform", 'scale(' + scale + ')')
    .css("transform", 'scale(' + scale + ')');

  post.on('resize',function(){
    post.off('resize');
    that.asciiContainer.css('visibility','visible');
  });

  post.resize({height:that.asciiContainer.height()*scale})

  return that;
});
