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
;(function($, window, document, undefined) {
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
    options.ui = $.extend({}, $.fn.utImage.defaults.ui, options.ui);
    var el              = element,
        storagePrefix   = 'utImage_',
        namespace       = 'utImage',
        $el             = $(el),
        initialized     = false,
        $overlay,           // the selector that will retrieve an overlay dom node
        ratio,              // the image ratio h/w
        imageStorageKey,    // the UT.Image instance storage key
        ratioStorageKey,    // the ratio storage key
        image,              // the image element
        post;               // the post instance

    function init() {
      $el.addClass('ut-image media-placeholder');

      UT.Expression.ready(function(p){
        post = p;

        // Default editable value depends on the post context
        if (options.editable === undefined){
          options.editable = p.context.editor;
        }

        // options.id will be used to store the data
        options.id = options.id || $el.attr('id') || 'noname';

        imageStorageKey = storagePrefix+options.id+'_img';
        ratioStorageKey = storagePrefix+options.id+'_ratio';

        // Default image came from storage if not in options
        if (!options.data && !options.reuse) {
          options.data = post.storage[imageStorageKey];
        }

        // Default image come from the parent post triggered by the "ur" event
        if (!options.data && options.reuse) {
          options.data = reuse();
        }

        ratio = post.storage[ratioStorageKey];
        defineSize();

        if(options.editable) {
          renderEdit();
        } else {
          removeEdit();
        }
        if(!initialized){
          initialized = true;
          displayEmptyPlaceHolder(true);
          loadImage(function(){
            trigger('change', {data: options.data}, {data: undefined});
          });
          trigger('ready');
        }

        post.on('resize', handlePostResize);
      });
    }

    function handlePostResize () {
      defineSize();
      displayImage();
    }

    function trigger(name, data){
      setTimeout(function(){
        $el.trigger(namespace+':'+name, data);
      }, 0);
    }

    function displayEmptyPlaceHolder(enabled){
      if(enabled) {
        $el.addClass('media-placeholder');
      } else {
        $el.removeClass('media-placeholder');
      }
    }

    /**
     * Compute the placeholder size depending of the current node, parent node, ratio and so on
     *
     * The size is computed given the followings rules:
     * 1) the width is by order
     *    a) options.width
     *    b) 100%
     *    d) css#min-width
     * 2) the height is by order
     *    a) width*ratio
     *    b) options.height
     *    c) auto
     *    e) css#min-height
     */
    function defineSize() {
      var oldWidth = $el.width(),
          oldHeight = $el.height(),
          newWidth,
          newHeight;

      if(options.width){
        $el.width(options.width).css('min-width', options.minSize);
        newWidth = $el.width();
      } else {
        newWidth = oldWidth;
      }
      if(ratio){
        newHeight = Math.round($el.width()*ratio);
        $el.height(newHeight);
      } else if(options.height){
        $el.height(options.height);
        newHeight = $el.height();
      } else {
        newHeight = oldHeight;
      }
      if($el.css('min-height') === '0px'){
        $el.css('min-height', options.minSize);
      }
      if(newHeight !== oldHeight || newWidth !== oldWidth){
        trigger('resize', {width: newWidth, height: newHeight});
      }
    }

    function setVisible(el, value){
      if(value){
        el.removeClass('is-hidden');
      } else {
        el.addClass('is-hidden');
      }
    }

    function renderEdit() {
      var actionButtons = '<ul class="tls horizontal index spaced ut-image-action-list">'+
          '<li><a href="#" class="ut-image-edit-button edit-button action-button icon_camera spaced-right large-button button">Edit</a></li>'+
          '<li><a href="#" class="ut-image-remove-button remove-button action-button icon_trash large-button button"></a></li>'+
          '</ul>'+
          '<a href="#" class="ut-image-add-button icon_camera media-button button">Add Image</a></div>';

      $el
        .append(actionButtons)
        .on('click','.ut-image-add-button', addImage)
        .on('click','.ut-image-edit-button', recropImage )
        .on('click','.ut-image-remove-button', removeImage);

      if (!options.data && options.autoAdd === true) {
          addImage();
      }

      if (options.data) {
        displayImage(options.data);
        $el.addClass('ut-image-active');
      }
      displayControls();
    }

    function removeEdit() {
      $el
        .off('click','.ut-image-add-button', addImage)
        .off('click','.ut-image-edit-button', recropImage)
        .off('click','.ut-image-remove-button', removeImage);
      $el.find('.ut-image-add-button').remove();
      $el.find('.ut-image-action-list').remove();
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

      if(context === 'edit'){
        imgOptions.size.autoCrop = false;
      }

      // Specify an height only if one of autoCrop or flexRatio is false.
      if( ! (imgOptions.size.autoCrop && imgOptions.size.flexRatio) ) {
        imgOptions.size.height = $el.height();
      }

      // In the case where an height is defined, adapt the UI of the camera.
      if(imgOptions.size.height && imgOptions.size.width){
        imgOptions.size.adaptUI = true;
      }

      // Apply any predefined filters.
      if (options.filter) {
        imgOptions.applyShaders = options.filter;
      }

      // Add the image data if we do a recrop.
      if (context === 'edit') {
        imgOptions.image = options.data;
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
      $el.removeClass('ut-image-active').addClass('media-placeholder').css('background-image', '');
      $(image).remove();
      image = null;
      if (options.autoSave === true) {
        post.storage[imageStorageKey] = null;
        post.save();
      }
      var oldValue = options.data;
      options.data = null;

      if (options.autoAdd === true) {
        addImage();
      }
      displayControls();

      trigger('change', [{data: undefined}, {data: oldValue}]);
      trigger('remove');
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

    function displayControls(){
      setVisible($el.find('.ut-image-add-button'), options.editable && !image && options.ui.add);
      setVisible($el.find('.ut-image-edit-button'), options.editable && image && options.ui.edit);
      setVisible($el.find('.ut-image-remove-button'), options.editable && image && options.ui.remove);
    }

    function loadImage(onload) {
      if(!options.data){
        return;
      }

      image = new Image();
      image.onload = function() {
        removeLoader();
        // Compute image ratio
        if(image.width){
          ratio = image.height / image.width;
        } else {
          ratio = 0;
        }
        defineSize();
        displayImage();
        if(onload){
          onload(image, ratio);
        }
        displayControls();
      };
      image.onerror = function() {
        removeLoader();
      };
      image.src = options.data.url;
    }

    function handleImageReceived(data, action) {
      var oldData = options.data;
      options.data = data;

      if(!data) {
        removeLoader();
        $('.button',$el).removeClass('is-hidden');
        return false;
      }

      loadImage(function(domImage, ratio){
        if (options.autoSave === true) {
          post.storage[imageStorageKey] = options.data;
          post.storage[ratioStorageKey] = ratio;
          trigger('change', [{data: options.data}, {data: oldData}]);
          if(options.autoSave){
            post.save();
            trigger('save', options.data);
          }
          if(action){
            trigger(action, options.data);
          }
        }
      }, oldData);
    }

    function addLoader() {
      var domnode = '<div class="loading_dots absolute centered"><span></span><span></span><span></span><span></span><span></span></div>';
      $el.append(domnode);
    }

    function removeLoader() {
      $el.find('.loading_dots').remove();
    }

    function displayImage() {
      if(image) {
        var cssurl = 'url('+image.src+')';
        if($el.css('background-image') !== cssurl){
          $el.css('background-image', cssurl).addClass('ut-image-active');
        }
        displayEmptyPlaceHolder(false);
      }
    }

    /* return the data from the parent post */
    function reuse() {
      if(!post.storage[imageStorageKey] && post.collection('parent') && post.collection('parent')[imageStorageKey]){
        return post.collection('parent')[imageStorageKey];
      }
    }

    function destroy() {
      $el.each(function() {
        trigger('destroy');
        $el
          .removeData('utImage')
          .removeClass('ut-image ut-image-active media-placeholder')
          .empty();
        $el.off(handlePostResize);
      });
    }

    function imageDataAccessor(val) {
      if(val !== undefined){
        options.data = val;
        return $el;
      } else {
        return options.data;
      }
    }

    // Retrieve the DOM node
    function imageAccessor() {
      return image;
    }

    function ratioAccessor(val) {
      if(val !== undefined){
        ratio = val;
        return $el;
      } else {
        return ratio;
      }
    }

    function option(key) {
      return options[key];
    }

    function update(opts) {
      options = $.extend(options, opts);
      init();
    }

    function overlay() {
      if(!$overlay){
        $overlay = $('<div class="ut-image-overlay"></div>').prependTo($el);
      }
      return $overlay;
    }

    init();

    return {
      option: option,
      destroy: destroy,
      data: imageDataAccessor,
      image: imageAccessor,
      ratio: ratioAccessor,
      overlay: overlay,
      update: update
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
    autoSave: true,
    reuse: false,
    flexRatio: true,
    minSize: '100px',
    editable: undefined, // true in edit mode, false in player mode
    ui: {
      edit: true,
      add: true,
      remove: true
    }
  };

})(jQuery, window, document, undefined);