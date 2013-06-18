UT.Expression.ready(function (post) {
  "use strict";
  post.on('resize', function(){
    post.off('resize');

    var that = {};
    that.ui = {};
    that.data = {};
    that.methods = {};

    /**
     * prepare ref to UI elements
     */
    that.ui.container = $(".container");
    that.ui.videos = $(".video_element");

    /**
     * prepare working data
     */
    that.data.currentElement = post.storage.design || 0;
    that.data.isPlayed = false;
    that.data.expWidth = $(post.node).width();

    /**
     * expression's methods
     */
    that.methods.onPlay = function() {
      that.ui.container.removeClass("playing paused").addClass("playing");
      that.data.isPlayed = true;
    };

    that.methods.onPause = function() {
      that.ui.container.removeClass("playing paused").addClass("paused");
      that.data.isPlayed = false;
    };

    /**
     * first time expression init
     */
    // attach events
    if(that.isTouch) {
      that.ui.container.addClass("mobile");
    }
    var obj = that.ui.container.find(".video_element");
    obj.addClass("video" + (that.data.currentElement+1));

    // set scale as width/576 * 100%
    obj.css("font-size", (that.data.expWidth/5.76) + "%");
    $("#videoPlayer").utVideo();

    // show content
    that.ui.container.addClass("show");
  });
  post.size({ 'height':$(post.node).width()/post.storage.ratio });
  return this;
});
