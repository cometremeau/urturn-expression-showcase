(function($) {
  var methods = {
    init: function(options) {
      this.each(function() {
        var that = {};
        this.utStickersBoard = that;
        var $that = $(this);

        var defaults = {
          items: [
            /*
             object: '<div class="img" style="background-image:url(images/Hats/downTonAbbey_hat4.png)"></div>',
             key: "object_key_for_user_identity", -- used for onDelete event
             width:155,
             height:134,
             minSize: { width:0.000001, height:0.000001 },
             maxSize: { width:1, height:1 }
             rotateable: true, // is user can rotate element
             moveable: true, // is user can move element
             scaleable: true, // is user can resize element
             proportionalScale: true,
             deleteButton: false,
            */
          ],
          parameters: [],
          zoom: null,
          classFlip: ".content",
          flipContent: true,
          useTransform: false,
          zIndexByClick: false,
          useFontSizeWhileScale: false,
          onObjectPositionUpdated: function(key, pos){}
        };

        that.options = $.extend(true, defaults, options);
        that.options.zIndexCounter = 1;
        that.parentWidth = $that.fullWidth() || $("body").width();
        that.parentHeight = $that.fullHeight() || $("body").height();

        $that.addClass('utStickersBoard');
        if($that.css("position") == "static") $that.css("position", "relative");

        that.addNewItemToLayer = function(obj, nn, iData) {
          var prm = that.options.parameters[nn] || {};
          if(typeof(prm.left) == "undefined" || typeof(prm.top) == "undefined" || typeof(prm.width) == "undefined" || typeof(prm.height) == "undefined") return;
          var content = $("<div>").addClass("content").appendTo(obj).append(iData.object);
          obj.css("position", "absolute");
          if(that.options.zoom !== null) obj.css("fontSize", parseInt(that.options.zoom*100, 10) + "%");

          // the original box's size (with scale x1)
          if(that.options.originalWidth === null || that.options.originalWidth === false) that.options.originalWidth = obj.fullWidth()/that.parentWidth;
          if(that.options.originalHeight === null || that.options.originalHeight === false) that.options.originalHeight = obj.fullHeight()/that.parentHeight;

          that.updateObjectPosition(obj, prm);
        };

        that.updateObjectPosition = function(obj, prm) {
          // get or create content
          obj.css({
            "left": parseInt(prm.left*that.parentWidth, 10) + "px",
            "top": parseInt(prm.top*that.parentHeight, 10) + "px",
            "width": parseInt(prm.width*that.parentWidth, 10) + "px",
            "height": parseInt(prm.height*that.parentHeight, 10) + "px"
          });

          if(prm.angle) {
            obj.css("WebkitTransform", "rotateZ("+prm.angle+"rad) rotateX(0)")
              .css("MozTransform", "rotateZ("+prm.angle+"rad) rotateX(0)")
              .css("msTransform", "rotate("+prm.angle+"rad)")
              .css("OTransform", "rotateZ("+prm.angle+"rad) rotateX(0)")
              .css("transform", "rotateZ("+prm.angle+"rad) rotateX(0)");

            var ta = 0;
            var aa = prm.angle; aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
            if(that.options.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) {
              ta = 180;
              obj.addClass("utStickerFlip");
            } else {
              obj.removeClass("utStickerFlip");
            }
            var flip = obj.find(that.options.classFlip);
            flip.css("WebkitTransform", "rotate("+ta+"deg)")
              .css("MozTransform", "rotate("+ta+"deg)")
              .css("msTransform", "rotate("+ta+"deg)")
              .css("OTransform", "rotate("+ta+"deg)")
              .css("transform", "rotate("+ta+"deg)");
          }

          var zoomX = prm.width/(iData.originalWidth ? iData.originalWidth : that.options.originalWidth);
          var zoomY = prm.height/(iData.originalHeight ? iData.originalHeight : that.options.originalHeight);
          if(that.options.useFontSizeWhileScale) {
            obj.find(".content").css("fontSize", (Math.min(zoomX,zoomY) * 100) + "%");
          }

          // update object z-index
          if(that.options.zIndexByClick) {
            if(!prm.zIndex) prm.zIndex = ++that.options.zIndexCounter;
            else if(prm.zIndex > that.options.zIndexCounter) that.options.zIndexCounter = prm.zIndex;
            obj.css("zIndex", prm.zIndex);
          }
          try {
            that.options.onObjectPositionUpdated(iData.key, prm);
          } catch(e) { console.log("!!! exception:", e); }
        };

        that.update = function() {
          that.parentWidth = $that.fullWidth() || $("body").width();
          that.parentHeight = $that.fullHeight() || $("body").height();
          for(var nn in that.options.items) {
            var obj = $that.find(".utStickersBoard_box[data-key='"+that.options.items[nn].key+"']");
            that.updateObjectPosition(obj, that.options.parameters[nn]);
          }
        };

        for(var nn in that.options.items) {
          var iData = that.options.items[nn];
          var obj = $("<div>").addClass("utStickersBoard_box utSticker").attr("data-key", iData.key).appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
        }
      });
      return this;
    },

    update: function() {
      this.each(function() {
        if(this.utStickersBoard) this.utStickersBoard.update.call(this);
      });
      return this;
    }
  };

  $.fn.utStickersBoard = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utStickersBoard');
    }
    return this;
  };

})(window.jQuery || window.Zepto || window.jq);
