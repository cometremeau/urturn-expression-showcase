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

     });
   $("#footer_text")
     .utText({

     });

  });
}(UT, jQuery));