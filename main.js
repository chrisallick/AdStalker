//globals
var cid = "77c5d80362e34ae6869148deea59b1e7";
var username;
var t, debug = true;

var selectors = [
	"iframe[src*=2mdm]",
	"iframe[name*=google_ads_iframe_]",
	"div.ego_unit",
	"div._38vo",
	"a.profilePicThumb",
	"iframe#ad_main",
	"iframe#ad_sponsorship"
];


var logger = function() {
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger = function enableLogger() {
		if(oldConsoleLog == null) {
			return;
		}

		window['console']['log'] = oldConsoleLog;
	}

    pub.disableLogger = function disableLogger() {
		oldConsoleLog = console.log;
		window['console']['log'] = function() {};
	}

    return pub;
}();


var stalkabase = function() {
	var currentData = {};
	// need to check if all have been marked seen to start over
	function checkForAllSeen(currentImages) {
		var keys = Object.keys(currentImages);
		var length = keys.length;
		var allSeen = true;
		for(var i=0; i < length; i++) {
			var key = keys[i];
			var currentImage = currentImages[key];
			if(!currentImage.seen) {
				allSeen = false;
			}
		}
		if(allSeen) {
			for(var i=0; i < length; i++) {
				var key = keys[i];
				var currentImage = currentImages[key];
				currentImage.seen = false;
			}
			currentData[username] = currentImages;
			chrome.storage.local.set({"cpa_stalkee_image_data": JSON.stringify(currentData)});
		}
		return allSeen;
	}
	// loops through and finds images that haven't been seen
	function findImages(amount, currentImages, currentFound) {
		var images = currentFound;
		var count = 0;
		var keys = Object.keys(currentImages);
		var length = keys.length;
		checkForAllSeen(currentImages);
		for(var i=0; i < length && count <= amount; i++) {
			var key = keys[i];
			var currentImage = currentImages[key];
			if(!currentImage.seen) {
				currentFound[key] = currentImage;
				currentImage.seen = true;
				count++;
			}
		}
	}
	// main call to get the images, loops through until it gets the "amount" passed
	// in or if your images count is less than the amount you request it will return
	// how many images you currently have available
	function getImages(amount) {
		var currentImages = currentData[username];
		var currentImagesLength = Object.keys(currentImages);
		var foundLength = 0;
		if(amount > currentImagesLength) {
			amount = currentImagesLength
		}
		var currentFound = {};
		while(foundLength < amount) {
			findImages(amount, currentImages, currentFound);
			var foundLength = Object.keys(currentFound).length;
			amount = amount - foundLength;
		}
		chrome.storage.local.set({"cpa_stalkee_image_data": JSON.stringify(currentData)});
		return currentFound;
	}
	function loadPhotos(_id, callback) {
		var currentImages = currentData[username];
		$.get("https://api.instagram.com/v1/users/"+_id+"/media/recent/?client_id="+cid, function(response) {
			for( var i = 0; i < response.data.length; i++ ) {
				var img_url = response.data[i].images.low_resolution.url;
				var caption = "";
				if(!currentImages[img_url]) {
					if( response.data[i].caption ) {
						caption = response.data[i].caption.text;
					}

					// console.log( img_url, caption );
					currentImages[img_url] = {
						caption: caption,
						seen: false
					}
				}
			}

			images_loaded = true;
		});
	}
	function init(_id, callback) {
		chrome.storage.local.get("cpa_stalkee_image_data", function (result) {
	        if( result && result.cpa_stalkee_image_data ) {
	        	currentData = JSON.parse(result.cpa_stalkee_image_data);
	        }
	        if(!currentData[username]) {
	        	currentData[username] = {};
	        }
	        loadPhotos(_id);
	    });
	}
	return {
		getImages: getImages,
		init: init
	};
}();

if( !debug ) {
	logger.disableLogger();
}

var images = {};
var images_loaded = false;


function getInstagram() {
	$.get("https://api.instagram.com/v1/users/search?q="+username+"&client_id="+cid, function(data){
		var d = data.data;
		var _id;
		for( var i = 0; i < d.length; i++ ) {
			if( d[i].username == username ) {
				_id = d[i].id;
			}
		}

		if( _id ) {
			// console.log( _id );
			stalkabase.init(_id);

		}
	});
}

