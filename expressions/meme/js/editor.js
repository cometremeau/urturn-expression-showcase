/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {

    $("#meme")
      .utImage({
        reuse: true
      })
      .on('utImage:ready',function() {
        post.size({'height':$(this).outerHeight()});
      })
      .on('utImage:change',function(event, newValues, oldValues) {
        if (newValues && newValues.data) {
          $(post.node).addClass('image-is-present');
        }
        if(!newValues.data && oldValues.data) {
          $(post.node).removeClass('image-is-present');
        }
        post.size({'height':$(this).outerHeight()});
        setTimeout(function() {
          jQuery(":utText").utText('adaptFontSize');
        }, 50);
        checkValidContent();
      });
   $("#header_text")
     .utText({
       placeholder: "Write here",
       maxFontSize: 62,
       minFontSize: 24,
       fixedSize: true,
       chars: 60,
       reuse: true,
       tabIndex: 1
     })
     .on('utText:save',function() {
      checkValidContent();
     });
   $("#footer_text")
     .utText({
       placeholder: "And here...",
       maxFontSize: 62,
       minFontSize: 24,
       fixedSize: true,
       chars: 60,
       reuse: true,
       tabIndex: 2
     })
     .on('utText:save',function() {
      checkValidContent();
     });

  function textLength(node){
    var v = node.html().replace(/<br\s*\/?>/mg,"\n");
    v = v.replace(/(<([^>]+)>)/ig,'');
    return $.trim(v.replace(/&nbsp;/ig,'')).length;
  }

  function indexContent() {
    var text = '';
    text += $("#header_text .ut-text-content").text();
    text += " ";
    text += $("#footer_text .ut-text-content").text();
    post.storage.indexedContent = text;
  }

  function checkValidContent() {
    // check if image is present, and either one or the other text is filled
    if ((textLength($("#header_text .ut-text-content")) !== 0 ||
      textLength($("#footer_text .ut-text-content")) !== 0 ) &&
      $("#meme").utImage('data')) {
      post.valid(true);
      indexContent();
    } else {
      post.valid(false);
    }
  }
  });
}(UT, jQuery));