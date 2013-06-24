/*
 * IMPORTANT -- please attach element to DOM-tree before apply
 */
(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var that = {};
        var $that = $(this);
        this.utSticker = that;

        var defaults = {
          zoom: null,
          classCommon: "utSticker",
          classContent: "content", // content element class name
          classFlip: ".content",
          backObject: "body", // the object to associate events, then user changing element
          design: 1,
          flipContent: true, // flip content when rotate
          moveable: true,
          originalWidth: null,
          originalHeight: null,
          pos: {}, // current element position data,
          useFontSizeWhileScale: false,
          onObjectPositionUpdated: function(pos) {}
        };
        that.params = $.extend(true, defaults, options);
        $that.addClass(that.params.classCommon + " utdesign" + that.params.design);
        that.parentWidth = $that.parent().fullWidth() || $("body").width();
        that.parentHeight = $that.parent().fullHeight() || $("body").height();

        $that.css("position", "absolute");
        if(that.params.zoom !== null) $that.css("fontSize", parseInt(that.params.zoom*100, 10) + "%");

        // get or create content
        if((that._content = $that.find("> ."+that.params.classContent)).length <= 0) {
          that._content = $("<div>").addClass(that.params.classContent).appendTo($that);
        }

        that.updateZoom = function() {
          if(!that.params.useFontSizeWhileScale) return;
          // the original box's size (with scale x1)
          var originalWidth = that.params.originalWidth;
          var originalHeight = that.params.originalHeight;
          if(originalWidth === null || originalWidth === false) originalWidth = $that.fullWidth();
          else
          if(originalHeight === null || originalHeight === false) originalHeight = $that.fullHeight();

          var zoomX = that.params.pos.width/originalWidth;
          var zoomY = that.params.pos.height/originalHeight;
          that._content.css("fontSize", (Math.min(zoomX,zoomY) * 100) + "%");
        };

        that.updateZoom();

        var flip = $that.find(that.params.classFlip);

        that.updateAngle = function() {
          $that.css("WebkitTransform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("MozTransform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("msTransform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("OTransform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("transform", "rotateZ("+that.params.pos.angle+"rad)");
          that.updatePosition(false);
        };

        that.updateContentAngle = function() {
          var ta = 0;
          var aa = that.params.pos.angle; aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
          if(that.params.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) {
            ta = 180;
            $that.addClass("utStickerFlip");
          } else {
            $that.removeClass("utStickerFlip");
          }
          flip.css("WebkitTransform", "rotate("+ta+"deg)")
            .css("MozTransform", "rotate("+ta+"deg)")
            .css("msTransform", "rotate("+ta+"deg)")
            .css("OTransform", "rotate("+ta+"deg)")
            .css("transform", "rotate("+ta+"deg)");
        };

        that.updatePosition = function() {
          if(!that.params.moveable) return;
          $that.posLeft(that.params.pos.left*that.parentWidth).posTop(that.params.pos.top*that.parentHeight)
            .width(that.params.pos.width*that.parentWidth).height(that.params.pos.height*that.parentHeight);
        };

        that.changeOptions = function(newOptions) {
          that.params = $.extend(true, that.params, newOptions);
          that.updateAngle();
          that.updateContentAngle();
          that.updatePosition();
          that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
        };

        that.update = function() {
          that.parentWidth = $that.parent().fullWidth() || $("body").width();
          that.parentHeight = $that.parent().fullHeight() || $("body").height();
          that.updateAngle();
          that.updateContentAngle();
          that.updatePosition();
          that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
        };

        that.updateAngle();
        that.updateContentAngle();
        that.updatePosition();
        that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
      });
    },

    changeOptions: function(options) {
      this.each(function() {
        if(this.utSticker) this.utSticker.changeOptions.call(this, options);
      });
      return this;
    },

    getContent: function() {
      var res = null;
      this.each(function() {
        if(this.utSticker) {
          res ? res.add(this.utSticker._content) : res = $(this.utSticker._content);
        }
      });
      return res;
    },

    update: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.update.call(this);
      });
      return this;
    }
  };

  $.fn.utSticker = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utSticker');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
