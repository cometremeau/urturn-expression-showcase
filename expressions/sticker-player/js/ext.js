(function(jQuery) {
  var methods = {
    init: function(options) {
      this.each(function() {
        var that = {};
        this.thinScrollBar = that;
        var $that = jQuery(this);

        // check if scroll is already added
        if($that.find(".thinScrollBarLine").length > 0 && $that.find(".thinScrollBarCursor").length > 0) {
          return;
        }

        var defaults = {
          // step for mouse wheel scroll
          scrollStep: 25,
          // scroll bar cursor color
          cursorColor: "#808080",
          // scroll bar width
          scrollWidth: 6,
          // scroll bar top padding
          paddingTop: 0,
          // scroll bar bottom padding
          paddingBottom: 0,
          // minimal cursor height
          minCursorHeight: 40,
          // indicate is mouse over the container
          mouseInContainer: false,
          // mouse position when user start drag scroll cursor
          mouseStartPos: 0,
          // scroll cursor position when user start drag it
          cursorStartPos: 0,
          // indicate is user drag cursor
          isMoving: false,
          // indicate that mouse over scroll cursor
          isMouseOverCursor: false,
          // last scroll position
          lastScrollPos: 0
        };
        that.options = jQuery.extend(true, defaults, options);

        that.createScrollItems = function(ext) {
          // create scroll line
          if(!ext || ext === "line") {
            that._scrollLine = jQuery("<div>", {"class":"thinScrollBarLine"}).css({
              "position": "absolute",
              "display": "block",
              "top": that.options.paddingTop + "px",
              "right": "1px",
              "width": (that.options.scrollWidth + "px"),
              "height": $that.height() - that.options.paddingTop - that.options.paddingBottom,
              "z-index": "1000000",
              "background-color": "transparent",
              "background-image": "none",
              "padding": "0",
              "-webkit-transition": "opacity 0.3s linear",
              "-moz-transition": "opacity 0.3s linear",
              "-ms-transition": "opacity 0.3s linear",
              "-o-transition": "opacity 0.3s linear",
              "transition": "opacity 0.3s linear",
              "opacity": "0"
            });
          }
          // create scroll cursor (thumb)
          if(!ext || ext === "cursor") {
            that._scrollCursor = jQuery("<div>", {"class":"thinScrollBarCursor"}).css({
              "position": "absolute",
              "display": "block",
              "top": "0px",
              "left": "0px",
              "width": "100%",
              "height": "40px",
              "z-index": "1000000",
              "border-radius": "4px",
              "background-color": that.options.cursorColor,
              "cursor": "pointer",
              "-webkit-transition": "opacity 0.3s linear",
              "-moz-transition": "opacity 0.3s linear",
              "-ms-transition": "opacity 0.3s linear",
              "-o-transition": "opacity 0.3s linear",
              "transition": "opacity 0.3s linear",
              "opacity": "0.3"
            });
          }
        };

        that.createScrollItems();

        // append scroll elements to container
        that._scrollLine.append(that._scrollCursor);
        $that.append(that._scrollLine);
        if($that.css("position") !== "absolute") {
          $that.css("position", "relative");
        }
        $that.css("overflow-y", "hidden");

        // update scroll position and state
        that._updateScrollBar = function(updateAlways) {

          // check if scroll element was deleted
          if($that.find(".thinScrollBarLine").length <= 0) {
            that.createScrollItems("line");
          }
          if($that.find(".thinScrollBarCursor").length <= 0) {
            that.createScrollItems("cursor");
          }

          // check content and view sizes
          var fullHeight = $that[0].scrollHeight;
          var visibleHeight = $that[0].clientHeight;
          var scrollBarHeight = $that[0].clientHeight - that.options.paddingTop - that.options.paddingBottom;
          if(fullHeight <= visibleHeight) {
            that._scrollLine.css("display", "none");
          } else {
            that._scrollLine.css("display", "block");
          }

          // check changes for scroll
          if(that.options.lastScrollPos === $that.scrollTop() && updateAlways !== true) {
            return;
          }
          if(updateAlways) {
            that._scrollLine.css({"margin-top":0, "height":"1px"});
            that._scrollCursor.css({"height":"1px", "margin-top":0});
            fullHeight = $that[0].scrollHeight;
          }
          that.options.lastScrollPos = $that.scrollTop();

          // calculate new scroll bar and cursor sizes and position
          var ratio = visibleHeight/fullHeight;
          var cursorHeight = Math.max(Math.floor(scrollBarHeight * ratio), that.options.minCursorHeight);
          var deltaPos = that.options.lastScrollPos / (fullHeight - visibleHeight);
          var cursorPos = (scrollBarHeight - cursorHeight) * deltaPos;
          // update items sizes and position
          that._scrollLine.css({"margin-top":that.options.lastScrollPos+"px", "height":scrollBarHeight+"px"});
          that._scrollCursor.css({"height":cursorHeight+"px", "margin-top":Math.floor(cursorPos)+"px"});
          cursorFade();
        };

        var toid = 0;
        var cursorFade = function() {
          if(that.options.isMouseOverCursor || that.options.isMoving) {
            return;
          }
          that._scrollCursor.css("opacity", "0.6");
          if(toid) {
            clearTimeout(toid);
          }
          toid = setTimeout(function(){
            that._scrollCursor.css("opacity", "0.3");
            toid = 0;
          }, 300);
        };

        // mouse wheel event handler
        that._onMouseWheel = function(e) {
          var dx = e.wheelDelta ? e.wheelDelta : (e.detail ? -e.detail : 0);
          $that.scrollTop($that.scrollTop() + (dx > 0 ? -that.options.scrollStep : (dx < 0 ? that.options.scrollStep : 0)));
          that._updateScrollBar();
          e.stopPropagation();
          e.preventDefault();
          return false;
        };

        // resize window event handler
        that._onResize = function(e){
          that._scrollLine.height(parseInt(that._scrollLine.css("height"), 10));
          that._updateScrollBar(true);
        };

        // mouse enter container event handle
        that._onMouseEnter = function(e) {
          if(that.options.isMoving && e.which !== 1) {
            that._onCursorMouseUp();
          }
          that._scrollLine.css("opacity", "1");
          that.options.mouseInContainer = true;
        };

        // mouse leave container event handle
        that._onMouseLeave = function(){
          if(!that.options.isMoving) {
            that._scrollLine.css("opacity", "0");
          }
          that.options.mouseInContainer = false;
        };

        // user push mouse button over scroll cursor
        that._onCursorMouseDown = function(e) {
          if(e.type === "touchstart") {
            if(e.originalEvent.touches.length !== 1) {
              that._onCursorMouseUp(e);
              return;
            }
            that._onMouseEnter({which:1});
            $that.on("touchmove", that._onCursorTouchMove);
            $that.on("touchend touchcancel", that._onCursorTouchUp);
            that.options.mouseStartPos = e.originalEvent.touches[0].pageY;
          } else {
            jQuery("body").on("mousemove", that._onCursorMouseMove);
            jQuery("body").on("mouseup", that._onCursorMouseUp);
            jQuery("body").on("mouseleave", that._onCursorMouseUp);
            that.options.mouseStartPos = e.pageY;
            e.preventDefault();
          }
          that.options.cursorStartPos = parseInt(that._scrollCursor.css("margin-top"), 10);
          that.options.isMoving = true;
        };

        // user move mouse past down on scroll cursor
        that._onCursorMouseMove = function(e) {
          var dy = e.pageY - that.options.mouseStartPos;
          var fullHeight = $that[0].scrollHeight;
          var visibleHeight = $that[0].clientHeight;
          var scrollBarHeight = $that[0].clientHeight - that.options.paddingTop - that.options.paddingBottom;
          var ratio = (scrollBarHeight - that._scrollCursor.height())/(fullHeight - visibleHeight);
          var np = (that.options.cursorStartPos + dy)/ratio;
          if(np !== $that[0].scrollTop) {
            $that[0].scrollTop = np;
            that._updateScrollBar();
          }
          return false;
        };

        that._onCursorTouchMove = function(e) {
          if(!e || e.originalEvent.touches.length !== 1) {
            return false;
          }
          var dy = e.originalEvent.touches[0].pageY - that.options.mouseStartPos;
          $that.scrollTop($that.scrollTop() - dy);
          that.options.mouseStartPos = e.originalEvent.touches[0].pageY;
          that._updateScrollBar();
          return false;
        };

        // user up mouse button when dragged scroll cursor
        that._onCursorMouseUp = function(e) {
          that.options.isMoving = false;
          if(!that.options.mouseInContainer) {
            that._scrollLine.css("opacity", "0");
          }
          if(!that.options.isMouseOverCursor) {
            that._scrollCursor.css("opacity", "0.3");
          }
          jQuery("body").off("mousemove", that._onCursorMouseMove);
          jQuery("body").off("mouseup", that._onCursorMouseUp);
          jQuery("body").off("mouseleave", that._onCursorMouseUp);
          return false;
        };

        that._onCursorTouchUp = function(e) {
          that.options.isMoving = false;
          if(!that.options.mouseInContainer) {
            that._scrollLine.css("opacity", "0");
          }
          if(!that.options.isMouseOverCursor) {
            that._scrollCursor.css("opacity", "0.3");
          }
          that._onMouseLeave();
          $that.off("touchmove", that._onCursorTouchMove);
          $that.off("touchend touchcancel", that._onCursorTouchUp);
        };
        // mouse enter scroll cursor
        that._onCursorMouseEnter = function(){
          that._scrollCursor.css("opacity", "0.6");
          that.options.isMouseOverCursor = true;
        };

        // mouse leave scroll cursor
        that._onCursorMouseLeave = function(){
          that.options.isMouseOverCursor = false;
          if(!that.options.isMoving) {
            that._scrollCursor.css("opacity", "0.3");
          }
        };

        // for first check mouse position
        that._onFirstMouseInitMove = function() {
          $that.unbind("mousemove", that._onFirstMouseInitMove);
          if(that.options.mouseInContainer) {
            return;
          }
          that._onMouseEnter();
        };

        /*
         * public function
         * @description update scroll bar state
         * #param time -- time-out for secord auto-update
         */
        that.update = function(time) {
          that._updateScrollBar(true);
          if(typeof(time) !== 'undefined' && time > 0) {
            setTimeout(function(){ that._updateScrollBar(true); }, time);
          }
        };

        /*
         * public function
         * @description remove all worked events
         */
        that.remove = function() {
          // remove scroll elements
          $that.find(".thinScrollBarLine").remove();
          $that.find(".thinScrollBarCursor").remove();

          // unbind events
          if(that.removeEventListener) {
            that.removeEventListener("DOMMouseScroll", that._onMouseWheel, false);
            that.removeEventListener("mousewheel", that._onMouseWheel, false);
          } else {
            that.onmousewheel = null;
          }

          // detach event listeners
          $that.off("scroll");
          $that.off("resize");
          $that.off("touchstart");
          that._scrollLine.off("mousedown");
          $that.off("mouseenter");
          $that.off("mouseleave");
          that._scrollCursor.off("mouseenter");
          that._scrollCursor.off("mouseleave");
          $that.off("mousemove");
        };

        // bind events
        if($that[0].addEventListener) {
          $that[0].addEventListener("DOMMouseScroll", that._onMouseWheel, false);
          $that[0].addEventListener("mousewheel", that._onMouseWheel, false);
        } else {
          $that[0].onmousewheel = that._onMouseWheel;
        }

        // attach event listeners
        $that.on("scroll", function(){ that._updateScrollBar(); return false; });
        $that.on("resize", that._onResize);
        $that.on("touchstart", that._onCursorMouseDown);
        that._scrollLine.on("mousedown", that._onCursorMouseDown);
        $that.on("mouseenter", that._onMouseEnter);
        $that.on("mouseleave", that._onMouseLeave);
        that._scrollCursor.on("mouseenter", that._onCursorMouseEnter);
        that._scrollCursor.on("mouseleave", that._onCursorMouseLeave);
        $that.on("mousemove", that._onFirstMouseInitMove);

        // first init update scroll bar
        that._updateScrollBar(true);
      });
      return this;
    },

    remove: function() {
      this.each(function() {
        this.thinScrollBar.remove();
      });
      return this;
    },

    update: function(time) {
      this.each(function() {
        this.thinScrollBar.update(time);
      });
      return this;
    }
  };
  jQuery.fn.thinScrollBar = function(method) {
    if (typeof method === 'object' || typeof method === "undefined") {
      return methods.init.apply(this, arguments);
    } else if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
      jQuery.error('Method ' + method + ' does not exist on jQuery.thinScrollBar');
    }
    return this;
  };
})(jQuery);

