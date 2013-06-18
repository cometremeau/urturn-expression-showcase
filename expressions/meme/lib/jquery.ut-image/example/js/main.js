UT.Expression.ready(function(post){
  $('#background')
    .utImage()
    .on('loaded.utImage', function(event){
      post.size({height: $(event.target).height()});
      post.valid(true);
    })
    .on('removed.utImage', function(){
      post.valid(false);
    });
});
