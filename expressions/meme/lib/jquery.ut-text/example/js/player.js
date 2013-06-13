;(function(UT, $, document) {
  "use strict";

  UT.Expression.ready(function(post) {
    $("#demo")
    .utText({
      post: post
    });

    $("#demo2")
      .utImagePanel({
        post: post
      })
      .utText({
        post: post
      });

    $("#demo3")
      .utSticker();
    $('.text','#demo3')
      .utText({
        post: post
      });
  });
}(UT, jQuery, document));