if(!$.fn.posLeft) {
  $.fn.posLeft = function(n) {
    if(typeof(n) === "undefined") {
      return parseInt(this.css("left"), 10);
    }
    this.css("left", parseInt(n, 10) + "px");
    return this;
  };
}

if(!$.fn.posTop) {
  $.fn.posTop = function(n) {
    if(typeof(n) === "undefined") {
      return parseInt(this.css("top"), 10);
    }
    this.css("top", parseInt(n, 10) + "px");
    return this;
  };
}

if(!$.fn.fullWidth) {
  $.fn.fullWidth = function() {
    var tmp = this.css(["box-sizing","width","padding-left","padding-right","border-left-width","border-right-width"]);
    var sz = tmp.width ? parseInt(tmp.width, 10) : 0;
    if(tmp["box-sizing"] === "content-box") {
      sz += tmp["padding-left"] ? parseInt(tmp["padding-left"],10) : 0;
      sz += tmp["padding-right"] ? parseInt(tmp["padding-right"],10) : 0;
      sz += tmp["border-left-width"] ? parseInt(tmp["border-left-width"],10) : 0;
      sz += tmp["border-right-width"] ? parseInt(tmp["border-right-width"],10) : 0;
    }
    return sz;
  };
}
if(!$.fn.fullHeight) {
  $.fn.fullHeight = function() {
    var tmp = this.css(["box-sizing","height","padding-top","padding-bottom","border-left-width","border-right-width"]);
    var sz = tmp.height ? parseInt(tmp.height, 10) : 0;
    if(tmp["box-sizing"] === "content-box") {
      sz += tmp["padding-top"] ? parseInt(tmp["padding-top"], 10) : 0;
      sz += tmp["padding-bottom"] ? parseInt(tmp["padding-bottom"], 10) : 0;
      sz += tmp["border-top-width"] ? parseInt(tmp["border-top-width"], 10) : 0;
      sz += tmp["border-bottom-width"] ? parseInt(tmp["border-bottom-width"], 10) : 0;
    }
    return sz;
  };
}

