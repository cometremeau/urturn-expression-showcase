/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {
    $("#meme")
      .utImage({
        post: post
      })
      .on('utImage:resize',function() {
        post.size({'height':$(this).outerHeight()});
        checkValidContent();
      });
   $("#header_text")
     .utText({
       placeholder: "Write here",
       maxFontSize: 72,
       minFontSize: 36,
       fixedSize: true,
       chars: 60
     });
   $("#footer_text")
     .utText({
       placeholder: "And here...",
       maxFontSize: 72,
       minFontSize: 36,
       fixedSize: true,
       chars: 60
     });

  function checkValidContent() {
    console.log("valid ?");
    post.valid(true);
  }
  });
}(UT, jQuery));