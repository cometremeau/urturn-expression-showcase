/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {
    $("#meme")
      .utImage({
        reuse: true
      })
      .on('utImage:resized',function() {
        post.size({'height':$(this).outerHeight()});
        checkValidContent();
      })
      .on('utImage:removed',function() {
        console.warn("remov");
        checkValidContent();
      })
      .on('utImage:added',function() {
        console.warn("added");
        checkValidContent();
      });
   $("#header_text")
     .utText({
       placeholder: "Write here",
       maxFontSize: "72px",
       minFontSize: 36,
       fixedSize: true,
       chars: 60,
       reuse: true
     })
     .on('utText:saved',function() {
      checkValidContent();
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
    console.log("valid ?",$("#meme").hasClass('ut-image-placeholder'));
    if ($("#header_text .ut-text-content")[0].innerHTML.length !== 0 &&
        !$("#meme").hasClass('ut-image-placeholder')) {
      post.valid(true);
    } else {
      post.valid(false);
    }

  }
  });
}(UT, jQuery));