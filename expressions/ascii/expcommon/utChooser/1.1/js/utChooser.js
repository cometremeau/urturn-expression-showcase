/*
 * $.fn.utChooser
 * expression: false
 * items: []
 *   icon -- url to image for icon
 *   class -- add to item class with name utChooser_item_[class]
 *   text -- content for button
 *   val -- key-value assotiated with button
 *   type -- type of button, can be "radio", "button"
 * autoFit: false
 * skin: '1'
 * lever: false
 * isMobile: !(window.navigator.userAgent.toLowerCase().indexOf('mobile') == -1)
 * onChange: function(val){}
 * onExpand: function(val){}
 * onChangeUp: function(val){}
 *
 * @command setValue
 * @command unselectAll
 * @command unexpandAll
 * @command hide
 * @command show
 * @command hideItem
 * @command showItem
 */
(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var defaults = {
          expression: false,
          items: [],
          autoFit: false,
          skin: '1',
          lever: false,
          align: "left",
          isMobile: !(window.navigator.userAgent.toLowerCase().indexOf('mobile') == -1),
          onChange: function(val){},
          onExpand: function(val){},
          onChangeUp: function(val){},
          onClick: function(){}
        };

        var $that = $(this);
        var that = {};
        this.utChooser = that;
        that.options = $.extend(defaults, options);

        that.create = function() {
          $that.addClass('utChooser utChooser_' + that.options.align);

          if(that.options.lever){
            that.$lever = $(that.options.lever);
            that.$lever.on('click', function(e) {
              e.stopPropagation();
              that.options.onClick();
              if(!that.$lever.hasClass('active')){
                that.show();
                that.options.onExpand(true);
              } else {
                that.hide();
                that.options.onExpand(false);
              }
            });
          }

          // add menu type classes (mostly about style and bottom position)
          if(that.options.skin) $that.addClass('utChooser_skin'+that.options.skin);

          // add autoFit class
          if(that.options.autoFit) $that.addClass('utChooser_autoFit');

          $that.on('touchstart touchend touchmove mousedown mousemove mouseup click', function(e){
            e.stopPropagation();
            e.preventDefault();
          });

          // initial bottom position of menu in pixels
          that.initialBottomPosition = parseInt($that.css('bottom'),10);
//          if(that.options.expression){
//            var doOnScrollChanged = function(v){
//              var currentBottomPosition = that.initialBottomPosition + parseInt(v.scrollBottom,10);
//              $that.css('bottom',currentBottomPosition + 'px');
//            };
//            that.options.expression.scrollChanged(doOnScrollChanged);
//            doOnScrollChanged(that.options.expression.getScrollValues());
//          }

          var maxWidth = $that.width();
          that.utChooserScrollArea = [];
          that.utChooserScrollArea[0] = $('<div>').attr({'class': 'utChooser_scroll_area'}).appendTo($that);
          var totalWidth = 0;
          var isMobile = $.browser.mobile;

          for(var qq = that.options.items.length - 1; qq >= 0; qq--) {
            (function(val){
              var item = $('<div>').addClass("utChooser_item");
              var container =  that.utChooserScrollArea[that.utChooserScrollArea.length - 1];

              if(val.icon){
                item.css('backgroundImage', 'url(' + val.icon + ')');
              }

              if(val['class']){
                item.addClass('utChooser_item_' + val['class']);
              }

              that.selectionClass   = 'utChooser_item_selected';
              that.touchMoveEvents  = 'touchmove mousemove';
              that.touchEndEvents   = 'touchend touchcancel mouseup mouseleave';
              that.touchStartEvents = 'touchstart mousedown';

              $that.on(that.touchEndEvents, function(){
                $that.find('.utChooser_item').removeClass(that.activationClass);
              });

              item.html(val.text)
                .attr('data-value',val.val)
                .addClass('utChooser_item_' + val.type)
                .prependTo(container);

              var itemWidth = item.fullWidth();
              totalWidth += itemWidth;
              if(totalWidth > maxWidth && !isMobile) {
                var newCont;
                if(container.children().length > 1) {
                  newCont = $('<div>').attr({'class': 'utChooser_scroll_area'}).prependTo($that);
                  item.appendTo(newCont);
                  that.utChooserScrollArea.push(newCont);
                  container.width(totalWidth - itemWidth);
                  totalWidth = itemWidth;
                } else {
                  newCont = $('<div>').attr({'class': 'utChooser_scroll_area'}).prependTo($that);
                  that.utChooserScrollArea.push(newCont);
                  container.width(totalWidth);
                  totalWidth = 0;
                }
              }

              var onTouchMove = function(e){
                item.off(that.touchMoveEvents, onTouchMove);
                item.off(that.touchEndEvents, onTouchEnd);
              };

              var onTouchEnd = function() {
                if(val.type && val.type == "radio") {
                  $that.find('.utChooser_item').removeClass(that.selectionClass);
                  item.addClass(that.selectionClass);
                  that.options.onChange(val.val);
                } else if(val.type && val.type == "button") {
                  that.options.onChange(val.val);
                }
                item.off(that.touchMoveEvents, onTouchMove);
                item.off(that.touchEndEvents, onTouchEnd);
              };

              var onTouchStart = function(e) {
                item.on(that.touchMoveEvents, onTouchMove);
                item.on(that.touchEndEvents, onTouchEnd);
              };

              item.on(that.touchStartEvents, onTouchStart);
            })(that.options.items[qq]);
          }

          $that.css("height", (that.utChooserScrollArea.length*4) + "em");
          that.utChooserScrollArea[that.utChooserScrollArea.length - 1].width(totalWidth);
          if(isMobile && totalWidth > maxWidth) {
            that.utChooserScrollArea[that.utChooserScrollArea.length - 1].touchScroll();
          }
        };

        that.unselectAll = function(){
          $that.find(".utChooser_item").removeClass(that.selectionClass).removeClass(that.expandedClass);
        };

        that.unexpandAll = function(){
          $that.find(".utChooser_item").removeClass(that.expandedClass);
        };

        that.setValue = function(val,change){
          that.unselectAll();
          $that.find(".utChooser_item").filter('[data-value="'+val+'"]').addClass(that.selectionClass).addClass(that.expandedClass);
        };

        that.hide = function(){
          $that.hide();
          if(that.$lever) that.$lever.removeClass('active');
        };

        that.show = function(){
          $that.show();
          if(that.$lever) that.$lever.addClass('active');
        };

        that.hideItem = function(id){
          $that.find('[data-value='+id+']').hide();
        };

        that.showItem = function(id){
          $that.find('[data-value='+id+']').show();
        };

        that.create();
      });
    },
    setValue: function(val, change){
      this.each(function() {
        if(this.utChooser) this.utChooser.setValue(val, change);
      });
      return this;
    },

    unselectAll: function() {
      this.each(function() {
        if(this.utChooser) this.utChooser.unselectAll();
      });
      return this;
    },

    unexpandAll: function() {
      this.each(function() {
        if(this.utChooser) this.utChooser.unexpandAll();
      });
      return this;
    },

    hide: function() {
      this.each(function() {
        if(this.utChooser) this.utChooser.hide();
      });
      return this;
    },

    show: function() {
      this.each(function() {
        if(this.utChooser) this.utChooser.show();
      });
      return this;
    },

    hideItem: function(id) {
      this.each(function() {
        if(this.utChooser) this.utChooser.hideItem(id);
      });
      return this;
    },

    showItem: function(id) {
      this.each(function() {
        if(this.utChooser) this.utChooser.showItem(id);
      });
      return this;
    }
  };

  $.fn.utChooser = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utChooser');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
