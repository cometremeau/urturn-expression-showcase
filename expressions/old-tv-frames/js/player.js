/* global UT:true */

UT.Expression.ready(function (post) {
  "use strict";

  var that = {};
  that.ui = {};
  that.data = {};
  that.methods = {};

  that.waiter = UT.preloader.waitFor(["image","overlay"], false);
  that.waiter.on('load', function() {
    post.size($(post.node).width()/post.storage.ratio, function() {
      post.display();
    });
  });

  /**
   * prepare ref to UI elements
   */
  that.ui.container = $(".container");
  that.ui.videos = $(".video_element");

  that.ui.container.height($(post.node).width()/post.storage.ratio);

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
  obj.addClass("video" + (that.data.currentElement + 1));

  switch(parseInt(that.data.currentElement, 10)) {
    case 0: that.waiter.readyImage("overlay", "images/1_export.png"); break;
    case 1: that.waiter.readyImage("overlay", "images/2_export.png"); break;
    case 2: that.waiter.readyImage("overlay", "images/3_export.png"); break;
    case 3: that.waiter.readyImage("overlay", "images/4_export.png"); break;
    case 4: that.waiter.readyImage("overlay", "images/5_export.png"); break;
    default: that.waiter.ready("overlay"); break;
  }
  // set scale as width/576 * 100%
  obj.css("font-size", (that.data.expWidth/5.76) + "%");

  var tmp = $("#videoPlayer");

  tmp.on("utVideo:ready", function(event, data) {
    if(!data.data) {
      that.waiter.ready("image");
    }
  });

  tmp.on("utVideo:mediaReady", function(event, data) {
    if(data.thumbnail_url) {
      that.waiter.readyImage("image", data.thumbnail_url);
    } else {
      that.waiter.ready("image");
    }
  });
  tmp.utVideo();

  // show content
  return this;
});
