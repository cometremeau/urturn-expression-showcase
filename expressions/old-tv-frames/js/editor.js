UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  that.ui = {};
  that.data = {};
  that.methods = {};
  that.isTouch = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints > 0));
  that.isMSIE = (navigator.userAgent.indexOf("MSIE") !== -1);

  /**
   * prepare referance to UI elements
   */
  that.ui.container = $(".container");
  that.ui.videos = $(".video_element");
  that.ui.videoPlayer = null;
  that.ui.styleSwitcher = $(".style_switcher");
  that.ui.prev = that.ui.styleSwitcher.find(".to-left");
  that.ui.next = that.ui.styleSwitcher.find(".to-right");

  /**
   * prepare working data
   */
  that.data.currentElement = typeof(post.storage.design) !== "undefined" ? post.storage.design : 0;
  that.data.frameRatios = [640/459, 640/432, 640/671, 640/441, 640/480];
  that.data.expWidth = $(post.node).width();
  that.data.expHeight = $(post.node).height();
  that.data.itemWidth = 0;
  that.data.itemHeight = 0;

  /**
   * change styles in list positions
   */
  that.methods.updateElementPosition = function() {
    // check and save selected frame number
    if(that.data.currentElement < 0) {
      that.data.currentElement = 0;
    }
    if(that.data.currentElement >= that.ui.videos.length) {
      that.data.currentElement = that.ui.videos.length-1;
    }
    post.storage.design = that.data.currentElement;
    post.storage.ratio = that.data.frameRatios[that.data.currentElement];
    post.storage.save();

    that.methods.onResize(false);

    var offset = -(100 * that.data.currentElement);
    that.setVideosOffset(offset, true);

    // update styleSwitcher
    var obj = that.ui.styleSwitcher.find("ul li");
    obj.removeClass("selected");
    obj = $(obj.get(that.data.currentElement));
    obj.addClass("selected");

    // change "selected" state
    that.ui.videos.removeClass("selected");
    $(that.ui.videos[that.data.currentElement]).addClass("selected");

    // update videoPlayer position
    if(that.ui.videoPlayer) {
      //that.ui.videoPlayer.utVideo("stop");
    }

    obj = $(that.ui.videos[that.data.currentElement]).find(".video");
    if(obj.find("#videoPlayer").length <= 0) {
      /* IE: remove object and create new -- fix with iframe troubles */
      if(that.isMSIE) {
        that.ui.videoPlayer.off("utVideo:finish", that.methods.onPlayFinished);
        that.ui.videoPlayer.remove();

        that.ui.videoPlayer = $("<div>", {"id":"videoPlayer"});
        obj.append(that.ui.videoPlayer);
        that.ui.videoPlayer.utVideo(that.isTouch ? {ui:{play:false, playing:false}} : {});
        that.ui.videoPlayer.on("utVideo:finish", that.methods.onPlayFinished);
      } else {
        that.ui.videoPlayer.detach();
        obj.append(that.ui.videoPlayer);
      }
    }
  };

  that.setVideosOffset = function(percent, animate) {
    that.ui.container.removeClass("slide_animation");

    if(animate) {
      that.ui.container.addClass("slide_animation");
    }

    var off = (percent/100) * that.data.expWidth;
    that.ui.videos.css({
      "-webkit-transform": "translateX("+off+"px) rotateZ(0)",
      "-moz-transform": "translateX("+off+"px) rotateZ(0)",
      "-ms-transform": "translateX("+off+"px) rotateZ(0)",
      "-o-transform": "translateX("+off+"px) rotateZ(0)",
      "transform": "translateX("+off+"px) rotateZ(0)"
    });
  };

  /**
   * handle tap and swipe events
   */
  that.methods.onHamerHandle = function(e) {
    var obj, off = 0;
    switch(e.type) {
      case "dragright":
      case "dragleft":
        var pane_offset = -(100 * that.data.currentElement);
        var drag_offset = ((100 / that.data.expWidth) * e.gesture.deltaX);// / that.data.frameRatios.length;

        // slow down at the first and last pane
        if ((that.data.currentElement === 0 && e.gesture.direction === Hammer.DIRECTION_RIGHT) ||
          (that.data.currentElement === (that.data.frameRatios.length - 1) && e.gesture.direction === Hammer.DIRECTION_LEFT)) {
          drag_offset *= 0.4;
          $(".style_switcher").addClass("error");
        } else {
          $(".style_switcher").removeClass("error");
        }

        that.setVideosOffset(drag_offset + pane_offset);
        break;

      case 'release':
        // more then 50% moved, navigate
        if (Math.abs(e.gesture.deltaX) > that.data.expWidth / 2) {
          if(e.gesture.direction === Hammer.DIRECTION_LEFT) {
            that.methods.toNext();
          } else {
            that.methods.toPrev();
          }
        } else {
          that.methods.updateElementPosition();
        }
        $(".style_switcher").removeClass("error");
        break;

      case "swipeleft":
        that.methods.toNext();
        e.gesture.stopDetect();
        $(".style_switcher").removeClass("error");
        break;

      case "swiperight":
        that.methods.toPrev();
        e.gesture.stopDetect();
        $(".style_switcher").removeClass("error");
        break;

      default:
        break;
    }
  };

  /**
   * move to next frame
   */
  that.methods.toNext = function(e) {
    that.data.currentElement++;

    if(e) {
      e.stopPropagation();
    }
    that.methods.updateElementPosition();
  };

  /**
   * move to previous frame
   */
  that.methods.toPrev = function(e) {
    that.data.currentElement--;

    if(e) {
      e.stopPropagation();
    }
    that.methods.updateElementPosition();
  };

  /**
   * user click to circle in styleSwitcher window
   */
  that.methods.onChangeStyleClick = function(e) {
    that.data.currentElement = that.ui.styleSwitcher.find("ul li").index(this);
    that.methods.updateElementPosition();
    e.stopPropagation();
  };

  /**
   * update video element sizes and positions
   */
  that.methods.onResize = function(noUpdPos) {
    // retrieve new epression size
    that.data.expWidth = $(post.node).width();
    that.data.expHeight = $(post.node).height();
    var maxWidth = 0;
    var maxHeight = 0;

    var objs = $(".video_element");
    objs.each(function(n, item){
      var ratio = that.data.frameRatios[n];

      // calculate new video frame size
      var itemWidth, itemHeight;
      if(that.data.expWidth/ratio > that.data.expHeight) {
        itemWidth = Math.round(that.data.expHeight * ratio);
        itemHeight = that.data.expHeight;
      } else {
        itemWidth = that.data.expWidth;
        itemHeight = Math.round(that.data.expWidth / ratio);
      }

      if(n === that.data.currentElement) {
        that.data.itemWidth = itemWidth;
        that.data.itemHeight = itemHeight;
      }

      // update max size
      maxWidth = Math.max(maxWidth, itemWidth);
      maxHeight = Math.max(maxHeight, itemHeight);

      // update frames sizes and scale
      $(item).css({
        "left": (n + 0.5) * that.data.expWidth,
        "margin-left": -Math.round(itemWidth / 2) + "px",
        "margin-top": -Math.round(itemHeight / 2) + "px",
        "width": itemWidth + "px",
        "height": itemHeight + "px",
        "font-size": (itemWidth / 5.76) + "%"
      });
    });

    that.ui.container.css({
      "left": Math.round((that.data.expWidth - maxWidth)/2) + "px",
      "top": Math.round((that.data.expHeight - maxHeight)/2) + "px",
      "width": maxWidth + "px",
      "height": maxHeight + "px"
    });

    if(noUpdPos !== false) {
      that.methods.updateElementPosition();
    }
  };

  /**
   * first time expression init
   */
  // attach events
  if(that.isTouch) {
    that.ui.container.addClass("mobile");
  } else {
    that.ui.prev.on("click", that.methods.toPrev);
    that.ui.next.on("click", that.methods.toNext);
    that.ui.styleSwitcher.on("click", "ul li", that.methods.onChangeStyleClick);
  }
  that.ui.container.hammer({ drag_lock_to_axis:true }).on("release dragleft dragright swipeleft swiperight", that.methods.onHamerHandle);
  that.ui.container.parent().on("touchmove", function(e){ e.preventDefault(); });

  // create and attach videoPlayer to first frame
  that.ui.videoPlayer = $("<div>", {"id":"videoPlayer"});
  $(that.ui.videos.get(0)).find(".video").append(that.ui.videoPlayer);
  that.ui.videoPlayer.utVideo(that.isTouch ? {ui:{play:false, playing:false}} : {});

  // update element position
  post.on("resize", that.methods.onResize);
  that.methods.onResize();

  // enable animation
  setTimeout(function(){ that.ui.container.addClass("slide_animation"); }, 0);

  // allow post
  post.valid(true);

  // show content
  that.ui.container.addClass("show");

  return that;
});
