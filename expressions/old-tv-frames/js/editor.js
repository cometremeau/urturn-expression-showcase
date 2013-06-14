UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  that.ui = {};
  that.data = {};
  that.methods = {};

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
  that.data.currentElement = typeof(post.storage.design) !== "undefined" ? post.storage.design : Math.floor(that.ui.videos.length / 2);
  that.data.frameRatios = [576/360, 576/480, 576/319, 576/473];
  that.data.videoRatio = 576/360;
  that.data.itemWidth = 0;
  that.data.itemHeight = 0;
  that.data.expWidth = 0;
  that.data.expHeight = 0;
  that.data.isPlayed = false;

  /**
   * change styles in list positions
   */
  that.methods.updateElementPosition = function() {
    var isVert = (that.data.expWidth < that.data.expHeight);
    var qq, tmp, obj;
    var offX = 0;
    var offY = 0;
    var scx = 1;
    var scy = 1;

    // check and save selected frame number
    if(that.data.currentElement < 0) {
      that.data.currentElement = 0;
    }
    if(that.data.currentElement >= that.ui.videos.length) {
      that.data.currentElement = that.ui.videos.length-1;
    }
    post.storage.design = that.data.currentElement;
    post.storage.ratio = that.data.videoRatio = that.data.frameRatios[that.data.currentElement]; // videoRatio;
    post.storage.save();

    that.methods.onResize(false);

    // update elements position
    for(qq = 0; qq < that.ui.videos.length; qq++) {
      // calculate frame size and position
      var numOff = qq - that.data.currentElement;
      if(isVert) {
        if(qq <= that.data.currentElement) {
          tmp = that.data.currentElement > 0 ? (that.data.expHeight - that.data.itemHeight) / 2 / that.data.currentElement : 0;
        } else {
          tmp = (that.ui.videos.length - that.data.currentElement - 1) > 0 ? (that.data.expHeight - that.data.itemHeight) / 2 / (that.ui.videos.length - that.data.currentElement - 1) : 0;
        }
        offY = tmp * numOff;
        scx = scy = 1 - Math.abs(numOff)*0.03; // decrase to 3% by step
      } else {
        if(qq <= that.data.currentElement) {
          tmp = that.data.currentElement > 0 ? (that.data.expWidth - that.data.itemWidth) / 2 / that.data.currentElement : 0;
        } else {
          tmp = (that.ui.videos.length - that.data.currentElement - 1) > 0 ? (that.data.expWidth - that.data.itemWidth) / 2 / (that.ui.videos.length - that.data.currentElement - 1) : 0;
        }
        offX = tmp * numOff;
        scx = scy = 1 - Math.abs(numOff)*0.03; // decrase to 3% by step
      }

      // update frame position and size
      obj = $(that.ui.videos[qq]);
      obj.css({
        "-webkit-transform": "translate("+offX+"px,"+offY+"px) scale("+scx.toFixed(8)+","+scy.toFixed(8)+") rotateZ(0)",
        "-moz-transform": "translate("+offX+"px,"+offY+"px) scale("+scx.toFixed(8)+","+scy.toFixed(8)+") rotateZ(0)",
        "-ms-transform": "translate("+offX+"px,"+offY+"px) scale("+scx.toFixed(8)+","+scy.toFixed(8)+") rotateZ(0)",
        "-o-transform": "translate("+offX+"px,"+offY+"px) scale("+scx.toFixed(8)+","+scy.toFixed(8)+") rotateZ(0)",
        "transform": "translate("+offX+"px,"+offY+"px) scale("+scx.toFixed(8)+","+scy.toFixed(8)+") rotateZ(0)",
        "z-index": 100 - Math.abs(numOff)
      });
    }

    // update styleSwitcher
    obj = that.ui.styleSwitcher.find("ul li");
    obj.removeClass("selected");
    obj = $(obj.get(that.data.currentElement));
    obj.addClass("selected");

    // change "selected" state
    that.ui.videos.removeClass("selected");
    $(that.ui.videos[that.data.currentElement]).addClass("selected");

    // update videoPlayer position
    obj = $(that.ui.videos[that.data.currentElement]).find(".video");
    if(obj.find("#videoPlayer").length <= 0) {
      /* IE: remove object and create new -- fix with iframe troubles */
      if($.browser.msie) {
        that.ui.videoPlayer.off("utVideo:finish", that.methods.onPlayFinished);
        that.ui.videoPlayer.utVideo("destroy");
        that.ui.videoPlayer.remove();

        that.ui.videoPlayer = $("<div>", {"id":"videoPlayer"});
        obj.append(that.ui.videoPlayer);
        that.ui.videoPlayer.utVideo();
        that.ui.videoPlayer.on("utVideo:finish", that.methods.onPlayFinished);
      } else {
        that.ui.videoPlayer.detach();
        obj.append(that.ui.videoPlayer);
      }
    }
  };

  /**
   * handle tap and swipe events
   */
  that.methods.onHamerHandle = function(e) {
    var obj, off = 0;
    switch(e.type) {
      case "dragright":
      case "dragleft":
      case "swipeleft":
      case "swiperight":
        // process left-right swipe
        if(that.data.expWidth < that.data.expHeight) {
          return;
        }
        off = e.gesture.deltaX;
        e.gesture.stopDetect();
        break;

      case "dragup":
      case "dragdown":
      case "swipeup":
      case "swipedown":
        // process up-down swipe
        if(that.data.expWidth > that.data.expHeight) {
          return;
        }
        off = e.gesture.deltaY;
        e.gesture.stopDetect();
        break;

      case "tap":
        // process tap to frame
        obj = $(e.target);
        if(!obj.hasClass("video_element")) {
          obj = obj.closest(".video_element");
        }
        if(!obj) {
          return;
        }
        that.data.currentElement = that.ui.videos.index(obj[0]);
        that.methods.updateElementPosition();
        break;

      default:
        break;
    }

    if(off > 0) {
      that.methods.toPrev();
    } else if(off < 0) {
      that.methods.toNext();
    }
  };

  /**
   * move to next frame
   */
  that.methods.toNext = function(e) {
    console.log("that.methods.toNext");
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
    console.log("that.methods.toPrev");
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

    var objs = $(".video_element");
    objs.each(function(n, item){
      var ratio = that.data.frameRatios[n];

      // calculate new video frame size
      var itemWidth, itemHeight;
      if(that.data.expWidth/ratio > that.data.expHeight) {
        itemWidth = that.data.expHeight * ratio;
        itemHeight = that.data.expHeight;
      } else {
        itemWidth = that.data.expWidth;
        itemHeight = that.data.expWidth / ratio;
      }

      if(n === that.data.currentElement) {
        that.data.itemWidth = itemWidth;
        that.data.itemHeight = itemHeight;
      }

      // update frames sizes and scale
      $(item).css({
        "margin-left": -Math.round(itemWidth / 2) + "px",
        "margin-top": -Math.round(itemHeight / 2) + "px",
        "width": itemWidth + "px",
        "height": itemHeight + "px",
        "font-size": ($.browser.mobile ? itemWidth/3.2 : itemWidth/5.76) + "%"
      });
    });
    // for non mobile mode --- change container position
    if(!$.browser.mobile) {
      that.ui.container.css({
        "left": Math.round((that.data.expWidth - that.data.itemWidth)/2) + "px",
        "top": Math.round((that.data.expHeight - that.data.itemHeight)/2) + "px",
        "width": that.data.itemWidth + "px",
        "height": that.data.itemHeight + "px"
      });
    }

    if(noUpdPos !== false) {
      that.methods.updateElementPosition();
    }
  };

  /**
   * video playing started
   */
  that.methods.onPlay = function() {
    that.ui.container.removeClass("playing paused").addClass("playing");
    that.data.isPlayed = true;
  };

  /**
   * video playing stopped
   */
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
    that.ui.container.hammer({ drag_lock_to_axis:true }).on("tap release dragleft dragright swipeleft swiperight dragup dragdown swipeup swipedown", that.methods.onHamerHandle);
    that.ui.container.parent().on("touchmove", function(e){ e.preventDefault(); });
  } else {
    that.ui.prev.on("click", that.methods.toPrev);
    that.ui.next.on("click", that.methods.toNext);
    that.ui.styleSwitcher.on("click", "ul li", that.methods.onChangeStyleClick);
  }

  // create and attach videoPlayer to first frame
  that.ui.videoPlayer = $("<div>", {"id":"videoPlayer"});
  $(that.ui.videos.get(0)).find(".video").append(that.ui.videoPlayer);
  that.ui.videoPlayer.utVideo({ ui:{ play:false, playing:false } });
  that.ui.videoPlayer.on("utVideo:play", that.methods.onPlay);
  that.ui.videoPlayer.on("utVideo:pause", that.methods.onPause);
  that.ui.videoPlayer.on("utVideo:stop", that.methods.onPause);
  that.ui.videoPlayer.on("utVideo:finish", that.methods.onPause);
  that.ui.videoPlayer.on("utVideo:error", that.methods.onPause);

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
