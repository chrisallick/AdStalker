//globals
var cid = "77c5d80362e34ae6869148deea59b1e7";
var username;
var t, debug = true;

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

			_images_loaded = true;
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

var _images = {};
var _images_loaded = false;


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

var _sizes = [15,30,31,33,60,90,125,150,210,240,250,280,300,336,350,400,468,480,600,728];
function findAds() {
	clearTimeout(t);

	$("iframe").each(function(index,value){
		var _h = $(this).height();
		var _w = $(this).width();
		if( _sizes.indexOf(_h) != -1 ) {
			if($(this).css("display") !== "none" && _w > 15){
				var style = $(this).getStyleObject();
				var el_i_w = $("<div/>").addClass("cpa_custom_img_wrapper");

				var el = $("<div/>").css({
					width: $(this).width(),
					height: $(this).height(),
					margin: "0 auto",
					boxSizing: "border-box",
					//padding: "10px",
					overflow: "hidden",
					position: "relative"
				}).append(el_i_w).addClass("cpa_custom_wrapper");

				$(this).replaceWith(el);
			}
		}
	});

	if( _images_loaded ) {
		$(".cpa_custom_wrapper").each(function(index,value){
			if( !$(this).hasClass("loaded") ) {
				var _images = stalkabase.getImages(10);
				var keys = shuffle(Object.keys(_images));

				var _w = $(this).width();
				var _h = $(this).height();
				var diff = Math.abs(_w-_h);
				if( diff < 100 ) {
					var el_i = $("<img/>").addClass("cpa_custom_img_single").attr("src",keys[0]);

					if( _w > _h ) {
						$(el_i).css({
							width: _w
						});
					} else {
						$(el_i).css({
							width: _h
						});
					}

					$(".cpa_custom_img_wrapper", this).append(el_i);

					var el_p = $("<p/>").text(_images[keys[0]]).addClass("cpa_custom_p");
					$(this).append(el_p);
				} else {
					var shortSide = Math.min(_h, _w);
					var longSide = Math.max(_h, _w);
					var index = 0;

					for( var spaceUsed = shortSide; spaceUsed < longSide; spaceUsed += shortSide ) {
						var el_i = $("<img/>").addClass("cpa_custom_img").attr("src",keys[index]);
						if( _w > _h ) {
							$(el_i).css({
								width: _h
							});
						} else {
							$(el_i).css({
								width: _w
							});
						}
						//$(this).width($(this).width()+_h).append(el_i);
						//$(this).append(el_i);
						$(".cpa_custom_img_wrapper", this).append(el_i);
						index++;
					}
				}

				$(this).addClass("loaded");
			}
		});
	}

	t = setTimeout(function(){
		findAds();
	}, 1000);
}

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

$(window).load(function(){
	t = setTimeout(function(){
		findAds();
	}, 1000);

    chrome.storage.local.get('cpa_stalkee', function (result) {
        if( result && result.cpa_stalkee ) {
        	username = result.cpa_stalkee;
        	getInstagram();
        }
    });
});

$(document).ready(function() {

});