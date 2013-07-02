UT.Expression.ready(function(post) {
  var $video = $('.video');
  var $node = $(post.node);
  var $voteBox = $('.voteBox');

  // Both video must be present before the post is valid.
  var videoPresence = {
    'video-a': false,
    'video-b': false
  };

  // Define the post valid state given the current data.
  function validates() {
    post.valid(videoPresence['video-a'] && videoPresence['video-b']);
    console.log(videoPresence);
  }

  // The 2 video widgets needs to be displayed with
  // a 16:9 ratio.
  function resize() {
    var w = $node.width(); // remove the votes button width
    var h = (w/16)*9;
    $video.width(w).height(h);
    post.size(2*h + 50); // 50 = Vote bar size
  }

  $video.utVideo()
    // Validates on change.
    .on('utVideo:change', function(event, newValue){
      videoPresence[event.target.id] = !!newValue;
      validates()
    });
  // Listen to resize events
  post.on('resize', resize());

  // Bootstrap
  resize();
});