if(!$.fn.getBounds) {
  $.fn.getBounds = function(transformObject, refObject) {
    var bounds = {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      width: Number.NaN,
      height: Number.NaN
    };
    if(this.length <= 0) {
      return { left:0,top:0,right:0,bottom:0,width:0,height:0 };
    }
    if(typeof(transformObject) === "undefined" || transformObject === null || transformObject === false) {
      transformObject = this;
    }

    var dx = 0;
    var dy = 0;
    var item,wdt,hgt,trData;
    for(var qq = 0; qq < this.length; qq++) {
      var obj = $(this[qq]);
      var off = obj.offset();
      off.left += dx;
      off.top += dy;
      var ww = obj.width();
      var hh = obj.height();
      if(obj.css("boxSizing") === "border-box" || obj.css("WebkitBoxSizing") === "border-box" || obj.css("OBoxSizing") === "border-box" || obj.css("msBoxSizing") === "border-box" || obj.css("MozBoxSizing") === "border-box") {
        ww += parseInt(obj.css("borderLeftWidth"), 10) + parseInt(obj.css("borderRightWidth"), 10) + parseInt(obj.css("paddingLeft"), 10) + parseInt(obj.css("paddingRight"), 10);
        hh += parseInt(obj.css("borderTopWidth"), 10) + parseInt(obj.css("borderBottomWidth"), 10) + parseInt(obj.css("paddingTop"), 10) + parseInt(obj.css("paddingBottom"), 10);
      }

      var dd = $(transformObject).css("transform");

      /* 'none' -- opera fix */
      if(!dd || dd === "" || dd === "none") {
        dd = $(transformObject).css("OTtransform");
      }
      if(!dd || dd === "" || dd === "none") {
        dd = $(transformObject).css("msTransform");
      }
      if(!dd || dd === "" || dd === "none") {
        dd = $(transformObject).css("MozTransform");
      }
      if(!dd || dd === "" || dd === "none") {
        dd = $(transformObject).css("WebkitTransform");
      }
      if(dd && dd !== "none") {
        trData = dd.match(/matrix\([0-9e\.\,\s\+\-]+\)/);
      }
      if(trData) {
        if(trData[0]) {
          trData = trData[0];
        }
        if(trData) {
          trData = trData.substr(7,dd.length - 8);
        }
        if(trData) {
          trData = trData.split(",");
        }
        if(trData) {
          wdt = Math.abs(ww*parseFloat(trData[0])) + Math.abs(hh*parseFloat(trData[1]));
          hgt = Math.abs(ww*parseFloat(trData[2])) + Math.abs(hh*parseFloat(trData[3]));
        } else {
          wdt = ww;
          hgt = hh;
        }
      } else {
        //rotateZ(0.706688234676948rad)
        trData = dd.match(/rotateZ\(([0-9\.\+\-]+)rad\)/);
        if(trData && trData[1]) {
          wdt = Math.abs(ww*Math.cos(parseFloat(trData[1]))) + Math.abs(hh*Math.sin(parseFloat(trData[1])));
          hgt = Math.abs(ww*Math.sin(parseFloat(trData[1]))) + Math.abs(hh*Math.cos(parseFloat(trData[1])));
        } else {
          wdt = ww;
          hgt = hh;
        }
      }

      // calculate object with full width and height
      off.right = off.left + wdt;
      off.bottom = off.top + hgt;
      if(bounds.left > off.left) {
        bounds.left = off.left;
      }
      if(bounds.top > off.top) {
        bounds.top = off.top;
      }
      if(bounds.right < off.right) {
        bounds.right = off.right;
      }
      if(bounds.bottom < off.bottom) {
        bounds.bottom = off.bottom;
      }
    }
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    if(refObject) {
      var rooff = $(refObject).offset();
      bounds.left -= rooff.left;
      bounds.right -= rooff.left;
      bounds.top -= rooff.top;
      bounds.bottom -= rooff.top;
    }
    return bounds;
  };
}

if(!$.fn.alterClass) {
  $.fn.alterClass = function (removals, additions) {
    var self = this;
    if ( removals.indexOf( '*' ) === -1 ) {
      self.removeClass( removals );
      return !additions ? self : self.addClass( additions );
    }

    var patt = new RegExp( '\\s' +
      removals.
        replace( /\*/g, '[A-Za-z0-9-_]+' ).
        split( ' ' ).
        join( '\\s|\\s' ) +
      '\\s', 'g' );

    self.each( function ( i, it ) {
      var cn = ' ' + it.className + ' ';
      while ( patt.test( cn ) ) {
        cn = cn.replace( patt, ' ' );
      }
      it.className = cn.trim();
    });
    return !additions ? self : self.addClass( additions );
  };
}