function replaceAdSpace() {
	$(selectors.join(',')).each(function(index,value){
		var _h = $(this).height();
		var _w = $(this).width();
		if($(this).css("display") !== "none" && _w > 35 && _h > 35){
			var style = $(this).getStyleObject();
			var el_i_w = $("<div/>").addClass("cpa_custom_img_wrapper").addClass('pulse2');

			var el = $("<div/>").css({
				width: $(this).width(),
				height: $(this).height(),
				margin: "0 auto",
				boxSizing: "border-box",
				//padding: "10px",
				overflow: "hidden",
				position: "relative",
				display: "none"
			});
			el.append(el_i_w).addClass("cpa_custom_wrapper");
			$(this).replaceWith(el);
			el.fadeIn('slow');
		}
	});
}

function findAds() {
	clearTimeout(t);
	if( images_loaded ) {
		$(".cpa_custom_wrapper").each(function(index,value){
			if( !$(this).hasClass("loaded") ) {
				var that = this;
				$(this).find('.cpa_custom_img_wrapper')[0].addEventListener("webkitAnimationIteration", function() {
					var images = stalkabase.getImages(10);
					var keys = shuffle(Object.keys(images));

					var wrapperWidth = $(that).width();
					var wrapperHeight = $(that).height();
					var diff = Math.abs(wrapperWidth-wrapperHeight);
					if( diff < 100 ) {
						var adIndex = Math.round(Math.random() * (basicAds.length-1))
						basicAds[adIndex].bind(that)(wrapperWidth, wrapperHeight, images, keys);
					} else {
						var adIndex = Math.round(Math.random() * (bannerAds.length-1));
						bannerAds[adIndex].bind(that)(wrapperWidth, wrapperHeight, images, keys);
					}
					$(that).find('.cpa_custom_img_wrapper').removeClass("pulse2");
					$(this).addClass("loaded");
					$(that).addClass("loaded");
				}, false);

			}
		});
	}

	t = setTimeout(function(){
		findAds();
	}, 1000);
}


