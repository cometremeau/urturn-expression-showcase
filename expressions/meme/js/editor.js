/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {

    $("#meme")
      .utImage({
        reuse: true,
        minSize: 400
      })
      .on('utImage:ready',function() {
        post.size({'height':$(this).outerHeight()});
      })
      .on('utImage:change',function(event, newValues, oldValues) {
        if (newValues && newValues.data) {
          $(post.node).addClass('image-is-present');
          jQuery(":utText").utText('sizeChange');
          post.size({'height':$(this).outerHeight()});
        }
        if(!newValues.data && oldValues.data) {
          $(post.node).removeClass('image-is-present');
        } else if(newValues && newValues.data && oldValues && oldValues.data) {
          post.size({'height':$(this).outerHeight()});
          jQuery(":utText").utText('sizeChange');
        }
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