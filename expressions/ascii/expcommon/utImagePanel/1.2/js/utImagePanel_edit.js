/*
 * $.fn.utImagePanel
 * @params options - Object
 *  post: null -- ref to post object
 *  autoApplyImage: true -- auto implement image to container, when addded
 *  data: null -- image's data for first time init
 *  zoom: null -- scale value for buttons and text size
 *  params: Object -- params of requested image
 *    width: "auto" -- width of required image (can be: false - for no crop, "auto" - for autosize, number - for specific size)
 *    height: "auto" -- height of required image (can be: false - for no crop, "auto" - for autosize, number - for specific size)
 *    scale: 1 -- scale of required image
 *    timer: false -- TAP option
 *    flash: false -- TAP option
 *    mirror: false -- TAP option
 *    noConfirm: false -- TAP option
 *    applyShaders: null -- apply shaders by data frm this field
 *    autoCrop: true -- autocrop image when it will added
 *    adaptUI: true -- adapt camera to UI
 *    flexRatio: false -- don't save retio on request or resize image
 *  userData: null -- just user data (can be set by 'setUserData' and retrieve by 'getUserData' commands)
 *  focused: null -- set focus at start
 *  autoGrouping: true -- auto post message to other imagePanels messages like killFocus
 *  singleMode: true -- indicate that post has only one imagePanel (when true -- disable 'autoGrouping' property)
 *  controls: { top:'20px', left:'20px' } -- "edit" button position
 *  onAddClick: function() {} -- user click to 'add' button. Can return false, for prevent imageDialog
 *  onEditClick: function() {} -- user click to 'edit' button. Can return false, for prevent cropImage
 *  onChanged: function(data) {} -- the user select new image or crop image. data -- is image's data.
 *  onRecropEnd: function(data) {} -- the image was manually recropted
 *  onDialogCancel: function() {} -- inform that user break select/crop dialog
 *  onRecropCancel: function() {} -- inform that user break select/crop dialog
 *  onFocus: function() {} -- the object catch focus and switch to focused mode
 *  onBlur: function() {} -- the object last focus
 *  onSizeChange: function(size) {} --  image want to change size of it's container
 *  onSizeDetected: function(size) {} --  image want to change size of it's container

 *
 * @command edit -- switch to edit mode
 * @command view -- switch to view mode
 * @command setImage -- set new image. As first param - image's data, second param -- is check for ratio.
 * @command removeImage -- remove image from panel
 * @command filter -- apply filters to image. As param - filter's data.
 * @command showUserDialog -- open imageDialog for select image.
 * @command setUserData - set new user's data. As param - any type data.
 * @command getUserData - return user's data.
 * @command setFocus - set focus to element.
 * @command killFocus - kill element focus.
 * @command autoRecrop - auto recrop image by last parameters.
 * @command recrop - manual recrop image
 * @command isImageSet - return "true" if all imagePanels non free.
 * @command setHoverState -- hide(true) or show(false) gray layout
 * @command update
 * @command getSize
 * @command showLoader
 * @command hideLoader
 */
