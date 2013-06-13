/*global UT: true, jQuery: true */

;(function(UT, $) {
  "use strict";

  UT.Expression.ready(function(post) {
    $("#demo")
    .utText({
      placeholder: "What's on your mind ?"
    });

    $("#demo2")
      .utImage({
        post: post
      })
      .utText({
        placeholder: "What's on your mind ?",
      });

//  $("#demo3")
//    .utSticker({
//      flexRatio: false
//    });
//  $('.text','#demo3')
//    .utText({
//      placeholder: "working... but not, not today :p"
//    });

//  $("#demo4")
//    .utText({
//      fixedSize: true
//    });

    $("#demo5")
      .utText({
        chars: 140
      });

    post.valid(true);
  });
}(UT, jQuery));