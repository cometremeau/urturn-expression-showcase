UT.Expression.ready(function(post) {
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
    .on('utImage:loaded', function(){
      state.hasImage = true;
      // resize the post
      post.size($(this).height(), function(){
        // once done, display the sticker manager and revalidate
        stickerManager.enable();
        validates();
      });
    })
    // keep the actual size and disable the
    // add sticker button
    .on('utImage:removed', function(){
      console.log('REMOVED');
      state.hasImage = false;
      stickerManager.disable();
      stickerManager.removeAll();
      validates();
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
      var width = parseInt(post.size().width / 3, 10);
      // create and return a new sticker node
      return $('<img class="sticker-giraffe" src="assets/images/giraffe_'+data.name+'.png"/>')
        // that is append to the post outter node
        .appendTo(post.node)
        // make it a sticker with a width of 33% of the post width
        .utSticker({
          id: data.stickerId, // link the sticker to its data using the same generated uuid
          width: width,
          height: 'auto',
          top: parseInt($background.height()/2 - (width*1.2)/2, 10), // center vertically
          left: parseInt($background.width()/2 - width/2, 10) // center horizontally
        })
        // listen to the image load event (IMG, not utSticker)
        .on('load', function(event){
          // ensure the sticker is saved with the current image size.
          $(event.target).utSticker('save');
          // there is one more sticker, officially.
          state.stickerCount ++;
          validates(); // we are probably a valid post at this state.
        })
        // listen to the remove event to invalidate the post and remove
        // the associated data from collection
        .on('utSticker:remove', function(event){
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
      $addButton.show();
    };

    var disableScene = function(){
      $('.sticker-giraffe').utSticker('hide');
      $addButton.hide();
    };

    // Close the panel once a sticker has been selected
    // or the pop state triggered from outside.
    var closePanel = function(){
      $background.utImage('update', {editable: true});
      $panel.hide();
      enableScene();
    };

    // display the panel of giraffe and let
    // you choose one.
    var addStickerWorkflow = function(){
      post.pushNavigation('cancel', closePanel);
      $background.utImage('update', {editable: false});
      $panel.show();
      disableScene();
    };

    // bind the add button
    $addButton.on('click', addStickerWorkflow);
    $('.button-giraffe').on('click', handleAddStickerEvent);

    $.each(collection, function(){
      console.log('collection item', this);
      drawSticker(this);
    });

    return {
      enable: enableScene,
      disable: disableScene,
      removeAll: function(){
        $('.sticker-giraffe').utSticker('remove');
      }
    };
  }());
});