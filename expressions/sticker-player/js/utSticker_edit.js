/*
 * $.fn.utSticker
 * IMPORTANT -- please attach element to DOM-tree before apply
 * @params options - Object
 *  edit: false
 *  classResize: "resize icon_move" -- resize button class name
 *  classRotate: "rotate icon_rotate" -- rotate button class name
 *  classRemove: "remove icon_delete" -- remove button class name
 *  classEdit: "edit" -- remove button class name
 *  classContent: "content" -- class name for content box for items.
 *  classFlip: ".content" -- class-selector for find flipped object.
 *  resizeTitle: "resize" -- title for resize button
 *  rotateTitle: "rotate" -- title for rotate button
 *  removeTitle: "remove" -- title for remove button
 *  editTitle: "edit" -- title for edit button
 *  backObject: "body" -- class-selector for back object for catch events.
 *  design: 0 -- type of design.
 *  flipContent: true -- is need to flip content.
 *  useBounds: true -- use bounds to calculate items position.
 *  rotateable: true -- is user can rotate items.
 *  moveable: true --  is user can move items.
 *  scaleable: true -- is user can resize items.
 *  proportionalScale: true -- use proportional scale for items.
 *  pos: {} -- objects with item's position data (in percent (%), ex. angle).
 *  movableArea: undefined -- the area where ibject can be placed. The parameters can be as "1+0.5"
 *  minSize: { width:0.000001, height:0.000001 } -- minimal size for element ( in percent (%))
 *  maxSize: { width:Number.Infinity, height:Number.Infinity } -- maximal size for element ( in percent (%))
 *  originalWidth: null --  in percent (%)
 *  originalHeight: null -- in percent (%)
 *  workMode: 0 -- work mode, where: 0 - use different button for rotate and scale, 0 - use one button for rotate and scale (only for proportional resize).
 *  useTransform: false -- user transform CSS style for items.
 *  deleteButton: true -- is show delete button for items.
 *  editButton: false -- is need to show edit button
 *  additionButtons: [] -- additional buttons ex: [{class:'mybutton',title:'click me'},...]
 *  useFontSizeWhileScale: false -- apply 'font-size' CSS value to content of item with scale value.
 *  snapToGrid: true -- snap items rotation to grid (0 and 90 deg).
 *
 *  onUserDetect: function() {} -- callback while user was start to do anything.
 *  onClickDetected: function() {} -- user end interact with item but not move them
 *  onChanging: function(data) {} -- callback while user changing item position/size/angle.
 *  onChanged: function(data) {} -- callback while user changed item position/size/angle.
 *  onRemoveClick: function() {} -- callback while user delete item.
 *  onEditClick: function() {} -- callback while user click to "edit".
 *  onAddButtonClick: function(id) {} -- user click to user's defined button
 *  onSelected: function(key) {} -- user select item.
 *  onObjectPositionUpdated: function(pos) {} -- the item position was changed.
 *  onFocus: function() {} -- the object catch focus and switch to focused mode.
 *  onBlur: function() {} -- the object last focus.
 *
 * @commands edit -- switch to edit mode.
 * @commands view -- switch to view mode.
 * @commands breakUserEvents -- break all user event and manupilations.
 * @commands getContent -- get ref to content object for this item.
 * @commands changeOptions -- change item data. As params -- options as Object.
 * @commands setFocus -- set focus to element.
 * @commands killFocus -- kill element focus.
 * @commands getWorkedParams -- get params (WARNING! it's not safe to use it)
 * @commands getPosition -- return position of element through callback
 * @commands setPosition -- set new position by retrieved params
 * @commands update -- update sticker position by new parent size (is subCommand set as noRatio -- recalculate size and pos)
 */

/*
 */
