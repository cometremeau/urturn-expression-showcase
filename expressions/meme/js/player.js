/* global UT:true, jQuery:true */
;(function(UT, $) {
  "use strict";
  
  UT.Expression.ready(function(post) {
    $(post.node).addClass('image-is-present');

    $("#meme")
      .utImage()
      .on('utImage:resize', function(event, data) {
        post.size(data.height);
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