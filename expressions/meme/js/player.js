/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";
  UT.Expression.ready(function(post) {

    $("#meme")
      .utImage()
      .on('utImage:resize',function() {
        post.size({'height':$(this).outerHeight()});
      });
   $("#header_text")
     .utText({
       placeholder: "Write here",
       maxFontSize: "72px",
       minFontSize: 36,
       fixedSize: true,
       chars: 60,
       reuse: true
     });
   $("#footer_text")
     .utText({
       placeholder: "And here...",
       maxFontSize: 72,
       minFontSize: 36,
       fixedSize: true,
       chars: 60
     });

  });
}(UT, jQuery));