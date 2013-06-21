/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";
  
  UT.Expression.ready(function(post) {

    if (post.context.player === true) {
      $(post.node).addClass('image-is-present');
    }

    $("#meme")
      .utImage()
      .on('utImage:ready',function() {
        post.size({'height':$(this).outerHeight()});
        jQuery(":utText").utText('sizeChange');
      })
      .on('utImage:change',function(event, newValues, oldValues) {
        post.size({'height':$(this).outerHeight()});
        jQuery(":utText").utText('sizeChange');
      });
   $("#header_text")
     .utText({
       maxFontSize: "72px",
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