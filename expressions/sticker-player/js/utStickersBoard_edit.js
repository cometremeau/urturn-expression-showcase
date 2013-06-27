/*
 * $.fn.utStickersBoard
 * IMPORTANT -- please attach element to DOM-tree before apply
 * @params options - Object
 *  items: [] -- array of objects with items data.
 *  classContent: "content" -- class name for content box for items.
 *  classResize: "resize icon_move" -- resize button class name
 *  classRotate: "rotate icon_rotate" -- rotate button class name
 *  classRemove: "remove icon_delete" -- remove button class name
 *  classFlip: ".content" -- class-selector for find flipped object.
 *  parameters: [] -- array of objects with item's position data.
 *  proportionalScale: true -- use proportional scale for items.
 *  movableArea: undefined -- the area where ibject can be placed.
 *  flipContent: true -- is need to flip content.
 *  useTransform: false -- user transform CSS style for items.
 *  useBounds: true -- use bounds to calculate items position.
 *  rotateable: true -- is user can rotate items.
 *  moveable: true --  is user can move items.
 *  scaleable: true -- is user can resize items.
 *  selectable: true -- is user can select items.
 *  deleteButton: true -- is show delete button for items.
 *  editButton: false -- is need to show edit button
 *  additionButtons: [] -- additional buttons ex: [{class:'mybutton',title:'click me'},...]
 *  zIndexByClick: false -- use z-index CSS style for elements.
 *  design: 1 -- type of design.
 *  workMode: 1 -- work mode, where: 0 - use different button for rotate and scale, 0 - use one button for rotate and scale (only for proportional resize).
 *  useFontSizeWhileScale: false -- apply 'font-size' CSS value to content of item with scale value.
 *  snapToGrid: true -- snap items rotation to grid (0 and 90 deg).
 *  onRemove: function(key) {} -- callback while user delete item (return false for no-delete)
 *  onEditClick: function(key) {} -- callback while user click to "edit".
 *  onAddButtonClick: function(id) {} -- user click to user's defined button
 *  onSimpleClick: function(key) {} -- callback while user just click to item without move.
 *  onDblClick: function(key) {} -- callback while user double click to item without move.
 *  onChanging: function(data) {} -- callback while user changing item position/size/angle.
 *  onChanged: function(data) {} -- callback while user changed item position/size/angle.
 *  onSelected: function(key) {} -- user select item.
 *  onObjectPositionUpdated: function(key, pos) {} -- ...
 *  onFocus: function() {} -- the object catch focus and switch to focused mode.
 *  onBlur: function() {} -- the object last focus.
 *
 * @commands edit -- switch to edit mode.
 * @commands view -- switch to view mode.
 * @commands show -- show object.
 * @commands hide -- hide object.
 * @commands addItem - add new item. As param - .
 * @commands selectItem -- select item. As param - .
 * @commands setFocus - set focus to element.
 * @commands killFocus - kill element focus.
 * @commands getPosition -- return position of element through callback
 * @commands setPosition -- set new position by retrieved params
 * @commands update -- update stickers position by new parent size (is subCommand set as noRatio -- recalculate size and pos)
 * @commands changeOptions -- change items data. As params -- options as Object.
 * @commands removeAllItems
 * @commands forEach -- call callback function for every item with params: key, data
 */

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
             originalWidth:155,
             originalHeight:134,
             flipContent: true, // flip content when rotate
             useBounds: true, // the bounds parameters to validate move
             minSize: { width:0.000001, height:0.000001 },
             maxSize: { width:1, height:1 }
             rotateable: true, // is user can rotate element
             moveable: true, // is user can move element
             scaleable: true, // is user can resize element
             selectable: true, // Hi Alexey, wat's up :)  -- 2@Dmitry your brake my ideas.... :(
             deleteButton: true,
             editButton: false,
             movableArea: {},
             proportionalScale: true,
             deleteButton: false,
            */
          ],
          classStickerFocus: "utSticker_focus",
          classContent: "content",
          classResize: "resize icon_move", // resize button class name
          classRotate: "rotate icon_rotate", // rotate button class name
          classRemove: "remove icon_delete", // remove button class name
          classFlip: ".content",
          parameters: [],
          zoom: null,
          proportionalScale: true,
          movableArea: undefined,
          flipContent: true,
          useTransform: false,
          useBounds: true,
          rotateable: true, // is user can rotate element
          moveable: true, // is user can move element
          scaleable: true, // is user can resize element
          selectable: true,
          deleteButton: true,
          editButton: false, // is need to show edit button
          additionButtons: [], // additional buttons ex: [{class:'mybutton',title:'click me'},...]
          zIndexByClick: false,
          zIndexCounter: 1,
          design: 6,
          workMode: 1,
          useFontSizeWhileScale: false,
          snapToGrid: true,
          focused: null,
          minAngle: -100,
          maxAngle: 100,
          onRemove: function(key) {},
          onEditClick: function(key) {},
          onAddButtonClick: function(key, id) {},
          onSimpleClick: function(key) {},
          onDblClick: function(key) {},
          onChanging: function(data) {},
          onChanged: function(data) {},
          onSelected: function(key) {},
          onObjectPositionUpdated: function(key, pos) {},
          onFocus: function() {},
          onBlur: function() {}
        };

        that.options = $.extend(true, defaults, options);
        that.focused = null;
        if(!that.options.rotateable) {
          that.options.workMode = 0;
        }

        $that.addClass('utStickersBoard type' + that.options.design);
        if($that.css("position") === "static") {
          $that.css("position", "relative");
        }

        that.addNewItemToLayer = function(obj, nn, iData) {
          $("<div>").addClass("content").appendTo(obj).append(iData.object);
          if(!that.options.parameters[nn]) {
            that.options.parameters[nn] = {};
          }
          if(iData.key) {
            obj.attr("data-key", iData.key);
          }
          obj[0].utParameters = that.options.parameters[nn];
          obj.addClass("utStickersBoard_box");
          obj.utSticker({
            edit: $that.hasClass("utStickersBoard_edit"),
            zoom: that.options.zoom,
            classFocus: that.options.classStickerFocus,
            classResize: that.options.classResize,
            classRotate: that.options.classRotate,
            classRemove: that.options.classRemove,
            classContent: that.options.classContent,
            classFlip: that.options.classFlip,
            backObject: $("body"),
            design: that.options.design,
            pos: that.options.parameters[nn],
            useBounds: typeof(iData.useBounds) !== "undefined" ? iData.useBounds : that.options.useBounds,
            proportionalScale: typeof(iData.proportionalScale) !== "undefined" ? iData.proportionalScale : that.options.proportionalScale,
            movableArea: (typeof(iData.movableArea) !== "undefined" && !$.isEmptyObject(iData.movableArea)) ? iData.movableArea : that.options.movableArea,
            originalWidth: iData.originalWidth,
            originalHeight: iData.originalHeight,
            workMode: that.options.workMode,
            flipContent: typeof(iData.flipContent) !== "undefined" ? iData.flipContent : that.options.flipContent,
            useTransform: that.options.useTransform,
            minSize: (typeof(iData.minSize) !== "undefined" && !$.isEmptyObject(iData.minSize)) ? iData.minSize : that.options.minSize,
            maxSize: (typeof(iData.maxSize) !== "undefined" && !$.isEmptyObject(iData.maxSize)) ? iData.maxSize : that.options.maxSize,
            rotateable: typeof(iData.rotateable) !== "undefined" ? iData.rotateable : that.options.rotateable,
            moveable: typeof(iData.moveable) !== "undefined" ? iData.moveable : that.options.moveable,
            scaleable: typeof(iData.scaleable) !== "undefined" ? iData.scaleable : that.options.scaleable,
            deleteButton: typeof(iData.deleteButton) !== "undefined" ? iData.deleteButton : that.options.deleteButton,
            editButton: typeof(iData.editButton) !== "undefined" ? iData.editButton : that.options.editButton,
            additionButtons: that.options.additionButtons,
            useFontSizeWhileScale: typeof(iData.useFontSizeWhileScale) !== "undefined" ? iData.useFontSizeWhileScale : that.options.useFontSizeWhileScale,
            snapToGrid: that.options.snapToGrid,
            minAngle: that.options.minAngle,
            maxAngle: that.options.maxAngle,
            onUserDetect: function() {
              // check for edit mode and selectable item's ability
              if(!$that.hasClass("utStickersBoard_edit") || iData.selectable === false) return;
              // set focus to object
              that.setFocus();
              // update selected state
              $that.find(".utSticker."+that.options.classStickerFocus).utSticker("killFocus");
              obj.utSticker("setFocus");
              if(that.options.onSelected) that.options.onSelected.call(that, obj.attr("data-key"));
              // change z-order
              if(that.options.zIndexByClick) {
                this.utParameters.zIndex = ++that.options.zIndexCounter;
                $(this).css("zIndex", this.utParameters.zIndex);
                that.options.onChanged.call(obj[0], that.options.parameters);
              }
            },
            onChanging: function(params) {
              that.options.onChanging.call(obj[0], params);
            },
            onChanged: function(data) {
              for(var pp in data) {
                this.utParameters[pp] = data[pp];
              }
              that.options.onChanged.call(obj[0], that.options.parameters);
            },
            onRemoveClick: function() {
              var oo = $(this);
              var oid = oo.attr("data-key");
              if(that.options.onRemove.call($that[0], oid) !== false) {
                if(that.removeItem(oid)) {
                  that.options.onChanged.call(obj[0], that.options.parameters);
                }
              }
            },
            onEditClick: function() {
              that.options.onEditClick.call(obj[0], $(this).attr("data-key"));
            },
            onAddButtonClick: function(id) {
              that.options.onAddButtonClick.call(obj[0], $(this).attr("data-key"), id);
            },
            onSimpleClick: function() {
              that.options.onSimpleClick.call(obj[0], $(this).attr("data-key"));
            },
            onDblClick: function() {
              that.options.onDblClick.call(obj[0], $(this).attr("data-key"));
            },
            onObjectPositionUpdated: function(pos) {
              that.options.onObjectPositionUpdated.call(obj[0], $(this).attr("data-key"), pos);
            }
          });

          // update object z-index
          if(that.options.zIndexByClick) {
            if(!obj[0].utParameters.zIndex) obj[0].utParameters.zIndex = ++that.options.zIndexCounter;
            else if(obj[0].utParameters.zIndex > that.options.zIndexCounter) that.options.zIndexCounter = obj[0].utParameters.zIndex;
            obj.css("zIndex", obj[0].utParameters.zIndex);
          }
        };

        that.edit = function() {
          $that.addClass("utStickersBoard_edit");
          $that.find(".utSticker").utSticker("edit");
        };

        that.view = function() {
          $that.removeClass("utStickersBoard_edit");
          $that.find(".utSticker").utSticker("view");
        };

        that.show = function() {
          $that.css({"display":"block", "visibility":"visible"});
        };

        that.hide = function(){
          $that.css({"display":"none", "visibility":"hidden"});
        };

        that.addItem = function(data) {
          var iData = $.extend(true, {}, data);
          if(typeof(iData.selectable) == "undefined") iData.selectable = that.options.selectable;
          var nn = that.options.items.push(iData) - 1;
          if(typeof(iData.pos) != "undefined") {
            that.options.parameters[nn] = $.extend(true, {}, iData.pos);
            delete iData.pos;
          }
          var obj = $("<div>").appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
          if(iData.selectable && $that.hasClass("utStickersBoard_edit")) {
            $that.find(".utSticker."+that.options.classStickerFocus).utSticker("killFocus");
            obj.utSticker("setFocus");
          }
          that.options.onChanged.call(obj[0], that.options.parameters);
          return obj;
        };

        that.selectItem = function(key, changeIndex) {
          // check for edit mode
          if(!$that.hasClass("utStickersBoard_edit") || that.options.parameters.length <= 0) return;

          // kill selection
          var obj;
          if(key === "top") {
            var mz = -1;
            if(that.options.zIndexByClick) {
              obj = $that.find(".utSticker");
              for(var qq = 0; qq < obj.length; qq++) {
                if(obj[qq].utParameters.zIndex > mz) {
                  mz = obj[qq].utParameters.zIndex;
                  key = jQuery(obj[qq]).attr("data-key");
                }
              }
            }
          }
          if(key == "") {
            $that.find(".utSticker."+that.options.classStickerFocus).utSticker("killFocus");
            return;
          }

          // look for item by key
          obj = $that.find(".utSticker[data-key='" + key + "']");
          if(obj.length <= 0) return;

          // get parameters and checkk for selectable
          var iData = obj[0].utParameters;
          if(iData.selectable === false) return;

          // set focus to object
          that.setFocus();

          // update selected state
          $that.find(".utSticker."+that.options.classStickerFocus).utSticker("killFocus");
          obj.utSticker("setFocus");

          that.options.onSelected.call(that, obj.attr("data-key"));

          // change z-order
          if(that.options.zIndexByClick && changeIndex === false) {
            iData.zIndex = ++that.options.zIndexCounter;
            obj.css("zIndex", iData.zIndex);
            that.options.onChanging && that.options.onChanging.call(obj[0]);
          }
        };

        that.removeItem = function(key) {
          // look for item by key
          var obj = $that.find(".utSticker[data-key='" + key + "']");
          if(obj.length <= 0) return false;

          // look for item and remove
          var pp = obj[0].utParameters;
          for(var qq = 0; qq < that.options.parameters.length; qq++) {
            if(that.options.parameters[qq] === pp) {
              that.options.items.splice(qq, 1);
              that.options.parameters.splice(qq, 1);
              obj.remove();
              return true;
            }
          }
          return false;
        };

        that.setFocus = function() {
          if(that.focused === true) return;
          that.focused = true;
          $that.addClass("utStickersBoard_focus");
          that.options.onFocus.call($that[0]);
        };

        that.killFocus = function() {
          if(that.focused === false) return;
          $that.removeClass("utStickersBoard_focus");
          that.focused = false;
          $that.find(".utSticker."+that.options.classStickerFocus).utSticker("killFocus");
          that.options.onBlur.call($that[0]);
        };

        that.getPosition = function(key, callback) {
          // look for item by key
          var obj = $that.find(".utSticker[data-key='" + key + "']");
          if(obj.length <= 0) return;

          if(callback) callback.call($that[0], obj[0].utParameters);
        };

        that.setPosition = function(key, posData) {
          // look for item by key
          var obj = $that.find(".utSticker[data-key='" + key + "']");
          if(obj.length <= 0) return;
          obj.utSticker("setPosition", posData);
        };

        that.update = function(subCommand) {
          $that.find(".utSticker").utSticker("update", subCommand);
        };

        that.changeOptions = function(options) {
          that.options = $.extend(true, that.options, options);
          $that.find(".utSticker").utSticker("changeOptions", options);
        };

        that.removeAllItems =  function() {
          that.options.items = [];
          that.options.parameters = [];
          $that.find(".utSticker").remove();
        };

        that.forEach = function(callback) {
          if(!callback) return;
          var objs = $that.find(".utSticker");
          for(var qq = 0; qq < objs.length; qq++) {
            callback.call(this, $(objs[qq]), $(objs[qq]).attr("data-key"), objs[qq].utSticker ? objs[qq].utSticker.params : {});
          }
        };

        /********************************************************************************
         * first time initialization
         ********************************************************************************/

        if(that.options.focused === true) that.setFocus();
        else that.killFocus();

        // create items
        for(var nn in that.options.items) {
          var iData = that.options.items[nn];
          var obj = $("<div>").appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
        }
      });
      return this;
    },

    edit: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.edit.call(this);
        }
      });
      return this;
    },

    view: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.view.call(this);
        }
      });
      return this;
    },

    show: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.show.call(this);
        }
      });
      return this;
    },

    hide: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.hide.call(this);
        }
      });
      return this;
    },

    addItem: function(data) {
      var res = [];
      this.each(function() {
        if(this.utStickersBoard) {
          res.push(this.utStickersBoard.addItem.call(this, data));
        }
      });
      return res;
    },

    selectItem: function(key, changeIndex) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.selectItem.call(this, key, changeIndex);
        }
      });
      return this;
    },

    removeItem: function(key) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.removeItem.call(this, key);
        }
      });
      return this;
    },

    setFocus: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.setFocus.call(this);
        }
      });
      return this;
    },

    killFocus: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.killFocus.call(this);
        }
      });
      return this;
    },

    getPosition: function(key, callback) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.getPosition.call(this, key, callback);
        }
      });
      return this;
    },

    setPosition: function(key, posData) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.setPosition.call(this, key, posData);
        }
      });
      return this;
    },

    setNextZIndex: function(num) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.options.zIndexCounter = num;
        }
      });
      return this;
    },

    update: function(subCommand) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.update.call(this, subCommand);
        }
      });
      return this;
    },

    changeOptions: function(options) {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.changeOptions.call(this, options);
        }
      });
      return this;
    },

    removeAllItems: function() {
      this.each(function() {
        if(this.utStickersBoard) {
          this.utStickersBoard.removeAllItems.call(this);
        }
      });
      return this;
    },

    forEach: function(callback) {
      this.each(function() {
        if(this.utStickersBoard) this.utStickersBoard.forEach.call(this, callback);
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
