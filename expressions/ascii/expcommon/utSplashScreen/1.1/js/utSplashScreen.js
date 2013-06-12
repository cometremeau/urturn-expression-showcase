/**
 * $.fn.utSplashScreen
 * @params options - array of objects with fields:
 *   type -- block type (step, buttons)
 *   height -- block height
 *   skin -- (left, right)
 *   title -- the title text
 *   text -- description
 *   icon -- url to image for icon
 *   buttons: -- Array of object with button parameters
 *     type -- button type (image, other)
 *     text -- button text
 *     parameters -- parameters for image dialog and e.g.
 *     onMediaAdded: function(imageResource) {} -- callback when image was added to expression
 *     onClick: function(text) {} -- triggered when user click button, text -- is button text, return 'false' to prevent default handler
 *     onMediaCancel: function(imageResource) {} -- callback when user close image dialog
 *
 * @command hide -- show splashscreen
 * @command show -- hide splashscreen
 * @command setSize -- set parameters for image request
 */
(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var defaults = {
          post: false,
          structure: [],
          noWaitWindow: true
        };

        var $that = $(this);
        var that = {};
        this.utSplashScreen = that;
        that.options = $.extend(true, defaults, options);
        that.classPrefix = 'ut_ss';

        var addStep = function(){};

        that.create = function() {
          $that.addClass(that.classPrefix);

          var header = $('<header>').html('<h1>'+that.options.name+'</h1><h3>'+that.options.number+'</h3>').appendTo($that);
          var article = $('<article>').appendTo($that);

          $.each(that.options.structure, function(i,v) {
            var section = $('<section>').addClass(that.classPrefix+'_'+v.type).addClass(that.classPrefix+'_'+v.skin).css({'height':v.height}).appendTo(article);
            switch (v.type){
              // steps section
              case 'step':
                var cell1 = $('<div>').addClass(that.classPrefix+'_cell').appendTo(section);
                if(v.title) $('<h2>').html(v.title).appendTo(cell1);
                if(v.text)  $('<p>').html(v.text).appendTo(cell1);
                if(v.icon) {
                  var cell2= $('<div>').addClass(that.classPrefix+'_cell').appendTo(section);
                  $('<div>').addClass('icon').css('backgroundImage','url("'+v.icon+'")').appendTo(cell2);
                }
                if(v.skin == 'right'){
                  cell1.insertAfter(cell2);
                }
                break;

              // buttons section
              case 'buttons':
                var cell1 = $('<div>').addClass(that.classPrefix+'_cell').appendTo(section);
                $.each(v.buttons, function(ii,button){
                  $('<a>',{href:'#'}).text(button.text).addClass('btn').appendTo(cell1).on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    if(button.onClick && button.onClick(button.text) === false) {
                      return;
                    }

                    if(button.type == "image") {
                      if(!that.options.noWaitWindow) {
                        that.showLoader();
                      }
                      that.options.post.dialog(button.type, button.parameters, function(imageResource) {
                        if(imageResource && imageResource.url) {
                          button.onMediaAdded && button.onMediaAdded(imageResource);
                        } else {
                          button.onMediaCancel && button.onMediaCancel();
                        }
                        if(!that.options.noWaitWindow) {
                          that.hideLoader();
                        }
                      });
                    }

                    if(button.type == "video") {
                      if(!that.options.noWaitWindow) {
                        that.showLoader();
                      }
                      that.options.post.dialog(button.type, button.parameters, function(videoResource) {
                        if(videoResource && videoResource.url) {
                          button.onMediaAdded && button.onMediaAdded(videoResource);
                        } else {
                          button.onMediaCancel && button.onMediaCancel();
                        }
                        if(!that.options.noWaitWindow) {
                          that.hideLoader();
                        }
                      });
                    }

                  });
                });
                break;
            }
          });
        };

        that.hide = function(){
          $that.hide();
        };

        that.show = function(){
          $that.show();
        };

        that.showLoader = function() {

          var spin = $that.parent().find(".utSplashScreen_loading");
          if(spin && spin.length > 0) return;
          spin = $('<div class="utSplashScreen_loading"></div>').appendTo($that.parent());
          spin.utSpin().utSpin("show");
        };

        that.hideLoader = function() {
          var spin = $that.parent().find(".utSplashScreen_loading");
          if(spin && spin.length > 0) spin.remove();
        };

        that.create();
      });
    },

    hide: function() {
      this.each(function() {
        if(this.utSplashScreen) {
          this.utSplashScreen.hide();
        }
      });
      return this;
    },

    show: function() {
      this.each(function() {
        if(this.utSplashScreen) {
          this.utSplashScreen.show();
        }
      });
      return this;
    },

    setSize: function(size) {
      this.each(function() {
        if(this.utSplashScreen) {
          if(size.width) this.utSplashScreen.options.size.width = size.width;
          if(size.height) this.utSplashScreen.options.size.height = size.height;
        }
      });
      return this;
    }
  };

  $.fn.utSplashScreen = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utSplashScreen');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
