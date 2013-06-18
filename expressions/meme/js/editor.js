/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {

    $("#meme")
      .utImage({
        reuse: true,
        minSize: 400
      })
      .on('utImage:change',function(event, newValues, oldValues) {
        if (newValues.data && !oldValues.data) {
          $(post.node).addClass('image-is-present');
        } else if(!newValues.data && oldValues.data) {
          $(post.node).removeClass('image-is-present');
        } else if(newValues.data && oldValues.data) {
          // content edited
        }
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
     .on('utText:save',function() {
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
    if ($("#header_text .ut-text-content")[0].innerHTML.length !== 0 &&
        !$("#meme").hasClass('ut-image-placeholder')) {
      post.valid(true);
    } else {
      post.valid(false);
    }

  }
  });
}(UT, jQuery));