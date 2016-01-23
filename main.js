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

var t, debug = true;
if( !debug ) {
	logger.disableLogger();
}

$(window).load(function(){

});

var _images = {};
var _images_loaded = false;
function loadPhotos(_id) {
	$.get("https://api.instagram.com/v1/users/"+_id+"/media/recent/?client_id="+cid, function(data) {
		for( var i = 0; i < data.data.length; i++ ) {
			var img_url = data.data[i].images.low_resolution.url;
			var caption = "";

			if( data.data[i].caption ) {
				caption = data.data[i].caption.text;
			}

			// console.log( img_url, caption );
			_images[img_url] = caption;
		}

		_images_loaded = true;
	});
}

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
			loadPhotos( _id );
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

var cid = "77c5d80362e34ae6869148deea59b1e7";
var username = "mpallick";
var t;
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