(function($) {
  var methods = {
    nextPanelToAddImage: -1,

    init: function(options) {
      this.each(function() {

        var defParam = {
          // ref to post object
          post: null,
          autoApplyImage: true,
          data: null,
          zoom: 1,
          params: {
            width: "auto",
            height: "auto",
            scale: 1,
            timer: false,
            flash: false,
            mirror: false,
            noConfirm: false,
            applyShaders: null,
            autoCrop: true, // autocrop as before
            adaptUI: true, // to take an image of ratio width / height
            flexRatio: false
          },
          userData: null,
          focused: null,
          autoGrouping: true,
          singleMode: true,
          controls: { top:'20px', left:'20px' },
          cropRatio: { min:0, max:10000 },
          texts: {
            addButton: null,
            editButton: null
          },
          onSizeChange: function(size) {},
          onAddClick: function() {},
          onEditClick: function() {},
          onRemoveClick: function() {},
          onChanged: function(data) {},
          onRecropEnd: function(data) {},
          onDialogCancel: function() {},
          onRecropCancel: function() {},
          onFocus: function() {},
          onBlur: function() {},
          onClick: function() {}
        };

        var $that = $(this);
        var that = {};
        that.animTimeout = 180;
        that.prm = $.extend(true, defParam, options);
        if(options.contols) that.prm.controls = $.extend(true, {}, options.controls);
        that.focused = null;
        that.viewMode = false;
        this.utImagePanel = that;
        that.pictureData = null;
        that.lastScrollPos = { scrollTop:0, scrollBottom:0 };
        if(that.prm.singleMode) that.prm.autoGrouping = false;

        if($.browser.mobile) $that.addClass("mobile");

        var pr = that.prm.zoom ? that.prm.zoom : $that.width()/500;
        pr = parseInt((pr<0.5 ? 0.5 : (pr>1.5 ? 1.5 : pr))*100,10);

        that.prm.post.on('scroll',function(v){
          that.lastScrollPos.scrollTop = parseInt(v.scrollTop,10);
          that.lastScrollPos.scrollBottom = parseInt(v.scrollBottom,10);
          that.update();
        });

        if(methods.nextPanelToAddImage < 0) {
          that.prm.post.off('media');
          that.prm.post.on('media',function(data) {
            var tempImg = new Image();
              var obj = $(that.prm.post.node);
              var allPanels = obj.find(".utImagePanel");
              var tmp = null;
              for(var qq = 0; qq < allPanels.length; qq++) {
                var ww = (qq + methods.nextPanelToAddImage) % (allPanels.length);
                if(!allPanels[ww].utImagePanel.isImageSet()) {
                  tmp = allPanels[ww];
                  break;
                }
              }
              if(!tmp) tmp = allPanels[(methods.nextPanelToAddImage++) % (allPanels.length)];
              if(tmp) {
                // TODO: make a seperate function to handle all this
                tmp.utImagePanel.onImageAdded.call(tmp, data, false, (that.prm.params.flexRatio && that.prm.params.height === false));
              }

          });
          methods.nextPanelToAddImage = 0;
        }

        that.getImageSizeData = function(imgSize, contSize){
          return {
            width: imgSize.width,
            height: imgSize.height,
            containerWidth: contSize.width,
            containerHeight: contSize.height,
            desiredContainerWidth: Math.floor(imgSize.width*(contSize.height/imgSize.height)),
            desiredContainerHeight: Math.floor(imgSize.height*(contSize.width/imgSize.width))
          };
        };

        that.isImageSet = function() {
          return !!$that.hasClass("utImagePanel_full");
        };

        that.onImageAdded = function(data, isAfterRecrop, doCheckRatio) {
          that.pictureData = data;
          if(data) {
            if(!that.prm.autoApplyImage) {
              if(isAfterRecrop) that.prm.onRecropEnd.call($that[0], data);
              else that.prm.onChanged.call($that[0], data);
              return;
            }

            if(!isAfterRecrop) {
              that.showLoader();
            }

            // loading and apply image
            var tmpImg = new Image();
            tmpImg.onload = function() {
              var imgWdt = tmpImg.width;
              var imgHgt = tmpImg.height;

              if(doCheckRatio) {
                var sc = imgWdt/imgHgt;
                if(sc > that.prm.cropRatio.max) {
                  imgWdt = tmpImg.height*that.prm.cropRatio.max;
                  imgHgt *= 576/imgWdt;
                  imgWdt *= 576/imgWdt;
                  that.prm.post.dialog('crop',{'image':that.pictureData, 'size' : {width:imgWdt, height:imgHgt, autoCrop:true}}, function(data, error) {
                    that.pictureData = data;
                    var tmp = $that[0].getAttribute("style") || "";
                    tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
                    $that[0].setAttribute("style", tmp + 'background-image:url("' + data.url + '")');
                    $that.addClass("utImagePanel_full");

                    if(isAfterRecrop) that.prm.onRecropEnd.call($that[0], data);
                    else that.prm.onChanged.call($that[0], data);

                    // inform about new image size
                    var size = that.getImageSizeData({width:imgWdt, height:imgHgt}, {width:$that.width(), height:$that.height()});
                    that.prm.onSizeChange(size);
                    that.hideLoader();
                  });
                  return;
                }
                if(sc < that.prm.cropRatio.min) {
                  imgHgt = tmpImg.width/that.prm.cropRatio.min;
                  that.prm.post.dialog('crop',{'image':that.pictureData, 'size' : {width:imgWdt, height:imgHgt, autoCrop:true}}, function(data, error) {
                    that.pictureData = data;
                    var tmp = $that[0].getAttribute("style") || "";
                    tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
                    $that[0].setAttribute("style", tmp + 'background-image:url("' + data.url + '")');
                    $that.addClass("utImagePanel_full");

                    if(isAfterRecrop) that.prm.onRecropEnd.call($that[0], data);
                    else that.prm.onChanged.call($that[0], data);

                    // inform about new image size
                    var size = that.getImageSizeData({width:imgWdt, height:imgHgt}, {width:$that.width(), height:$that.height()});
                    that.prm.onSizeChange(size);
                    that.hideLoader();
                  });
                  return;
                }
              }

              var tmp = $that[0].getAttribute("style") || "";
              tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
              $that[0].setAttribute("style", tmp + 'background-image:url("' + data.url + '")');
              $that.addClass("utImagePanel_full");

              if(isAfterRecrop) that.prm.onRecropEnd.call($that[0], data);
              else that.prm.onChanged.call($that[0], data);

              // inform about new image size
              var size = that.getImageSizeData({width:imgWdt, height:imgHgt}, {width:$that.width(), height:$that.height()});
              that.prm.onSizeChange(size);
              that.hideLoader();
            };
            tmpImg.onerror = function() {
              that.hideLoader();
            };
            tmpImg.src = data.url;
          }
        };

        that.queryImage = function(params) {
          var options = {};
          var tmpPrm = $.extend(true, {}, that.prm.params);
          tmpPrm = $.extend(true, tmpPrm, params);
          options.size = that.getSize(tmpPrm);
          var checkRatio = !!(tmpPrm.flexRatio && tmpPrm.height === false);

          // add other parameters
          if(that.prm.params.applyShaders) options.applyShaders = that.prm.params.applyShaders;
          if(that.prm.params.timer) options.timer = that.prm.params.timer;
          if(that.prm.params.flash) options.flash = that.prm.params.flash;
          if(that.prm.params.mirror) options.mirror = that.prm.params.mirror;
          if(that.prm.params.noConfirm) options.noConfirm = that.prm.params.noConfirm;

          that.prm.post.dialog('image', options, function(data, error){
            if(error) {
              console.error("Unable to save image: ", error);
              return;
            }
            if($.isEmptyObject(data)) {
              that.prm.onDialogCancel.call(this);
              return;
            }
            that.onImageAdded(data, false, checkRatio);
          });
        };

        that.filter = function(options, onReadyCallback){
          if(!that.pictureData || !that.pictureData.url) {
            if(onReadyCallback) onReadyCallback.call(this);
            return false;
          }

          that.prm.post.medias.applyFilterToImage(that.pictureData, options, function(data) {
            that.onImageAdded(data, false, false);
            if(onReadyCallback) onReadyCallback.call(this);
          });
        };

        /**
         * recrop image.
         * if autoCrop is true -- adaptUI will be set to false
         * @param params - params for recrop
         * can contain:
         *  width -- requested width
         *  height -- requested height
         *  autoCrop -- autocrop without user
         *  flexRatio -- flexible image ratio
         * @param onReadyCallback -- callback when recrop finished
         */
        that.recropImage = function(params, onReadyCallback) {
          if(!that.pictureData || !that.pictureData.url) {
            if(onReadyCallback) onReadyCallback.call(this);
            return false;
          }

          var recropParam = {};
          var tmpPrm = $.extend(true, {}, that.prm.params);
          tmpPrm = $.extend(true, tmpPrm, params);

          if(!tmpPrm.autoCrop) {
            recropParam.width = 576;
            recropParam.height = 576/$that.width() * $that.height();
          } else {
            recropParam.width = ((tmpPrm.width === "auto" || tmpPrm.width === false) ? ($that.width() * tmpPrm.scale) : (parseInt(tmpPrm.width, 10) * tmpPrm.scale));
            if(!tmpPrm.flexRatio) {
              recropParam.height = ((tmpPrm.height === "auto" || tmpPrm.height === false) ? ($that.height() * tmpPrm.scale) : (parseInt(tmpPrm.height, 10) * tmpPrm.scale));
            } else {}
          }
          var checkRatio = !!(tmpPrm.flexRatio && tmpPrm.autoCrop && tmpPrm.height === false);

          recropParam.autoCrop = !!tmpPrm.autoCrop;
          recropParam.adaptUI = !!tmpPrm.adaptUI;
          recropParam.flexRatio = !!tmpPrm.flexRatio;

          that.prm.post.dialog('crop',{'image':that.pictureData, 'size' : recropParam}, function(data, error) {
            if($.isEmptyObject(data)) {
              that.prm.onRecropCancel.call(this);
              return;
            }
            that.onImageAdded(data, true, checkRatio);
            if(onReadyCallback) onReadyCallback.call(this);
          });
        };

        that.autoRecrop = function(params, onReadyCallback) {
          that.recropImage($.extend(true, params, {autoCrop: true}), onReadyCallback);
        };

        // the animation on button is ended
        that.onButtonTransEnd = function() {
          if(parseInt(that.editButton.css("opacity"),10) === 0) {
            that.editButton.css("display", "none");
          }
        };

        that.onAddButtonClick = function(e) {
          e.stopPropagation();
          e.preventDefault();
          that.setFocus();
          // on 'Add image' button click
          var onStClick = function() {
            if(that.prm.onAddClick && that.prm.onAddClick.call(that) === false) return false;
            if(!that.prm.post) return false;
            that.queryImage({});
            return false;
          };

          var scd = true;
          var et = this;
          if(e.type == "touchstart") {
            $that.off("touchmove");
            $that.off("touchend");
            $that.on("touchmove", function(){
              $that.off("touchmove");
              $that.off("touchend");
              scd = false;
            });
            $that.on("touchend", function(){
              $that.off("touchmove");
              $that.off("touchend");
              if(scd) onStClick.call(et);
              return false;
            });
          } else {
            onStClick.call(this);
          }
          return false;
        };

        that.onEditButtonClick = function(e) {
          e.stopPropagation();
          e.preventDefault();
          that.setFocus();
          if(that.prm.onEditClick && that.prm.onEditClick.call(that) === false) return false;
          if(!that.prm.post) return false;
          that.recropImage({autoCrop:false});
          return false;
        };

        that.onRemoveButtonClick = function(e) {
          e.stopPropagation();
          e.preventDefault();
          if(that.prm.onRemoveClick && that.prm.onRemoveClick.call(that) === false) return false;
          if(!that.prm.post) return false;

          // remove image and update data
          that.removeImage();
          return false;
        };

        $that.addClass("utImagePanel");
        if(that.prm.singleMode) $that.addClass("utImagePanel_focus");

        // add 'ADD' button
        that.addButton = $("<div>").addClass("add_image_button add").css("fontSize", pr + "%").appendTo($that);
        var bttnText = "";
        if(that.prm.texts.addButton) bttnText = that.prm.texts.addButton;
        else if($.browser.mobile) bttnText = "Add<br>image";
        else bttnText = "Add<br>image";



        that.addButton.html('<span><span class="icon_camera"></span><br/>' + bttnText + '</span>');

        // add 'EDIT' button
        if(that.prm.texts.editButton) bttnText = that.prm.texts.editButton;
        else bttnText = "Edit";
        that.editButton = $("<div>").addClass("add_image_button edit").css("fontSize", pr + "%").appendTo($that);
        that.editButton.html('<div class="edit"><span><span class="icon_camera">&nbsp;</span>'+bttnText+'</span></div><div class="remove"><span class="icon_trash"></span></div>');

        // 'REMOVE' button
        that.removeButton = that.editButton.find(".remove");

        /********************************************************************************
         * attach events
         ********************************************************************************/


        that.addButton.on("click",that.onAddButtonClick);
        that.editButton.on("click", that.onEditButtonClick);
        that.removeButton.on("click", that.onRemoveButtonClick);

        // attach event for capture focus
        $that.on("click", function(){
          if(that.viewMode) return;
          that.prm.onClick.call(that);
          if(that.focused) {
            that.killFocus();
            that.setHoverState(true, true);
          } else {
            that.setFocus();
            that.setHoverState(false, true);
          }
        });

        //that._darkOverlay = null;
        //that.grayLayer = false;
        that.setHoverState = function(ishover, otherPanelState) {
          // don't use in single panel mode
          if(that.prm.singleMode) return;
          var qq,ips;
          // if(ishover) {
          //   //that.grayLayer = false;
          //   //$that.removeClass("utImagePanel_dark");
          //   // set timeout to hide layer
          //   // setTimeout(function() {
          //   //   if(!that.grayLayer && that._darkOverlay && parseInt(that._darkOverlay.css("opacity"),10) === 0) {
          //   //     that._darkOverlay.remove();
          //   //     that._darkOverlay = null;
          //   //   }
          //   // }, that.animTimeout);
          // } else {
          //   //that.grayLayer = true;
          //   // drop hover state for other imagePanels
          //   // if(!that._darkOverlay) {
          //   //   that._darkOverlay = $("<div>").addClass("utImagePanel_darkLayer").appendTo($that);
          //   // }
          //   // setTimeout(function(){ if(that.grayLayer) $that.addClass("utImagePanel_dark"); }, 0);
          // }
          // drop hover state for other imagePanels
          if(that.prm.autoGrouping && (otherPanelState === true || otherPanelState === false)) {
            ips = $(that.prm.post.node).find(".utImagePanel");
            for(qq = 0; qq < ips.length; qq++) {
              if(ips[qq] === $that[0]) continue;
              if(!ips[qq].utImagePanel) continue;
              ips[qq].utImagePanel.setHoverState(otherPanelState);
            }
          }
        };

        that.edit = function() {
          that.viewMode = false;
          $that.removeClass("utImagePanel_view");
        };

        that.view = function() {
          that.viewMode = true;
          $that.addClass("utImagePanel_view");
        };

        that.setImage = function(data, isCheckForRatio) {
          if($.isEmptyObject(data)) return;
          that.onImageAdded(data, false, !!isCheckForRatio);
        };

        that.removeImage = function() {
          that.pictureData = null;
          var tmp = $that[0].getAttribute("style") || "";
          tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
          $that[0].setAttribute("style", tmp);
          $that.removeClass("utImagePanel_full");
        };

        that.setFocus = function() {
          if(that.focused === true) return;
          that.focused = true;
          if(that.prm.autoGrouping) {
            var ips = $(that.prm.post.node).find(".utImagePanel");
            for(var qq = 0; qq < ips.length; qq++) {
              if(ips[qq] === $that[0] || !ips[qq].utImagePanel) continue;
              ips[qq].utImagePanel.killFocus();
            }
          }
          that.editButton.css("display", "");
          setTimeout(function(){ if(that.focused) $that.addClass("utImagePanel_focus"); }, 0);
          if(that.prm.onFocus) that.prm.onFocus.call($that[0]);
        };

        that.killFocus = function() {
          if(that.focused === false) return;
          that.focused = false;
          if(!that.prm.singleMode) $that.removeClass("utImagePanel_focus");
          if(that.prm.onBlur) that.prm.onBlur.call($that[0]);
          setTimeout(function(){ that.onButtonTransEnd(); }, that.animTimeout);
        };

        that.isDomElementHidden = function(elem) {
          var width = elem.offsetWidth, height = elem.offsetHeight;
          return (width === 0 && height === 0) || (((elem.style && elem.style.display) || $(elem).css("display")) === "none");
        };

        that.update = function(data) {
          if(data) {
            that.prm = $.extend(true, that.prm, data);
            if(data.controls) that.prm.controls = $.extend(true, {}, data.controls);
            that.editButton.css($.extend(true, {left:'auto',top:'auto',right:'auto',bottom:'auto'}, that.prm.controls));
            if(that.prm.controls.top) that.prm.controls.top = parseInt(that.editButton.css("top"));
            if(that.prm.controls.bottom) that.prm.controls.bottom = parseInt(that.editButton.css("bottom"));
          }

          var ec = $(that.prm.post.node);
          var tb = ec.find(".wdChooser.wdChooser_main");
          if(tb.length <= 0 || that.isDomElementHidden(tb[0])) tb = null;
          var tbh = 0;
          if(tb) tbh = tb.height();

          var pos = $that.offset();
          pos.width = $that.width();
          pos.height = $that.height();
          pos.right = pos.left + pos.width;
          pos.bottom = pos.top + pos.height;
          var fh = ec.height();
          var tmp1 = Math.max(pos.top, that.lastScrollPos.scrollTop) - pos.top;
          var tmp2 = Math.max(fh-pos.bottom, (that.lastScrollPos.scrollBottom + tbh)) - (fh-pos.bottom);
          // to center
          that.addButton.css("top", (tmp1 + (pos.height-tmp1-tmp2)/2) + "px");
          if(that.prm.controls.top) that.editButton.css("top", (tmp1 + parseInt(that.prm.controls.top, 10)) + "px");
          if(that.prm.controls.bottom) that.editButton.css({"top": (pos.height - tmp2 - parseInt(that.prm.controls.bottom, 10) - that.editButton.height()) + "px", "bottom":"auto"});
        };

        that.getSize = function(params) {
          var options = {};
          var tmpPrm = params ? params : $.extend(true, {}, that.prm.params);
          if(tmpPrm.width === "auto") options.width = $that.width() * tmpPrm.scale;
          else if(tmpPrm.width !== false) options.width = parseInt(tmpPrm.width, 10) * tmpPrm.scale;
          if(tmpPrm.height === "auto") options.height = $that.height() * tmpPrm.scale;
          else if(tmpPrm.height !== false) options.height = parseInt(tmpPrm.height, 10) * tmpPrm.scale;
          options.autoCrop = !!tmpPrm.autoCrop;
          options.adaptUI = !!tmpPrm.adaptUI;
          options.flexRatio = !!tmpPrm.flexRatio;
          return options;
        };

        that.showLoader = function() {
          var spin = $that.find(".utImagePanel_loading");
          if(spin && spin.length > 0) return;
          spin = $('<div class="utImagePanel_loading"></div>').appendTo($that);
          spin.utSpin().utSpin("show");
          $that.addClass("loading");
        };

        that.hideLoader = function() {
          var spin = $that.find(".utImagePanel_loading");
          if(spin && spin.length > 0) spin.remove();
          $that.removeClass("loading");
        };

        if(that.prm.data && that.prm.data.url) {
          // loading and apply image
          var tmpImg = new Image();
          tmpImg.onload = function() {
            /******************** save image size ********************/
            var imgWdt = tmpImg.width;
            var imgHgt = tmpImg.height;

            that.pictureData = that.prm.data;
            var tmp = $that[0].getAttribute("style") || "";
            tmp = tmp.replace(/background\-image\:([^\(^;]+\([^\)]+\)+|[^;]*);?/ig, "");
            $that[0].setAttribute("style", tmp + 'background-image:url("' + that.prm.data.url + '")');
            $that.addClass("utImagePanel_full");

            // inform about new image size
            var size = that.getImageSizeData({width:imgWdt, height:imgHgt}, {width:$that.width(), height:$that.height()});
            that.prm.onSizeChange(size);
          };
          tmpImg.onerror = function() {};
          tmpImg.src = that.prm.data.url;
        }

        if(that.prm.focused === true) {
          that.setFocus();
          that.setHoverState(false, true);
        }
        else that.killFocus();

        that.update();
      });
      return this;
    },

    edit: function() {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.edit.call(this);
      });
      return this;
    },

    view: function() {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.view.call(this);
      });
      return this;
    },

    setImage: function(data, isCheckForRatio) {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.setImage.call(this, data, isCheckForRatio);
      });
      return this;
    },

    removeImage: function() {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.removeImage.call(this);
      });
      return this;
    },

    filter: function(options, onReadyCallback){
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.filter.call(this, options, onReadyCallback);
      });
      return this;
    },

    showUserDialog: function(params) {
      if(this[0] && this[0].utImagePanel) this[0].utImagePanel.queryImage.call(this, params ? params : {});
      return this;
    },

    setUserData: function(data) {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.prm.userData = data;
      });
      return this;
    },

    getUserData: function() {
      var res = null;
      this.each(function(){
        if(this.utImagePanel) res = this.utImagePanel.prm.userData;
      });
      return res;
    },

    setFocus: function() {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.setFocus.call(this);
      });
      return this;
    },

    killFocus: function() {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.killFocus.call(this);
      });
      return this;
    },

    autoRecrop: function(params, onReadyCallback) {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.autoRecrop.call(this, params ? params : {}, onReadyCallback);
      });
      return this;
    },

    recrop: function(params, onReadyCallback) {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.recropImage.call(this, params ? params : {}, onReadyCallback);
      });
      return this;
    },

    isImageSet: function(params) {
      var res = true;
      this.each(function(){
        if(this.utImagePanel) res = res && this.utImagePanel.isImageSet.call(this);
      });
      return this.length > 0 && res;
    },

    setHoverState: function(value, ovalue) {
      this.each(function(){
        if(this.utImagePanel) this.utImagePanel.setHoverState.call(this, value, typeof(ovalue) == "undefined" ? false : ovalue);
      });
      return this;
    },

    update: function(data) {
      this.each(function() {
        if(this.utImagePanel) this.utImagePanel.update.call(this, data);
      });
      return this;
    },

    getSize: function() {
      var size = false;
      this.each(function(){
        if(this.utImagePanel) size = !size?this.utImagePanel.getSize.call(this) : size;
      });
      return size;
    },

    showLoader: function() {
      this.each(function() {
        if(this.utImagePanel) this.utImagePanel.showLoader.call(this);
      });
      return this;
    },

    hideLoader: function() {
      this.each(function() {
        if(this.utImagePanel) this.utImagePanel.hideLoader.call(this);
      });
      return this;
    }
  };

  $.fn.utImagePanel = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utImagePanel');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