var basicAds = [
	function(wrapperWidth, wrapperHeight, images, keys){
		var el_wrapperTarget = $(".cpa_custom_img_wrapper", this);
		var captionPositions = ['cpa_caption_top', 'cpa_caption_middle', 'cpa_caption_bottom',];
		var captionPosition = captionPositions[Math.round(Math.random() * captionPositions.length-1)];
		var wideBanner = wrapperWidth > wrapperHeight;
		var imageWidth = wideBanner ? wrapperWidth : wrapperHeight;
		var captionText = images[keys[0]].caption;
		var el_image = $("<img/>")
			.addClass("cpa_custom_img_single")
			.attr("src", keys[0]);

		$(el_image).css({
			width: imageWidth
		});

		el_wrapperTarget.append(el_image);

		if(captionText){
			var el_caption = $("<div/>")
				.addClass("cpa_custom_p")
				.css({
					position: 'absolute',
					display: 'table',
					height: "100%",
					padding: 0
				});
			var el_caption_text = $("<span/>")
				.text(captionText)
				.addClass("cpa_caption_vignette")
				.addClass(captionPosition)
				.css({padding: 10});
			el_caption.append(el_caption_text);
			$(this).append(el_caption);
		}
	}
];
var bannerAds = [
	function(wrapperWidth, wrapperHeight, images, keys){
		var el_wrapperTarget = $(".cpa_custom_img_wrapper", this);
		var shortSide = Math.min(wrapperHeight, wrapperWidth);
		var longSide = Math.max(wrapperHeight, wrapperWidth);
		var index = 0;
		var offset = 0;
		var wideBanner = wrapperWidth > wrapperHeight;
		var imageWidth = wideBanner ? wrapperHeight : wrapperWidth;

		if(longSide % imageWidth !== 0){
			var tileDiff = imageWidth - (longSide % imageWidth);
			offset = (tileDiff/2) * -1;
		}

		for(var spaceUsed = 0; spaceUsed < longSide; spaceUsed += shortSide) {
			var el_image = $("<img/>")
				.addClass("cpa_custom_img")
				.attr("src", keys[index]);

			if(wideBanner) {
				$(el_image).css({
					position: 'relative',
					width: imageWidth,
					left: offset
				});
			} else {
				$(el_image).css({
					position: 'relative',
					width: imageWidth,
					top: offset
				});
			}

			el_wrapperTarget.append(el_image);
			index++;
		}

		var el_bannerVignette = $("<div/>").addClass("cpa_banner_vignette")
		if(wideBanner){
			el_bannerVignette.addClass("cpa_banner_landscape");
		}else{
			el_bannerVignette.addClass("cpa_banner_portait");
		}

		$(this).append(el_bannerVignette);
	},
	function(wrapperWidth, wrapperHeight, images, keys){
		var el_wrapperTarget = $(".cpa_custom_img_wrapper", this);
		var wideBanner = wrapperWidth > wrapperHeight;
		var imageWidth = wideBanner ? wrapperHeight : wrapperWidth;
		var offset, blur, fontSize;
		var backgroundWidth = wideBanner ? (wrapperWidth*1.05) : (wrapperHeight*1.05);
		var imageWidth = wideBanner ? (wrapperWidth*0.3) : (wrapperHeight*0.3);
		var captionText = images[keys[0]].caption;

		if(wideBanner){
			offset = (wrapperHeight - wrapperWidth) / 2;
			blur = 'blur(' + (wrapperWidth / 20) + 'px)';
		}else{
			offset = (wrapperWidth - wrapperHeight) / 2;
			blur = wrapperHeight / 20;
		}

		var el_background = $("<img/>")
			.addClass("cpa_custom_img")
			.attr("src", keys[0])
			.css({
				position: 'absolute',
				width: backgroundWidth,
				filter: blur,
				WebkitFilter: blur
			});
		var el_image = $("<img/>")
			.addClass("cpa_custom_img")
			.attr("src", keys[0])
			.css({
				position: 'absolute',
				width: imageWidth
			});
		var el_caption = $("<div/>")
			.addClass("cpa_custom_p")
			.css({
				position: 'absolute',
				display: 'table',
				height: "100%",
				margin: 0
			});
		var el_caption_text = $("<span/>")
			.text(captionText)
			.addClass("cpa_dynamic_text")
			.css({
				display: 'table-cell',
				verticalAlign: 'middle'
			});
		el_caption.append(el_caption_text);


		if(wideBanner){
			var captionWidth = (wrapperWidth * 0.4) - 20;
			var captionHeight = wrapperHeight - 20;
			var captionArea = captionWidth * captionHeight;
			var charArea = captionArea / captionText.length;
			fontSize = Math.round(Math.sqrt(charArea));

			el_background.css({top: offset});
			el_image.css({
				top: (wrapperHeight - imageWidth) / 2,
				left: wrapperWidth * 0.6,
			});
			el_caption.css({
				width: '40%',
				left: wrapperWidth * 0.1
			});
			el_caption_text.css({fontSize: fontSize});
		}else{
			var captionWidth = wrapperWidth - 20;
			var captionHeight = (wrapperHeight * 0.4) - 20;
			var captionArea = captionWidth * captionHeight;
			var charArea = captionArea / captionText.length;
			fontSize = Math.round(Math.sqrt(charArea));

			el_background.css({left: offset});
			el_image.css({
				top: wrapperHeight * 0.6,
				left: (wrapperWidth - imageWidth) / 2
			});
			el_caption.css({
				height: '40%',
				top: wrapperWidth * 0.1
			});
			el_caption_text.css({fontSize: fontSize});
		}

		el_wrapperTarget.append(el_background);
		el_wrapperTarget.append(el_image);
		el_wrapperTarget.append(el_caption);
	}
];

$(window).load(function(){
	replaceAdSpace();
	t = setTimeout(function(){
		findAds();
	}, 2000);

    chrome.storage.local.get('cpa_stalkee', function (result) {
        if( result && result.cpa_stalkee ) {
        	username = result.cpa_stalkee;
        	getInstagram();
        }
    });
});

$(document).ready(function() {

});

function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
