UT.Expression.ready(function(post) {

  "use strict";
  $(post.node).css("font-size", "10px");

  var $background = $('.post-background'), // background utImage panel selector
      $panel = $('.sticker-panel'), // utSticker selector
      state = {
        hasImage: false, // is an image present?
        stickerCount: 0 // number of stickers
      };

  // update the validity state of the post based on its current state.
  // To be valid, a post must have sticker > 1 and an image
  var validates = function(){
    post.valid(state.hasImage && state.stickerCount > 0);
  };

  $background.utImage()
    // set the post height to the image height
    // and update the state
    .on('utImage:change', function(event, newValues,oldValues){
      console.log(state.hasImage = !!newValues.data);
      if(state.hasImage) {
        // resize the post
        post.size($(this).height(), function(){
          // once done, display the sticker manager and revalidate
          stickerManager.enable();
          if ((!oldValues || (oldValues && !oldValues.data)) && !post.storage.stickers) {
            stickerManager.add();
          } else {
            stickerManager.enable();
          }
        });
      } else {
        state.hasImage = false;
        stickerManager.disable();
        stickerManager.removeAll();
      }
      validates();
    })
    .on('utImage:ready',function() {
      if (!$background.utImage('data').url) {
        $background.utImage('dialog');
      }
    });

  // Sticker Manager handle the rendering of the stickers and their addition.
  var stickerManager = (function stickerManagerSingleton(){
    var $addButton = $('.button-add-sticker'), // add sticker button
        collection = post.storage.stickers || []; // holds the data inside each sticker

    // Handler for when a sticker should be added to the scene.
    var handleAddStickerEvent = function(event){
      // generate a unique uuid that will be associated with the utSticker component
      var id = UT.uuid();
      // the data object contains the data to reconstituate the sticker content.
      var data = {stickerId: id, name: $(event.target).data('giraffe')};
      drawSticker(data)
        .utSticker('focus'); // and give it the focus.
      // Stop event propagation to prevent blur of the just focused element
      event.preventDefault();
      event.stopPropagation();

      // Save the data
      collection.push(data);
      // HACK: we need to re-assigne the collection
      // because if we don't do that the storage won't
      // detect there was an update to the array.
      post.storage.stickers = collection;
      post.save();

      // Remove the 'cancel' navigation state
      post.popNavigation();
      closePanel();
    };

    var drawSticker = function(data){
      // define a width which is about 33% of the post width
      var postSize = post.size();
      var width = parseInt(post.size().width / 3, 10);
      // create and return a new sticker node
      return $('<img class="sticker-giraffe" src="assets/images/giraffe_'+data.name+'.png"/>')
        // that is append to the post outter node
        .appendTo(post.node)
        // make it a sticker with a width of 33% of the post width
        .utSticker({
          id: data.stickerId, // link the sticker to its data using the same generated uuid
          styles:{
            pos: {
              width: width
            }
          }
        })
        // listen to the image load event (IMG, not utSticker)
        .on('load', function(event){
          // there is one more sticker, officially.
          state.stickerCount ++;
          validates(); // we are probably a valid post at this state.
        })
        // listen to the remove event to invalidate the post and remove
        // the associated data from collection
        .on('utSticker:destroy', function(event){
          $.each(collection, function(idx){
            if(this.stickerId === data.stickerId){
              collection.splice(idx, 1);
              state.stickerCount --;
              validates();
              return;
            }
          });
          // HACK: we need to re-assigne the collection
          // because if we don't do that the storage won't
          // detect there was an update to the array.
          post.storage.stickers = collection;
          post.save();
        });
    };
    var enableScene = function(){
      $('.sticker-giraffe').utSticker('show');
      $addButton.removeClass('is-hidden');
    };

    var disableScene = function(){
      $('.sticker-giraffe').utSticker('hide');
      $addButton.addClass('is-hidden');
    };

    // Close the panel once a sticker has been selected
    // or the pop state triggered from outside.
    var closePanel = function(e){
      if (e) {
        e.preventDefault();
      }
      $background.utImage('update', {editable: true});
      $panel.hide();
      enableScene();
    };

    // display the panel of giraffe and let
    // you choose one.
    var addStickerWorkflow = function(e){
      if (e) {
        e.preventDefault();
      }
      post.pushNavigation('cancel', closePanel);
      $background.utImage('update', {editable: false});
      $panel.show();
      $panel.css('margin-top',-$panel.height()/2);
      disableScene();
    };

    // bind the add button
    $addButton.on('click', addStickerWorkflow);
    $('.button-giraffe').on('click', handleAddStickerEvent);
    $('.close-button').on('click',closePanel);

    $.each(collection, function(){
      drawSticker(this);
    });

    return {
      enable: enableScene,
      disable: disableScene,
      add: addStickerWorkflow,
      removeAll: function(){
        $('.sticker-giraffe').utSticker('destroy');
      }
    };
  }());

});
