UT.Expression.ready(function(post) {
  var $background = $('.post-background');
  var $panel = $('.sticker-panel');
  $background.utImage()
    .on('utImage:loaded', function(){
      post.size($(this).height());
      stickerManager.enable();
    })
    .on('utImage:removed', function(){
      stickerManager.disable();
    });

  var stickerManager = (function stickerManagerSingleton(){
    var $addButton = $('.button-add-sticker');
    var collection = post.storage.stickers || [];
    var maxZIndex = 10;
    var stickerCount = 0;

    var handleAddGiraffeEvent = function(event){
      var data = {stickerId: UT.uuid(), name: $(event.target).data('giraffe')};
      drawSticker(data);
      collection.push(data);
      post.storage.stickers = collection;
      post.save();

      post.popNavigation();
      closePanel();
    };

    var stickerAdded = function() {
      stickerCount ++;
      post.valid(stickerCount > 0);
    };
    var stickerRemoved = function() {
      stickerCount --;
      post.valid(stickerCount > 0);
    };
    var drawSticker = function(data){
      stickerAdded();
      $('<img class="sticker-giraffe" src="assets/images/giraffe_'+data.name+'.png"/>')
        .appendTo(post.node)
        .utSticker({
          width: 64,
          height: 'auto',
          top: $background.height()/2 - 48,
          left: $background.width()/2 - 32,
          id: data.stickerId
        })
        .on('load', function(event){
          $(event.target).utSticker('save');
        })
        .on('utSticker:remove', function(event){
          $.each(collection, function(idx){
            if(this.stickerId === data.stickerId){
              collection = collection.splice(idx, 1);
              console.log('removed from collection');
            }
            stickerRemoved();
          });
          post.storage.stickers = collection;
          post.save();
        });
    };

    var closePanel = function(){
      $background.utImage('update', {editable: true});
      $panel.hide();
      $addButton.show();
      $('.sticker-giraffe').utSticker('show');
    };

    // Display the panel of giraffe and let
    // you choose one.
    var addStickerWorkflow = function(){
      post.pushNavigation('cancel', closePanel);
      $background.utImage('update', {editable: false});
      $panel.show();
      $addButton.hide();
      $('.sticker-giraffe').utSticker('hide');
    };

    $addButton.on('click', addStickerWorkflow);
    $('.button-giraffe').on('click', handleAddGiraffeEvent);

    $.each(collection, function(){
      console.log('collection item', this);
      drawSticker(this);
    });

    return {
      enable: function(){
        $addButton.show();
      },
      disable: function(){
        $addButton.hide();
      }
    };
  }());
});