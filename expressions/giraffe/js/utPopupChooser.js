(function ($) {
  var methods = {
    init: function (options) {
      return this.each(function () {
        var defaults = {
          title: 'Choose item',
          items: [
            /*{html: '<div class="skin1"></div>', value: 0}*/
          ],
          onChanged: function (data) {
          },
          onShow: function() {
          },
          onClose: function () {
          }
        };

        var $that = $(this);
        var that = {};
        this.utPopupChooser = that;
        that.options = $.extend(defaults, options);

        that.settings = {
          isTouch: (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints > 0))
        };

        $that.addClass('utPopupChooser');

        if (that.settings.isTouch) {
          $that.addClass('utPopupChooser_mobile');
        }

        $that.on('click', function (e) {
          e.stopPropagation();
          that.options.onClose();
          that.hide();
          return false;
        });

        that.utPopupChooserItems = $('<div>').addClass("utPopupChooser_items").appendTo($that);
        jQuery("<a>", {"class": "close_button", "href": "#"}).appendTo(that.utPopupChooserItems).html('<span class="icon_delete"></span>').on('click', function (e) {
          e.stopPropagation();
          that.options.onClose();
          that.hide();
          return false;
        });

        that.utPopupChooserTitle = $('<div>').addClass("utPopupChooser_title").appendTo(that.utPopupChooserItems).html("&nbsp;&nbsp;&nbsp;<span>" + that.options.title + "</span>"); //<span class='icon_theme'></span>

        $.each(that.options.items, function (i, v) {
          var item = $("<div>").addClass("utPopupChooser_item").appendTo(that.utPopupChooserItems).html(v.html).attr("data-value", v.value).on('click', function (e) {
            e.stopPropagation();
            that.options.onChanged($(this).attr("data-value"));
            return false;
          });
          $("<div>").addClass("utPopupChooser_border").appendTo(item);
        });

        that.utPopupChooserItems.find('.content div').on('touchstart', function(){
          $(this).addClass('active');
        }).on('touchend', function(){
          $(this).removeClass('active');
        });

        that.unselectAll = function () {
          $that.find(".utPopupChooser_item").removeClass('utPopupChooser_item_selected');
        };

        that.select = function (v) {
          that.unselectAll();
          $that.find('[data-value="' + v + '"]').addClass('utPopupChooser_item_selected');
        };

        that.show = function () {
          $that.show();
          that.utPopupChooserItems.css('margin-top', -that.utPopupChooserItems.outerHeight()/2);
          setTimeout(function(){
            $that.addClass("utPopupChooser_show");
            that.options.onShow();
          },1);
        };

        that.hide = function () {
          $that.removeClass("utPopupChooser_show");
          $that.hide();
        };

        that.setTopPosition = function (top) {
          that.utPopupChooserItems.css('top', top);
        };

        that.updateSize = function() {
          that.utPopupChooserItems.css('margin-top', -that.utPopupChooserItems.outerHeight()/2);
        };
      });
    },

    unselectAll: function () {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.unselectAll.call(this);
      });
      return this;
    },

    select: function (val) {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.select.call(this, val);
      });
      return this;
    },

    hide: function () {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.hide.call(this);
      });
      return this;
    },

    show: function () {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.show.call(this);
      });
      return this;
    },

    setTopPosition: function (top) {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.setTopPosition.call(this, top);
      });
      return this;
    },

    updateSize: function() {
      this.each(function () {
        if (this.utPopupChooser) this.utPopupChooser.updateSize.call(this);
      });
      return this;

    }
  };

  $.fn.utPopupChooser = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utPopupChooser');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
