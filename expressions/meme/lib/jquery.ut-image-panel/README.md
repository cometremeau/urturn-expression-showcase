# Ut-Image

Image component for Urturn expressions

[![Build Status](https://travis-ci.org/urturn/jquery.ut-image-panel.png?branch=master)](https://travis-ci.org/urturn/jquery-ut-image-panel)

## Getting Started

Install with [bower][bower-url] to get the dependencies

```bash
bower install git://github.com/urturn/jquery.ut-image-panel.git
```

In your `expression.json` file, add the following dependencies:

```json
{
	...,
	"dependencies": [
		{ "path": "components/urturn-expression-css/css/style_full.css" },
		{ "path": "components/jquery/jquery.js" },
		{ "path": "components/jquery.ut-image-panel/dist/js/jquery.ut-image-panel.js" },
		{ "path": "components/jquery.ut-image-panel/dist/css/jquery.ut-image-panel.css"	}
	],
	...
}
```

Component Usage

```javascript
UT.Expression.ready(function(post) {
  jQuery("#myimage").utImage();
});
```

## Parameters
### Options
#### post
Type: <code>UT.Post object</code>

#### size
Type: ```object```

{ width: 200px, height: 300px }

#### filter
Type: ```string```

json filter, more info here: http://urturn.github.io/urturn-expression-api/Image%20Filters

#### autoSave
Type: ```boolean```
Default: ```true```

Save in post.storage automatically when image added or remove

*Required: the dom node should have an unique id attribute*

#### autoAdd
Type: ```boolean```
Default: ```false```

Trigger a post.dialog('image') during initialisation

#### autoCrop
Type: ```boolean```
Default: ```false```

Crop image when added

#### flexRatio
Type: ```boolean```
Default: ```false```

When the crop panel is displayed, can change the ratio of the crop zone

### Events:
* loaded
* saved
* added(image) ``UT.Image object```
* recroped(image) ``UT.Image object```
* removed
* resized(size)

## Examples
Basic:

```javascript
jQuery("#myimage").utImage();
```

With options:

```javascript
jQuery("#image,#image2").utImage({
	post: post,
	size: {
		width: 576,
		height: 300
	},
	filter: [{"filter":"sepia","parameters":{"strength":"0.86"}}]
})
.on('utImage:ready', function() {
	console.log("Let's go");
}),
.on('utImage:saved',function() {
	console.log("Image saved");
})
.on('utImage:added', function(e,image) {
	console.log("Image Recroped");
}),
.on('utImage:loaded', function(e,image) {
	console.log("Image Loaded");
}),
.on('utImage:removed', function() {
	console.log("Image Removed");
}),
.on('utImage:recroped', function(e,image) {
	console.log("Image Recroped");
}),
.on('utImage:resized', function(e,size) {
	console.log("Container size changed",size);
});
```

## Dependencies
The dependencies are managed with [Bower][bower-url]
* jQuery >= 1.8.1
* [Urturn API >= 0.8.3](http://urturn.github.io/urturn-expression-api/)
* [Urturn Expression CSS](http://urturn.github.io/urturn-expression-css/)


## Release History
#### 0.8.4 - 2013/06/09
- Refactor events trigger utImage:event
- Fix crop edit issue

#### 0.5.4 - 2013/04/19
- Fixed bugs with sizing (refactored the way size is defined)
- Added a loaded event
- Improved unit tests with sizing tests

#### 0.5.0 - 2013/04/13
- rewrite events
- add data('image')
- lots of bugs fixes
- better handling of differents devices / width

[zip]: https://github.com/urturn/jquery.ut-image-panel/archive/master.zip
[bower-url]: https://github.com/twitter/bower
