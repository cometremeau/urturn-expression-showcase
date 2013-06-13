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
    if($.browser.mobile) {
      that.ui.container.addClass("mobile");
    }
    var obj = that.ui.container.find(".video_element");
    obj.addClass("video" + (that.data.currentElement+1));

    // set scale as width/576 * 100%
    obj.css("font-size", ($(post.node).width()/5.76) + "%");
    var player = $("#videoPlayer").utVideo();

    // show content
    that.ui.container.addClass("show");

    $(".video_element .play").on("click", function(e) {
      $("#videoPlayer").utVideo("play");
      that.methods.onPlay();
      e.stopPropagation();
      e.preventDefault();
    });

    $(".video_element .pause").on("click", function(e) {
      $("#videoPlayer").utVideo("pause");
      e.stopPropagation();
      e.preventDefault();
    });

    $(".video_element .play-pause").on("click", function(e) {
      if(that.data.isPlayed) {
        $("#videoPlayer").utVideo("pause");
      } else {
        $("#videoPlayer").utVideo("play");
        that.methods.onPlay();
      }
      e.stopPropagation();
      e.preventDefault();
    });

    player.on("utVideo:play", that.methods.onPlay);
    player.on("utVideo:pause", that.methods.onPause);
    player.on("utVideo:stop", that.methods.onPause);
    player.on("utVideo:finish", that.methods.onPause);
    player.on("utVideo:error", that.methods.onPause);
  });
  post.size({ 'height':$(post.node).width()/post.storage.ratio });
  return this;
});
