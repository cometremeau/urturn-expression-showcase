/*global UT: true, jQuery: true */
/*
 * This source code is licensed under version 3 of the AGPL.
 *
 * Copyright (c) 2013 by urturn
 *
 * Addendum to the license AGPL-3:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
;(function($) {
  "use strict";
  /**
   * Enhace the given <code>element</code> to make it a placeholder for images.
   *
   * It will displays a add button if none image has been selected and an
   * edit and delete button if an image has been choosen. This component
   * will manage its data automatically, making it saved and initialized
   * given post#storage content.
   *
   * Data(the image) will be stored in two different keys:
   * - utImage_[element.id]_img contains an UT.Image instance
   * - utImage_[element.id]_ratio contains the selected image ratio
   *
   * The element size will be defined by the element size, or will take
   * the full post height or width if they are 0 (see <code>defineSize()</code>
   * function below).
   */
  function UtImage(element, options) {
    options = $.extend({}, $.fn.utImage.defaults, options);
    var el              = element,
        storagePrefix   = 'utImage_',
        namespace       = 'utImage',
        $el             = $(el),
        post            = options.post || null,
        storage         = null,
        mode            = null,
        imageStorageKey = storagePrefix+$el.attr('id')+'_img',
        ratioStorageKey = storagePrefix+$el.attr('id')+'_ratio',
        ratio           = 1,
        minSize         = 32,
        image;

    function init() {
      $el.addClass('ut-image ut-image-placeholder');

      UT.Expression.ready(function(p){
        post = p;
        storage = p.storage;
        mode = p.context;
        ratio = storage && storage[ratioStorageKey];

        if (options.image) {
          image = options.image;
        } else if (storage && storage[imageStorageKey]) {
          image = storage[imageStorageKey];
        }
        defineSize();
        displayEmptyPlaceHolder(true);
        loadImage();
        if (mode && mode.editor === true) {
          renderEdit();
        }
        trigger('ready');
      });
    }

    function trigger(name, data){
      $el.trigger(namespace+':'+name, data);
    }

    function displayEmptyPlaceHolder(enabled){
      if(enabled) {
        $el.addClass('ut-image-placeholder');
      } else {
        $el.removeClass('ut-image-placeholder');
      }
    }

    /**
     * Compute the placeholder size depending of the current node, parent node, ratio and so on
     *
     * The size is computed given the followings rules:
     * 1) the width is by order
     *    a) options.width
     *    b) element.width()
     *    c) post.node.width()
     *    d) css#min-width
     * 2) the height is by order
     *    a) width*ratio
     *    b) options.height
     *    c) element.height()
     *    d) post.node.height()
     *    e) css#min-height
     */
    function defineSize() {
      var postNode = $(post.node);
      if(options.width){
        $el.width(options.width);
      } else if($el.width() <= minSize && postNode.width()){
        $el.css('width', postNode.width() + 'px');
      }
      if(ratio){
        $el.height(Math.round($el.width()*ratio));
      } else if(options.height){
        $el.height(options.height);
      } else if($el.height() <= minSize && postNode.height()){
        $el.css('height', postNode.height() + 'px');
      }
      trigger('resized');
    }

    function renderEdit() {
      var actionButtons = '<ul class="tls horizontal index spaced">'+
          '<li><a href="#" class="edit-button action-button icon_camera spaced-right large-button button">Edit</a></li>'+
          '<li><a href="#" class="remove-button action-button icon_trash large-button button"></a></li>'+
          '</ul>'+
          '<div class="add-button-wrapper"><a href="#" class="add-button dark-button icon_camera spaced-right large-button button">Add Image</a></div>';

      $el
        .append(actionButtons)
        .on('click','.add-button',addImage)
        .on('click','.edit-button', recropImage )
        .on('click','.remove-button', removeImage);

      if (!image && options.autoAdd === true) {
          addImage();
      }

      if (image) {
        displayImage(image);
        $el.addClass('ut-image-active');
      }
    }


    /**
     * Retrieve proper image dialog options given the passed options object.
     */
    function imageOptions(options, context){
      var imgOptions = {};

      // At least a width and flex ratio is true by default.
      imgOptions.size = {
        width: $el.width(),
        flexRatio : options.flexRatio
      };

      // If autocrop is not specified, it will auto crop
      // on edition but not on insertion (add image).
      if( options.autoCrop !== undefined ) {
        imgOptions.size.autoCrop = options.autoCrop;
      } else {
        imgOptions.size.autoCrop = (context === 'add');
      }

      // Specify an height only if one of autoCrop or flexRatio is false.
      if( ! (imgOptions.size.autoCrop && imgOptions.size.flexRatio) ) {
        imgOptions.size.height = $el.height();
      }

      // In the case where an height is defined, adapt the UI of the camera.
      if(imgOptions.size.height && imgOptions.size.width){
        imgOptions.adaptUI = true;
      }

      // Apply any predefined filters.
      if (options.filter) {
        imgOptions.applyShaders = options.filter;
      }

      // Add the image data if we do a recrop.
      if (context === 'edit') {
        imgOptions.image = image;
      }
      return imgOptions;
    }

    function addImage(e) {
      if (e) { e.preventDefault(); }

      $('.add-button',$el).addClass('is-hidden');

      post.dialog('image', imageOptions(options, 'add'), function(data, error){
        addLoader();
        if(error) {
          removeLoader();
          return;
        }
        handleImageReceived(data,'added');
      });
    }

    function removeImage(e) {
      e.preventDefault();
      $el.removeClass('ut-image-active').addClass('ut-image-placeholder').css('background-image', '');
      if (options.autoSave === true) {
        storage[imageStorageKey] = null;
        post.save();
      }

      $el.removeData('image');
      image = null;

      if (options.autoAdd === true) {
        addImage();
      }

      trigger('removed');
    }

    function recropImage(e) {
      e.preventDefault();

      post.dialog('crop', imageOptions(options,'edit'), function(data,error){
        if(error) {
          removeLoader();
          return;
        }
        $el.css('background-image', '');

        handleImageReceived(data,'recroped');
      });
    }

    function loadImage(onload) {
      if(!image){
        return;
      }
      var newImage = new Image();

      newImage.onload = function() {
        removeLoader();
        // Compute image ratio
        if(newImage.width){
          ratio = newImage.height / newImage.width;
        } else {
          ratio = 0;
        }
        defineSize();
        displayImage();
        trigger('loaded', image);
        if(onload){
          onload(newImage, ratio);
        }

        $('.button',$el).removeClass('is-hidden');
      };

      newImage.onerror = function() {
        removeLoader();
      };

      newImage.src = image.url;
    }

    function handleImageReceived(data, action) {
      image = data;

      if(!data) {
        removeLoader();
        $('.button',$el).removeClass('is-hidden');
        return false;
      }

      loadImage(function(domImage, ratio){
        if (options.autoSave === true) {
          storage[imageStorageKey] = image;
          storage[ratioStorageKey] = ratio;
          post.save();
          trigger('saved', image);

          if(action){
            trigger(action, image);
          }
        }
      });
    }

    function addLoader() {
      var domnode = '<div class="loading_dots absolute centered"><span></span><span></span><span></span><span></span><span></span></div>';
      $el.append(domnode);
    }

    function removeLoader() {
      $el.find('.loading_dots').remove();
    }

    function displayImage() {
      if (image) {
        $el.css('background-image', 'url(' + image.url + ')')
          .addClass('ut-image-active');
        displayEmptyPlaceHolder(false);
      }
    }

    function option (key, val) {
      if (val) {
        options[key] = val;
      } else {
        return options[key];
      }
    }

    function destroy() {
      $el.each(function() {
        trigger('destroy');
        $el
          .removeData('utImage')
          .removeClass('ut-image ut-image-active ut-image-placeholder')
          .empty();
      });
    }

    function imageAccessor(val) {
      if(val !== undefined){
        image = val;
        return $el;
      } else {
        return image;
      }
    }

    function ratioAccessor(val) {
      if(val !== undefined){
        ratio = val;
        return $el;
      } else {
        return ratio;
      }
    }

    init();

    return {
      option: option,
      destroy: destroy,
      image: imageAccessor,
      ratio: ratioAccessor
    };
  }

  $.fn.utImage = function(options) {
    if (typeof arguments[0] === 'string') {
      var methodName = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var returnVal;
      this.each(function() {
        if ($.data(this, 'utImage') && typeof $.data(this, 'utImage')[methodName] === 'function') {
          returnVal = $.data(this, 'utImage')[methodName].apply(this, args);
        } else {
          throw new Error('Method ' +  methodName + ' does not exist on jQuery.utImage');
        }
      });
      if (returnVal !== undefined){
        return returnVal;
      } else {
        return this;
      }
    } else if (typeof options === "object" || !options) {
      return this.each(function() {
        if (!$.data(this, 'utImage')) {
          $.data(this, 'utImage', new UtImage(this, options));
        }
      });
    }
  };

  $.expr[':'].utImage = function(elem) {
    return $(elem).hasClass('ut-image');
  };

  $.fn.utImage.defaults = {
    autoAdd: false,
    autoSave: true,
    flexRatio: true
  };

})(jQuery);