(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var that = {};
        var $that = $(this);
        this.utSticker = that;

        var defaults = {
          edit: true, // is user can edit element
          zoom: null, // global scale value
          classCommon: "utSticker",
          classFocus: "utSticker_focus",
          classResize: "resize icon_move", // resize button class name
          classRotate: "rotate icon_rotate", // rotate button class name
          classRemove: "remove icon_delete", // remove button class name
          classEdit:   "edit icon_edit", // edit button class name
          classContent: "content", // content element class name
          classFlip: ".content", // flipped element class name
          resizeTitle: "resize", // title for resize button
          rotateTitle: "rotate", // title for rotate button
          removeTitle: "remove", // title for remove button
          editTitle: "edit", // title for edit button
          additionButtons: [], // additional buttons ex: [{class:'mybutton',title:'click me'},...]
          backObject: "body", // the object to associate events, then user changing element
          design: 6,
          flipContent: true, // flip content when rotate
          rotateButtons: true, // rotate button when object rotated
          useBounds: true, // the bounds parameters to validate move
          rotateable: true, // is user can rotate element
          moveable: true, // is user can move element
          scaleable: true, // is user can resize element
          proportionalScale: false, // save proportions when user resize element
          pos: {}, // current element position, size and angle ( in percent (%), ex. angle)
          movableArea: { // the area where element can be moved
            left: -Number.Infinity,
            top: -Number.Infinity,
            width: Number.Infinity,
            height: Number.Infinity
          },  // in percent (%)
          movableAreaCorr: { left: 0, top: 0, right: 0, bottom: 0 }, // correction
          minSize: { width:0.000001, height:0.000001 }, // minimal size for element ( in percent (%))
          maxSize: { width:Number.Infinity, height:Number.Infinity }, // maximal size for element ( in percent (%))
          originalWidth: null, // in percent (%)
          originalHeight: null, // in percent (%)
          // when element zooming by mouse, do it from center
          mouseZoomFromCenter: true,
          // working mode
          //  0 - different resize and rotate for mouse and touches for mobile
          //  1 - one button for resize and rotate for desktop and mobile
          workMode: 0,
          useTransform: false,
          deleteButton: false, // is show delete button
          editButton: false,   // is show edit button
          useFontSizeWhileScale: false, // change font-size for container while item resizing
          snapToGrid: true,    // snap angle to 0 or 90 deg
          minAngle: -100,
          maxAngle: 100,
          onUserDetect: function() {}, // user start interact with item
          onSimpleClick: function() {}, // user end interact with item but not move them
          onDblClick: function() {}, // user double click to item
          onChanging: function(data) {}, // the item position changing
          onChanged: function(data) {}, // the item position changed
          onRemoveClick: function() {}, // user click to "remove" button
          onEditClick: function() {}, // user click to "edit" button
          onAddButtonClick: function(id) {}, // user click to user's defined button
          onObjectPositionUpdated: function(pos) {}, // object changed his position
          onFocus: function() {}, // item focused
          onBlur: function() {}, // item last focus
          // variables for inner use
          zoomData: {}
        };

        that.stopBubble = function(e){
          if(e.stopPropagation) {
            e.stopPropagation();
          }
        };

        that.updateParentSize = function() {
          that.parentWidth = $that.parent().width() || $("body").width();
          that.parentHeight = $that.parent().height() || $("body").height();
        };

        that.parseMoveableArea = function(ma) {
          var tmp = ma.left.toString(10).match(/[\+\-]?[\d\.]+/ig);
          that.params.movableArea.left = tmp && typeof(tmp[0]) !== "undefined" ? parseFloat(tmp[0]) : -Number.Infinity;
          that.params.movableAreaCorr.left = tmp && typeof(tmp[1]) !== "undefined" ? parseFloat(tmp[1]) : 0;
          tmp = ma.top.toString(10).match(/[\+\-]?[\d\.]+/ig);
          that.params.movableArea.top = tmp && typeof(tmp[0]) !== "undefined" ? parseFloat(tmp[0]) : -Number.Infinity;
          that.params.movableAreaCorr.top = tmp && typeof(tmp[1]) !== "undefined" ? parseFloat(tmp[1]) : 0;
          tmp = ma.width.toString(10).match(/[\+\-]?[\d\.]+/ig);
          that.params.movableArea.width = tmp && typeof(tmp[0]) !== "undefined" ? parseFloat(tmp[0]) : Number.Infinity;
          that.params.movableAreaCorr.right = tmp && typeof(tmp[1]) !== "undefined" ? parseFloat(tmp[1]) : 0;
          tmp = ma.height.toString(10).match(/[\+\-]?[\d\.]+/ig);
          that.params.movableArea.height = tmp && typeof(tmp[0]) !== "undefined" ? parseFloat(tmp[0]) : Number.Infinity;
          that.params.movableAreaCorr.bottom = tmp && typeof(tmp[1]) !== "undefined" ? parseFloat(tmp[1]) : 0;
        };

        that.params = $.extend(true, defaults, options);
        if(options.movableArea) {
          that.parseMoveableArea(options.movableArea);
        }
        that.focused = null;
        that.curBounds = {};
        that.gridAngle = 3;
        that.isMobile = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints > 0));
        that.isMSIE = navigator.userAgent.indexOf("MSIE") !== -1;

        $that.addClass(that.params.classCommon + " utdesign" + that.params.design);

        that.updateParentSize();
        $that.css("position", "absolute");
        if(that.isMobile) {
          $that.addClass("mobile");
        }
        if(that.params.zoom !== null) {
          $that.css("fontSize", parseInt(that.params.zoom*100, 10) + "%");
        }

        // the current box's size
        if(typeof(that.params.pos.width) === "undefined") {
          that.params.pos.width = that.params.originalWidth ? that.params.originalWidth : ($that.fullWidth()/that.parentWidth);
        }
        if(typeof(that.params.pos.height) === "undefined") {
          that.params.pos.height = that.params.originalHeight ? that.params.originalHeight : ($that.fullHeight()/that.parentHeight);
        }
        // the current box's position
        if(typeof(that.params.pos.left) === "undefined") {
          that.params.pos.left = $that.posLeft()/that.parentWidth;
        }
        if(isNaN(that.params.pos.left)) {
          that.params.pos.left = (that.params.movableArea.width - that.params.pos.width)/2 + that.params.movableArea.left;
        }
        if(typeof(that.params.pos.top) === "undefined") {
          that.params.pos.top = $that.posTop()/that.parentHeight;
        }
        if(isNaN(that.params.pos.top)) {
          that.params.pos.top = (that.params.movableArea.height - that.params.pos.height)/2 + that.params.movableArea.top;
        }
        // the angle in radians
        if(typeof(that.params.pos.angle) === "undefined") {
          that.params.pos.angle = 0;
        }
        // the original box's size (with scale x1)
        if(that.params.originalWidth === null || that.params.originalWidth === false) {
          that.params.originalWidth = $that.fullWidth()/that.parentWidth;
        }
        if(that.params.originalHeight === null || that.params.originalHeight === false) {
          that.params.originalHeight = $that.fullHeight()/that.parentHeight;
        }
        // scale value for X and Y osis
        if(typeof(that.params.zoomData.zoomX) === "undefined") {
          that.params.zoomData.zoomX = that.params.pos.width/that.params.originalWidth;
        }
        if(typeof(that.params.zoomData.zoomY) === "undefined") {
          that.params.zoomData.zoomY = that.params.pos.height/that.params.originalHeight;
        }

        // get or create edit button
        if((that._edit = $that.children("."+that.params.classEdit.replace(/\s/g,"."))).length <= 0) {
          if(that.params.editButton) {
            that._edit = $("<a>").addClass("controlButtons " + that.params.classEdit).attr("title", that.params.editTitle).appendTo($that);
          }
        }

        // get or create rotate button
        if((that._rotate = $that.children("."+that.params.classRotate.replace(/\s/g,"."))).length <= 0) {
          that._rotate = $("<a>").addClass("controlButtons " + that.params.classRotate).attr("title", that.params.rotateTitle).appendTo($that);
        }

        // get or create remove button
        if((that._remove = $that.children("."+that.params.classRemove.replace(/\s/g,"."))).length <= 0) {
          if(that.params.deleteButton) {
            that._remove = $("<a>").addClass("controlButtons " + that.params.classRemove).attr("title", that.params.removeTitle).appendTo($that);
          }
        }

        // create additional buttons
        for(var qq = 0; qq < that.params.additionButtons.length; qq++) {
          var abttn = $("<a>").addClass("controlButtons " + that.params.additionButtons[qq]['class']).attr("data-user-class", that.params.additionButtons[qq]['class']).attr("title", that.params.additionButtons[qq].title).appendTo($that);
          abttn.on("mousedown touchstart", function(e) {
            that.preventButtonEvents = 3;
            e.stopPropagation();
            return false;
          });
          abttn.on("mouseup touchend", function(e) {
            if(that.preventButtonEvents !== 3) {
              return;
            }
            var id = $(this).attr("data-user-class");
            that.params.onAddButtonClick.call($that[0], id);
            e.stopPropagation();
            return false;
          });
        }

        // get or create resize button if mode = 0
        if(that.params.workMode === 1) {
          that._resize = null;
          that.params.proportionalScale = true;
        } else {
          if((that._resize = $that.children("."+that.params.classResize.replace(/\s/g,"."))).length <= 0) {
            that._resize = $("<a>").addClass("controlButtons " + that.params.classResize).attr("title", that.params.resizeTitle).appendTo($that);
          }
        }

        // get or create content
        if((that._content = $that.children("."+that.params.classContent)).length <= 0) {
          that._content = $("<div>").addClass(that.params.classContent).appendTo($that);
        }
        that._flip = $that.find(that.params.classFlip);

        if(that._remove && that._remove.length > 0) {
          that._remove.on(that.isMobile ? "touchstart" : "mousedown", function(e) {
            that.preventButtonEvents = 1;
            e.stopPropagation();
            return false;
          });
          that._remove.on(that.isMobile ? "touchend" : "mouseup", function(e) {
            if(that.preventButtonEvents !== 1) return;
            that.params.onRemoveClick.call($that[0]);
            e.stopPropagation();
            return false;
          });
          that._remove.on("click", that.stopBubble);
        }

        if(that._edit && that._edit.length > 0) {
          that._edit.on(that.isMobile ? "touchstart" : "mousedown", function(e) {
            that.preventButtonEvents = 2;
            e.stopPropagation();
            return false;
          });
          that._edit.on(that.isMobile ? "touchend" : "mouseup", function(e) {
            if(that.preventButtonEvents !== 2) {
              return;
            }
            that.params.onEditClick.call($that[0]);
            e.stopPropagation();
            return false;
          });
        }

        if(!that.params.rotateable && that._rotate && that._rotate.length > 0) that._rotate.css("display", "none");
        if(!that.params.scaleable && that._resize && that._resize.length > 0) that._resize.css("display", "none");
        if(!that.params.moveable) {
          $that.css("cursor", "auto");
        }

        /********************************************************************************
         * update item position and size by transform
         ********************************************************************************/
        that.updateObjectByTransform = function() {
          // update scale and rotation by css-transform
          var viewAngle = that.params.pos.angle;
          if(that.params.snapToGrid) {
            viewAngle =
              (
                Math.abs(Math.cos(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180) ||
                Math.abs(Math.sin(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
              ) ? (Math.round(that.params.pos.angle/(Math.PI/2)) * (Math.PI/2)) : that.params.pos.angle;
          }
          $that.css("WebkitTransform", "rotateZ("+viewAngle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")");
          $that.css("MozTransform", "rotateZ("+viewAngle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")");
          $that.css("msTransform", "rotate("+viewAngle+"rad) scaleX("+that.params.zoomData.zoomX+") scaleY("+that.params.zoomData.zoomY+")");
          $that.css("OTransform", "rotateZ("+viewAngle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")");
          $that.css("transform", "rotateZ("+viewAngle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")");

          if(that.params.moveable) {
            $that.posLeft(that.params.pos.left*that.parentWidth).posTop(that.params.pos.top*that.parentHeight);
          }
        };

        /********************************************************************************
         * apply rotation to item
         * also call:
         *  that.rotateButtons
         *  that.updateContentAngle
         ********************************************************************************/
        that.updateAngle = function() {
          // update only rotation by css-transform
          if(that.params.useTransform) {
            that.updateObjectByTransform();
          } else {
            var viewAngle = that.params.pos.angle;
            if(that.params.snapToGrid) {
              viewAngle =
                (
                  Math.abs(Math.cos(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180) ||
                  Math.abs(Math.sin(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
                ) ? (Math.round(that.params.pos.angle/(Math.PI/2)) * (Math.PI/2)) : that.params.pos.angle;
            }

            var tmpVal = "rotateZ("+viewAngle+"rad) rotateX(0)";
            if(that.isMSIE) {
              tmpVal = "rotate("+viewAngle+"rad)";
            }
            $that.css("WebkitTransform", tmpVal);
            $that.css("MozTransform", tmpVal);
            $that.css("msTransform", tmpVal);
            $that.css("OTransform", tmpVal);
            $that.css("transform", tmpVal);
          }
          if(that.params.rotateButtons) that.rotateButtons();
          if(that.params.flipContent) that.updateContentAngle();
        };

        /********************************************************************************
         * apply flip-rotation to content of item
         ********************************************************************************/
        that.updateContentAngle = function() {
          var ta = 0;
          var aa = that.params.pos.angle;
          if(that.params.snapToGrid) {
            aa =
              (
                Math.abs(Math.cos(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180) ||
                Math.abs(Math.sin(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
              ) ? (Math.round(that.params.pos.angle/(Math.PI/2)) * (Math.PI/2)) : that.params.pos.angle;
          }
          aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
          if(that.params.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) {
            ta = 180;
            $that.addClass("utStickerFlip");
          } else {
            $that.removeClass("utStickerFlip");
          }
          that._flip.css("WebkitTransform", "rotate("+ta+"deg)")
            .css("Moztransform", "rotate("+ta+"deg)")
            .css("msTransform", "rotate("+ta+"deg)")
            .css("OTransform", "rotate("+ta+"deg)")
            .css("transform", "rotate("+ta+"deg)");
        };

        /********************************************************************************
         * apply rotation to buttons
         ********************************************************************************/
        that.rotateButtons = function() {
          var viewAngle = that.params.pos.angle;
          if(that.params.snapToGrid) {
            viewAngle =
              (
                Math.abs(Math.cos(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180) ||
                Math.abs(Math.sin(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
                ) ? (Math.round(that.params.pos.angle/(Math.PI/2)) * (Math.PI/2)) : that.params.pos.angle;
          }
          viewAngle *= -1;
          var tmp = $that.find(".controlButtons");
          if(tmp && tmp.length > 0) {
            var tmpVal = "rotateZ("+viewAngle+"rad) rotateX(0)";
            if(that.isMSIE) {
              tmpVal = "rotate("+viewAngle+"rad)";
            }

            tmp.css("WebkitTransform", tmpVal)
              .css("MozTransform", tmpVal)
              .css("msTransform", tmpVal)
              .css("OTransform", tmpVal)
              .css("transform", tmpVal);
          }
        };

        /********************************************************************************
         * validate object size by bounds rect
         * @return
         *  true -- is position updated
         *  false -- if position not changed
         ********************************************************************************/
        that.checkSizeInBounds = function() {
          var asc = Math.min(that.params.movableArea.width/that.curBounds.width, that.params.movableArea.height/that.curBounds.height);
          if(asc < 1) {
            that.params.zoomData.zoomX *= asc;
            that.params.zoomData.zoomY *= asc;
            return true;
          }
          return false;
        };

        /********************************************************************************
         * update item size
         * ! except in "useTransform" mode
         ********************************************************************************/
        that.updateSize = function() {
          if(that.params.useTransform) return;
          $that.width(that.params.pos.width*that.parentWidth).height(that.params.pos.height*that.parentHeight);
        };

        /********************************************************************************
         * update item position and bounds info
         ********************************************************************************/
        that.updatePosition = function() {
          if(that.params.useTransform) {
            that.updateObjectByTransform();
          } else {
            $that.posLeft(parseInt(that.params.pos.left*that.parentWidth, 10)).posTop(parseInt(that.params.pos.top*that.parentHeight, 10));
          }
        };

        /********************************************************************************
         * update item's bounds data
         ********************************************************************************/
        that.updateBoundsInfo = function() {
          if(!that.params.useBounds) {
            return;
          }
          that.curBounds = $that.getBounds(false, $that.parent());
          // translate to percent values
          that.curBounds.left /= that.parentWidth;
          that.curBounds.width /= that.parentWidth;
          that.curBounds.top /= that.parentHeight;
          that.curBounds.height /= that.parentHeight;
          /* display debug bound rect */
//          var tmp = $that.parent();
//          var rr = tmp.find(".debugBoundsRect");
//          if(rr.length <= 0) rr = $("<div>", {"class":"debugBoundsRect"}).appendTo(tmp);
//          rr.css({
//            "position": "absolute",
//            "display": "block",
//            "border": "1px solid #ff0000",
//            "left": (that.curBounds.left * that.parentWidth) + "px",
//            "top": (that.curBounds.top * that.parentHeight) + "px",
//            "width": (that.curBounds.width * that.parentWidth) + "px",
//            "height": (that.curBounds.height * that.parentHeight) + "px",
//            "z-index": "100000000",
//            "pointer-events": "none"
//          })
        };

        /********************************************************************************
         * validate item position
         * @return
         *  true -- if position was changed
         *  false -- if position not changed
         ********************************************************************************/
        that.validatePosition = function() {
          if(!that.params.moveable) {
            that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
            return false;
          }

          var updatePos = false;

          // without using bounds
          if(!that.params.useBounds) {
            if(that.params.pos.left < that.params.movableArea.left + that.params.movableAreaCorr.left*that.curBounds.width) {
              that.params.pos.left = that.params.movableArea.left + that.params.movableAreaCorr.left*that.curBounds.width;
              updatePos = true;
            }
            if(that.params.pos.top < that.params.movableArea.top + that.params.movableAreaCorr.top*that.curBounds.height) {
              that.params.pos.top = that.params.movableArea.top + that.params.movableAreaCorr.top*that.curBounds.height;
              updatePos = true;
            }
            if((that.params.pos.left + that.params.pos.width) > (that.params.movableArea.left + that.params.movableArea.width + that.params.movableAreaCorr.right*that.curBounds.width)) {
              that.params.pos.left = (that.params.movableArea.left + that.params.movableArea.width + that.params.movableAreaCorr.right*that.curBounds.width) - that.params.pos.width;
              updatePos = true;
            }
            if((that.params.pos.top + that.params.pos.height) > (that.params.movableArea.top + that.params.movableArea.height + that.params.movableAreaCorr.bottom*that.curBounds.height)) {
              that.params.pos.top = (that.params.movableArea.top + that.params.movableArea.height + that.params.movableAreaCorr.bottom*that.curBounds.height) - that.params.pos.height;
              updatePos = true;
            }
            if(updatePos) {
              that.updatePosition();
              that.updateBoundsInfo();
              that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
            }
            return updatePos;
          }

          // check position
          if(that.curBounds.left < that.params.movableArea.left + that.params.movableAreaCorr.left*that.curBounds.width) {
            that.params.pos.left += that.params.movableArea.left + that.params.movableAreaCorr.left*that.curBounds.width - that.curBounds.left;
            updatePos = true;
          }
          if(that.curBounds.top < that.params.movableArea.top + that.params.movableAreaCorr.top*that.curBounds.height) {
            that.params.pos.top += that.params.movableArea.top + that.params.movableAreaCorr.top*that.curBounds.height - that.curBounds.top;
            updatePos = true;
          }
          if((that.curBounds.left + that.curBounds.width) > (that.params.movableArea.left + that.params.movableArea.width + that.params.movableAreaCorr.right*that.curBounds.width)) {
            that.params.pos.left -= (that.curBounds.left + that.curBounds.width) - (that.params.movableArea.left + that.params.movableArea.width + that.params.movableAreaCorr.right*that.curBounds.width);
            updatePos = true;
          }
          if((that.curBounds.top + that.curBounds.height) > (that.params.movableArea.top + that.params.movableArea.height + that.params.movableAreaCorr.bottom*that.curBounds.height)) {
            that.params.pos.top -= (that.curBounds.top + that.curBounds.height) - (that.params.movableArea.top + that.params.movableArea.height + that.params.movableAreaCorr.bottom*that.curBounds.height);
            updatePos = true;
          }
          if(updatePos) {
            that.updatePosition();
            that.updateBoundsInfo();
            that.params.onObjectPositionUpdated.call($that[0], that.params.pos);
          }
          return updatePos;
        };

        /********************************************************************************
         * set zoom value by width/height
         ********************************************************************************/
        that.updateZoomValueBySize = function() {
          that.params.zoomData.zoomX = that.params.pos.width / that.params.originalWidth;
          that.params.zoomData.zoomY = that.params.pos.height / that.params.originalHeight;
        };

        /********************************************************************************
         * check item size for min and max values
         ********************************************************************************/
        that.correctSizeByZoom = function() {
          if(that.params.proportionalScale) {
            that.params.zoomData.zoomX = that.params.zoomData.zoomY = (that.params.zoomData.zoomX + that.params.zoomData.zoomY) / 2;
          }

          // cur width and height in percent
          var ww = that.params.zoomData.zoomX * that.params.originalWidth;
          var hh = that.params.zoomData.zoomY * that.params.originalHeight;

          if(ww < that.params.minSize.width) {
            ww = that.params.minSize.width;
            that.params.zoomData.zoomX = ww / that.params.originalWidth;
            if(that.params.proportionalScale) {
              hh = (that.params.zoomData.zoomY = that.params.zoomData.zoomX) * that.params.originalHeight;
            }
          } else if(ww > that.params.maxSize.width) {
            ww = that.params.maxSize.width;
            that.params.zoomData.zoomX = ww / that.params.originalWidth;
            if(that.params.proportionalScale) {
              hh = (that.params.zoomData.zoomY = that.params.zoomData.zoomX) * that.params.originalHeight;
            }
          }

          if(hh < that.params.minSize.height) {
            hh = that.params.minSize.height;
            that.params.zoomData.zoomY = hh / that.params.originalHeight;
            if(that.params.proportionalScale) {
              ww = (that.params.zoomData.zoomX = that.params.zoomData.zoomY) * that.params.originalWidth;
            }
          } else if(hh > that.params.maxSize.height) {
            hh = that.params.maxSize.height;
            that.params.zoomData.zoomY = hh / that.params.originalHeight;
            if(that.params.proportionalScale) {
              ww = (that.params.zoomData.zoomX = that.params.zoomData.zoomY) * that.params.originalWidth;
            }
          }

          var dx = that.params.mouseZoomFromCenter ? ((that.params.pos.width - ww) / 2) : 0;
          var dy = that.params.mouseZoomFromCenter ? ((that.params.pos.height - hh) / 2) : 0;
          if(!that.params.useTransform && that.params.useFontSizeWhileScale) {
            that._content.css("fontSize", (Math.min(that.params.zoomData.zoomX,that.params.zoomData.zoomY) * 100) + "%");
          }

          that.params.pos.left += dx;
          that.params.pos.top += dy;
          that.params.pos.width = ww;
          that.params.pos.height = hh;
        };

        $that.wdCatchUserEvents({
          edit: that.params.edit,
          backObject: that.params.backObject && that.params.backObject.length > 0 ? that.params.backObject : null,
          scaleObject: that._resize && that._resize.length > 0 ? that._resize : null,
          rotateObject: that._rotate && that._rotate.length > 0 ? that._rotate : null,
          workMode: that.params.workMode,
          onUserDetect: function() {
            that.preventButtonEvents = (that.focused !== true);
            that.setFocus();
            that.params.onUserDetect.call($that[0]);
          },
          onMove: function(dx, dy) {
            if(!that.params.moveable) return;
            $that.addClass("moving");
            that.params.pos.left += dx/that.parentWidth;
            that.params.pos.top += dy/that.parentHeight;
            that.updatePosition();
            that.updateBoundsInfo();
            that.validatePosition();
            that.params.onChanging.call($that[0], that.params.pos);
          },
          onScale: function(scale, cx, cy) {
            if(!that.params.scaleable || that.params.workMode !== 0) return;
            //proportionalScale
            if(typeof(scale.dScale) !== "undefined") {
              // processing scale by touch
              that.params.zoomData.zoomX *= scale.dScale;
              that.params.zoomData.zoomY *= scale.dScale;
            } else if(typeof(scale.dx) !== "undefined" && typeof(scale.dy) !== "undefined") {
              // processing scale by mouse (apply rotation angle)
              // if scale from center -- do double increment for zoom
              var tx = scale.dx * Math.cos(that.params.pos.angle) + scale.dy * Math.sin(that.params.pos.angle);
              var ty = -scale.dx * Math.sin(that.params.pos.angle) + scale.dy * Math.cos(that.params.pos.angle);
              var sx = tx * (that.params.mouseZoomFromCenter ? 2 : 1);
              var sy = ty * (that.params.mouseZoomFromCenter ? 2 : 1);
              that.params.zoomData.zoomX += (sx / that.parentWidth) / that.params.originalWidth;
              that.params.zoomData.zoomY += (sy / that.parentHeight) / that.params.originalHeight;
            }
            that.correctSizeByZoom();
            that.updateSize();
            that.updatePosition();
            that.updateBoundsInfo();
            that.validatePosition();
            that.params.onChanging.call($that[0], that.params.pos);
          },
          onRotate: function(dAngle, cx, cy) {
            var ang;
            if(that.params.scaleable && that.params.workMode === 1) {
              var lorg = Math.sqrt((that.params.originalWidth/2)*(that.params.originalWidth/2) + (that.params.originalHeight/2)*(that.params.originalHeight/2));
              var aa = cx/that.parentWidth;
              var bb = cy/that.parentHeight;
              var l2 = Math.sqrt(aa*aa+bb*bb);
              ang = Math.abs(Math.atan2(bb,aa));
              if(ang > (Math.PI/2)) {
                ang = Math.PI - ang;
              }
              var ang2 = Math.atan2(that.params.originalHeight,that.params.originalWidth);
              var coeff1 = 1 + (that.parentWidth/that.parentHeight - 1) * (ang / (Math.PI/2));
              var coeff2 = 1 + (that.parentWidth/that.parentHeight - 1) * (ang2 / (Math.PI/2));
              l2 /= coeff1;
              lorg /= coeff2;
              that.params.zoomData.zoomX = that.params.zoomData.zoomY = l2/lorg;
              that.correctSizeByZoom();
              that.updateSize();
              that.updatePosition();
              if(!that.params.rotateable) {
                that.updateBoundsInfo();
                that.validatePosition();
                that.params.onChanging.call($that[0], that.params.pos);
                return;
              }
            }
            if(!that.params.rotateable) {
              return;
            }
            ang = Math.atan2(cy, cx);
            var tmpAng = Math.atan2(that.params.pos.height/(that.parentWidth/that.parentHeight),that.params.pos.width);
            that.params.pos.angle = ang - tmpAng;
            if(that.params.pos.angle < that.params.minAngle) that.params.pos.angle = that.params.minAngle;
            if(that.params.pos.angle > that.params.maxAngle) that.params.pos.angle = that.params.maxAngle;
            that.updateAngle();
            that.updateBoundsInfo();
            if(that.checkSizeInBounds()) {
              that.correctSizeByZoom();
              that.updateSize();
              that.updatePosition();
              that.updateBoundsInfo();
            }
            that.validatePosition();
            that.params.onChanging.call($that[0], that.params.pos);
          },
          onUserLeave: function(isMoved, type, time) {
            $that.removeClass("moving");
            if(!isMoved) {
              if(type === "move" && time < 700) that.params.onSimpleClick.call($that[0]);
              return;
            }

            // round angle if used snapToGrid
            if(that.params.snapToGrid) {
              that.params.pos.angle =
                (
                  Math.abs(Math.cos(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
                  || Math.abs(Math.sin(that.params.pos.angle)) < Math.sin(that.gridAngle*Math.PI/180)
                ) ? (Math.round(that.params.pos.angle/(Math.PI/2)) * (Math.PI/2)) : that.params.pos.angle;
            }
            that.params.onChanged.call($that[0], that.params.pos);
          },
          onDblClick: function() {
            that.params.onDblClick.call($that[0]);
          }
        });

        that.view = function() {
          that.params.edit = false;
          $that.wdCatchUserEvents("view", true);
          $that.removeClass("utSticker_edit");
        };

        that.edit = function() {
          that.params.edit = true;
          $that.wdCatchUserEvents("edit", true);
          $that.addClass("utSticker_edit");
        };

        that.breakUserEvents = function() {
          $that.wdCatchUserEvents("breakUserEvents");
        };

        that.changeOptions = function(newOptions) {
          that.params = $.extend(true, that.params, newOptions);
          if(newOptions.movableArea) that.parseMoveableArea(newOptions.movableArea);
          $that.wdCatchUserEvents("changeOptions", { edit: that.params.edit });

          if(that._rotate && that._rotate.length > 0) that._rotate.css("display", (!that.params.rotateable && that._rotate) ? "none" : "");
          if(that._resize && that._resize.length > 0) that._resize.css("display", (!that.params.scaleable && that._resize) ? "none" : "");
          $that.css("cursor", (!that.params.moveable) ? "auto" : "");

          that.updateAngle();
          that.updateZoomValueBySize();
          that.correctSizeByZoom();
          that.updateSize();
          that.updatePosition();
          that.updateBoundsInfo();
          that.validatePosition();
        };

        that.setFocus = function() {
          if(that.focused === true) return;
          that.focused = true;
          $that.addClass(that.params.classFocus);
          if(that.params.onFocus) that.params.onFocus.call($that[0]);
        };

        that.killFocus = function() {
          if(that.focused === false) return;
          $that.removeClass(that.params.classFocus);
          that.focused = false;
          if(that.params.onBlur) that.params.onBlur.call($that[0]);
          that.preventButtonEvents = true;
        };

        that.getPosition = function(callback) {
          if(callback) callback.call($that[0], that.params.pos);
        };

        that.getWorkedParams = function(callback) {
          if(callback) callback.call($that[0], that.params);
        };

        that.update = function(subCmd) {
          var oldWidth = that.parentWidth;
          var oldHeight = that.parentHeight;
          that.updateParentSize();
          that.params.originalWidth *= oldWidth/that.parentWidth;
          that.params.originalHeight *= oldHeight/that.parentHeight;
          if(subCmd === "noRatio") {
            that.params.pos.left += that.params.pos.width/2;
            that.params.pos.top += that.params.pos.height/2;
            that.params.pos.width *= oldWidth/that.parentWidth;
            that.params.pos.height *= oldHeight/that.parentHeight;
            that.params.pos.left -= that.params.pos.width/2;
            that.params.pos.top -= that.params.pos.height/2;
          }
          that.updateAngle();
          that.updateZoomValueBySize();
          that.correctSizeByZoom();
          that.updateSize();
          that.updatePosition();
          that.updateBoundsInfo();
          if(that.checkSizeInBounds()) {
            that.correctSizeByZoom();
            that.updateSize();
            that.updatePosition();
            that.updateBoundsInfo();
          }
          that.validatePosition();

          that.params.onChanged.call($that[0], that.params.pos);
        };

        that.setPosition = function(posData) {
          that.params.pos = $.extend(true, that.params.pos, posData);
          that.update();
        };

        /********************************************************************************
         * first time initialization
         ********************************************************************************/

        that.updateAngle();
        that.updateZoomValueBySize();
        that.correctSizeByZoom();
        that.updateSize();
        that.updatePosition();
        that.updateBoundsInfo();
        if(that.checkSizeInBounds()) {
          that.correctSizeByZoom();
          that.updateSize();
          that.updatePosition();
          that.updateBoundsInfo();
        }
        that.validatePosition();

        // change mode
        if(that.params.edit) that.edit();
        else that.view();

        // check new position for changes -- inform about it
        for(var tmp in that.params.pos) {
          if(that.params.pos[tmp] !== options.pos[tmp]) {
            that.params.onChanged.call($that[0], that.params.pos);
            break;
          }
        }

        // set or kill focus
        if(that.params.focused) that.setFocus();
        else that.killFocus();
      });
    },

    edit: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.edit();
      });
      return this;
    },

    view: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.view.call(this);
      });
      return this;
    },

    breakUserEvents: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.breakUserEvents.call(this);
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

    changeOptions: function(options) {
      this.each(function() {
        if(this.utSticker) this.utSticker.changeOptions.call(this, options);
      });
      return this;
    },

    setFocus: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.setFocus.call(this);
      });
      return this;
    },

    killFocus: function() {
      this.each(function() {
        if(this.utSticker) this.utSticker.killFocus.call(this);
      });
      return this;
    },

    getWorkedParams: function(callback) {
      this.each(function() {
        if(this.utSticker) this.utSticker.getWorkedParams.call(this, callback);
      });
      return this;
    },

    getPosition: function(callback) {
      this.each(function() {
        if(this.utSticker) this.utSticker.getPosition.call(this, callback);
      });
      return this;
    },

    setPosition: function(posData) {
      this.each(function() {
        if(this.utSticker) this.utSticker.setPosition.call(this, posData);
      });
      return this;
    },

    update: function(subCommand) {
      this.each(function() {
        if(this.utSticker) this.utSticker.update.call(this, subCommand);
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


/********************************************************************************
 * $.fn.crazyObjects
 * IMPORTANT -- the callbacks not safe
 ********************************************************************************/

(function($) {
  var methods = {
    init: function(inputOptions) {
      return this.each(function() {
        var that = {};
        var $that = $(this);
        this.wdCatchUserEvents = that;
        var defaults = {
          edit: false,
          startPos: {},
          touchCaptured: 0,
          methodApplyed: false,
          dobleClickTime: 750,
          lastMouseDownTime: 0,
          backObject: null,
          processLeaveMessage: true,
          scaleObject: null,
          rotateObject: null,
          workMode: 0, // 0 - two buttons, 1 - one button
          onMove: function(dx,dy) {},
          onScale: function(scale, cx, cy) {},
          onRotate: function(dAngle, cx, cy) {},
          // user do double click to element
          onDblClick: function() {},
          // called when user start interact with mouse
          onUserDetect: function() {},
          // called when user stop interact with mouse, whete type is: "move", "scale", "rotate"
          onUserLeave: function(isMoved, type) {}
        };
        that.options = $.extend(true, defaults, inputOptions);
        // indicate, is user move mouse between button down and up :)
        that._lastInteractMoveDetect = false;

        // check background object
        if(!that.options.backObject) that.options.backObject = $that;
        else that.options.backObject = $(that.options.backObject);

        var getLineLength = function(x1,y1,x2,y2) {
          return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        };
        var getCenterBetweenPoints = function(p1, p2) {
          return (p2-p1)/2 + p1;
        };
        var getAngelInRadian = function(y,x) {
//          return Math.atan(y/x) + (x < 0 ? Math.PI : 0);
          return Math.atan(y, x) + (x < 0 ? Math.PI : 0);
        };

        /********************************************************************************
         * get cursor coords functions
         ********************************************************************************/

        var getXCoordFromEvent = function(event, num) {
          if(!event) return 0;
          if(event.type.substr(0,5) === "touch") {
            var touch = event.originalEvent ? (event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches) : (event.touches ? event.touches : event.changedTouches);
            return (touch.length >= 1 ? touch[num ? num : 0].pageX : 0);
          } else {
            return event.pageX;
          }
        };
        var getYCoordFromEvent = function(event, num) {
          if(!event) return 0;
          if(event.type.substr(0,5) === "touch") {
            var touch = event.originalEvent ? (event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches) : (event.touches ? event.touches : event.changedTouches);
            return (touch.length >= 1 ? touch[num ? num : 0].pageY : 0);
          } else {
            return event.pageY;
          }
        };
        var getTouchesCount = function(event) {
          if(event.type.substr(0,5) === "touch") {
            var touch = event.originalEvent ? (event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches) : (event.touches ? event.touches : event.changedTouches);
            return touch.length;
          } else {
            return 1;
          }
        };

        /********************************************************************************
         * touch events processing
         ********************************************************************************/

        // used for detect double-click
        that._clickCounter = 0;

        that.onEventTouchStart = function(e) {
          /* fix for twice touches */
          if(getTouchesCount(e) > 1 && that.options.workMode !== 0) return false;

          that.options.backObject.off("touchmove", that.onEventTouchMove).on("touchmove", that.onEventTouchMove);
          that.options.backObject.off("touchend", that.onEventTouchEnd).on("touchend", that.onEventTouchEnd);
          that.options.backObject.off("touchcancel", that.onEventTouchEnd).on("touchcancel", that.onEventTouchEnd);
          that.options.onUserDetect.call($that[0]);

          var curTime = (new Date()).getTime();
          if((curTime - that.options.lastMouseDownTime) > that.options.dobleClickTime) that._clickCounter = 0;
          that._lastInteractMoveDetect = false;
          that._clickCounter++;

          var touch = event.originalEvent ? (event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches) : (event.touches ? event.touches : event.changedTouches);
          // check for double click
          if(touch.length === 1) {
            that.options.lastMouseDownTime = (new Date()).getTime();

            // processing move event
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.touchCaptured = 1;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }

          // processing scale and rotate events
          if(touch.length === 2 && that.options.workMode === 0) {
            that.options.lastMouseDownTime = 0;
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.startPos.x2 = touch[1].pageX;
            that.options.startPos.y2 = touch[1].pageY;
            that.options.startPos.distance = getLineLength(that.options.startPos.x1,that.options.startPos.y1,that.options.startPos.x2,that.options.startPos.y2);
            that.options.startPos.angle = getAngelInRadian((that.options.startPos.y2 - that.options.startPos.y1),(that.options.startPos.x2 - that.options.startPos.x1));
            that.options.touchCaptured = 2;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        };

        that.onEventTouchMove = function(e) {
          if(!that.options.touchCaptured) return;
          that._lastInteractMoveDetect = true;
          that._clickCounter = 0;
          that.options.lastMouseDownTime = 0;
          var touch = event.originalEvent ? (event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches) : (event.touches ? event.touches : event.changedTouches);

          // processing move event
          if(that.options.touchCaptured === 1) {
            that.options.onMove.call($that[0], touch[0].pageX - that.options.startPos.x1, touch[0].pageY - that.options.startPos.y1);
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }

          // processing scale and rotate events
          if(that.options.touchCaptured === 2) {
            var tcx = getCenterBetweenPoints(touch[0].pageX,touch[1].pageX);
            var tcy = getCenterBetweenPoints(touch[0].pageY,touch[1].pageY);

            var curDistance = getLineLength(touch[0].pageX, touch[0].pageY, touch[1].pageX, touch[1].pageY);
            var newA = getAngelInRadian((touch[1].pageY - touch[0].pageY),(touch[1].pageX - touch[0].pageX));

            that.options.onScale.call($that[0], { "dScale": curDistance/that.options.startPos.distance, "angle":newA }, tcx, tcy);
            that.options.onRotate.call($that[0], newA - that.options.startPos.angle, tcx, tcy);

            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.startPos.x2 = touch[1].pageX;
            that.options.startPos.y2 = touch[1].pageY;
            that.options.startPos.distance = curDistance;
            that.options.startPos.angle = newA;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        };

        that.onEventTouchEnd = function(e) {
          that.options.touchCaptured = 0;
          that.options.backObject.off("touchmove", that.onEventTouchMove);
          that.options.backObject.off("touchend", that.onEventTouchEnd);
          that.options.backObject.off("touchcancel", that.onEventTouchEnd);
          if(e) {
            e.stopPropagation();
            e.preventDefault();
          }

          var curTime = (new Date()).getTime();
          if((curTime - that.options.lastMouseDownTime) < that.options.dobleClickTime) {
            if(that._clickCounter > 1) {
              that.options.onDblClick.call($that[0]);
              that._clickCounter = 0;
              return false;
            }
          } else that._clickCounter = 0;

          that.options.onUserLeave.call($that[0], that._lastInteractMoveDetect, "move", ((new Date()).getTime() - that.options.lastMouseDownTime));
        };

        /********************************************************************************
         * mouse move events processing
         ********************************************************************************/

        that.onEventMouseDown = function(e) {
          that.options.backObject.off("mousemove", that.onEventMouseMove).on("mousemove", that.onEventMouseMove);
          that.options.backObject.off("mouseup", that.onEventMouseUp).on("mouseup", that.onEventMouseUp);
          if(that.options.processLeaveMessage) {
            that.options.backObject.off("mouseleave mouseout", that.onEventMouseUp).on("mouseleave mouseout", that.onEventMouseUp);
          }

          var curTime = (new Date()).getTime();
          if((curTime - that.options.lastMouseDownTime) > that.options.dobleClickTime) that._clickCounter = 0;
          that._lastInteractMoveDetect = false;
          that._clickCounter++;

          that.options.onUserDetect.call($that[0]);
          that.options.lastMouseDownTime = (new Date()).getTime();

          // processing move event
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.touchCaptured = 1;
          e.preventDefault();
          e.stopPropagation();
        };

        that.onEventMouseMove = function(e) {
          if(!that.options.touchCaptured) return;
          that._lastInteractMoveDetect = true;
          that._clickCounter = 0;
          that.options.lastMouseDownTime = 0;

          that.options.onMove.call($that[0], getXCoordFromEvent(e) - that.options.startPos.x1, getYCoordFromEvent(e) - that.options.startPos.y1);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseUp = function(e) {
          if(e.type === "mouseout" && (!e.toElement || e.currentTarget === e.toElement || e.currentTarget.contains(e.toElement))) return;
          that.options.touchCaptured = 0;
          that.options.backObject.off("mousemove", that.onEventMouseMove);
          that.options.backObject.off("mouseup", that.onEventMouseUp);
          if(that.options.processLeaveMessage) {
            that.options.backObject.off("mouseleave mouseout", that.onEventMouseUp);
          }
          if(e) {
            e.stopPropagation();
            e.preventDefault();
          }

          var curTime = (new Date()).getTime();
          if((curTime - that.options.lastMouseDownTime) < that.options.dobleClickTime) {
            if(that._clickCounter > 1) {
              that.options.onDblClick.call($that[0]);
              that._clickCounter = 0;
              return false;
            }
          } else that._clickCounter = 0;

          that.options.onUserLeave.call($that[0], that._lastInteractMoveDetect, "move", ((new Date()).getTime() - that.options.lastMouseDownTime));
        };

        /********************************************************************************
         * scale button events
         ********************************************************************************/

        that.onEventMouseScaleDown = function(e) {
          /* fix for twice touches */
          if(getTouchesCount(e) > 1) return false;

          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          if(e.type === "touchstart") {
            that.options.backObject.off("touchmove", that.onEventMouseScaleMove).on("touchmove", that.onEventMouseScaleMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseScaleUp).on("touchend touchcancel", that.onEventMouseScaleUp);
          } else {
            that.options.backObject.off("mousemove", that.onEventMouseScaleMove).on("mousemove", that.onEventMouseScaleMove);
            that.options.backObject.off("mouseup", that.onEventMouseScaleUp).on("mouseup", that.onEventMouseScaleUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseScaleUp).on("mouseleave mouseout", that.onEventMouseScaleUp);
          that._lastInteractMoveDetect = false;
          that.options.onUserDetect.call($that[0]);

          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseScaleMove = function(e) {
          /* fix for twice touches */
          if(getTouchesCount(e) > 1) return false;

          that._lastInteractMoveDetect = true;
          var cx = ($that.posLeft() + $that.fullWidth()/2);
          var cy = ($that.posTop() + $that.fullHeight()/2);
          var dx = getXCoordFromEvent(e) - that.options.startPos.x1;
          var dy = getYCoordFromEvent(e) - that.options.startPos.y1;
          that.options.onScale.call($that[0], { "dx":dx, "dy":dy }, cx, cy);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseScaleUp = function(e) {
          if(e.type === "mouseout" && (!e.toElement || e.currentTarget === e.toElement || e.currentTarget.contains(e.toElement))) return;
          if(e.type.toString().substr(0,5) === "mouse")
          {
            that.options.backObject.off("mousemove", that.onEventMouseScaleMove);
            that.options.backObject.off("mouseup", that.onEventMouseScaleUp);
          } else {
            that.options.backObject.off("touchmove", that.onEventMouseScaleMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseScaleUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave mouseout", that.onEventMouseScaleUp);
          if(e) {
            e.stopPropagation();
            e.preventDefault();
          }
          that.options.onUserLeave.call($that[0], that._lastInteractMoveDetect, "scale");
        };

        /********************************************************************************
         * rotate button events
         ********************************************************************************/

        that.onEventMouseRotateDown = function(e) {
          /* fix for twice touches */
          if(getTouchesCount(e) > 1) return false;

          var ox = parseInt($that.parent().offset().left, 10) + $that.posLeft();
          var oy = parseInt($that.parent().offset().top, 10) + $that.posTop();
          var cx = getXCoordFromEvent(e) - (ox + $that.fullWidth()/2);
          var cy = getYCoordFromEvent(e) - (oy + $that.fullHeight()/2);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.startPos.angle = getAngelInRadian(cy,cx);
          if(e.type === "touchstart") {
            that.options.backObject.off("touchmove", that.onEventMouseRotateMove).on("touchmove", that.onEventMouseRotateMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseRotateUp).on("touchend touchcancel", that.onEventMouseRotateUp);
          } else {
            that.options.backObject.off("mousemove", that.onEventMouseRotateMove).on("mousemove", that.onEventMouseRotateMove);
            that.options.backObject.off("mouseup", that.onEventMouseRotateUp).on("mouseup", that.onEventMouseRotateUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave mouseout", that.onEventMouseRotateUp).on("mouseleave mouseout", that.onEventMouseRotateUp);

          that._lastInteractMoveDetect = false;
          that.options.onUserDetect.call($that[0]);

          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseRotateMove = function(e) {
          /* fix for twice touches */
          if(getTouchesCount(e) > 1) return false;

          that._lastInteractMoveDetect = true;
          var ox = parseInt($that.parent().offset().left, 10) + $that.posLeft();
          var oy = parseInt($that.parent().offset().top, 10) + $that.posTop();
          var cx = getXCoordFromEvent(e) - (ox + $that.fullWidth()/2);
          var cy = getYCoordFromEvent(e) - (oy + $that.fullHeight()/2);
          var newA = getAngelInRadian(cy,cx);
          that.options.onRotate.call(that, newA - that.options.startPos.angle, cx, cy);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.startPos.angle = newA;
          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseRotateUp = function(e) {
          if(e.type === "mouseout" && (!e.toElement || e.currentTarget === e.toElement || e.currentTarget.contains(e.toElement))) return;
          if(e.type === "touchend" || e.type === "touchcancel") {
            that.options.backObject.off("touchmove", that.onEventMouseRotateMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseRotateUp);
          } else {
            that.options.backObject.off("mousemove", that.onEventMouseRotateMove);
            that.options.backObject.off("mouseup", that.onEventMouseRotateUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave mouseout", that.onEventMouseRotateUp);
          if(e) {
            e.stopPropagation();
            e.preventDefault();
          }
          that.options.onUserLeave.call($that[0], that._lastInteractMoveDetect, "rotate");
        };

        /********************************************************************************
         * mode change
         ********************************************************************************/
        that.stopBubble = function(e) {
          e.stopPropagation();
        };

        /* switch plugin to edit mode */
        that.edit = function(important) {
          if(that.options.edit && !important) return;
          if(important) that.view();
          $that.on("touchstart", that.onEventTouchStart);
          $that.on("mousedown", that.onEventMouseDown);
          $that.on("click", that.stopBubble);
          if(that.options.scaleObject)
            $(that.options.scaleObject).on("mousedown touchstart", that.onEventMouseScaleDown);
          if(that.options.rotateObject)
            $(that.options.rotateObject).on("mousedown touchstart", that.onEventMouseRotateDown);
          that.options.edit = true;
        };

        /* switch plugin to view mode */
        that.view = function(important) {
          if(!that.options.edit && !important) return;
          $that.off("touchstart", that.onEventTouchStart);
          $that.off("mousedown", that.onEventMouseDown);
          $that.off("click", that.stopBubble);
          if(that.options.scaleObject)
            $(that.options.scaleObject).off("mousedown touchstart", that.onEventMouseScaleDown);
          if(that.options.rotateObject)
            $(that.options.rotateObject).off("mousedown touchstart", that.onEventMouseRotateDown);
          that.options.edit = false;
        };

        that.breakUserEvents = function() {
          that.onEventTouchEnd();
          that.onEventMouseUp();
          that.onEventMouseRotateUp();
          that.onEventMouseScaleUp();
        };

        that.changeOptions = function(newOptions) {
          that.view();
          that.options = $.extend(true, that.options, newOptions);
          if(that.options.edit) {
            that.edit(true);
          }
        };

        if(that.options.edit) that.edit(true);
        else that.view(true);
      });
    },

    edit: function(important) {
      this.each(function() {
        this.wdCatchUserEvents.edit(important);
      });
      return this;
    },

    view: function(important) {
      this.each(function() {
        this.wdCatchUserEvents.view(important);
      });
      return this;
    },

    breakUserEvents: function() {
      this.each(function() {
        this.wdCatchUserEvents.breakUserEvents();
      });
      return this;
    },

    changeOptions: function(newOptions) {
      this.each(function() {
        this.wdCatchUserEvents.changeOptions(newOptions);
      });
      return this;
    }
  };

  $.fn.wdCatchUserEvents = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.wdCatchUserEvents');
    }
  };
})(window.jQuery || window.Zepto || window.jq);
