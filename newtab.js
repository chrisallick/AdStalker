stalkdar.init();

$(function() {
  var cid = "77c5d80362e34ae6869148deea59b1e7";
  $('.recommend-btn').on('click',function(){
    $('.active-stalker').animate({
        opacity: '0'
    },function(){
      $('.active-stalker').hide();
      $('.recommend-stalk').show();
      $('.recommend-stalk').animate({
        opacity: '1'
      });
    });
  });

  $('.stalk-btn').on('click',function(){
    var stalkee = $(this).parent('.recommend-user').attr('data-user');
    var now = moment();
    chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': now}, function (result) {
      $('#cpa_stalkee_un').text(stalkee);
      chrome.storage.local.get("cpa_stalkee_image_data", function(result) {
            if( result && result.cpa_stalkee_image_data ) {
                currentData = JSON.parse(result.cpa_stalkee_image_data);
            }
            if(!currentData[stalkee]) {
                currentData[stalkee] = {};
            }
            $.get("https://api.instagram.com/v1/users/search?q="+stalkee+"&client_id="+cid, function(response){
                userData = response.data[0];
                $('.img-circle').attr('src',userData.profile_picture);
                $('.recommend-stalk').animate({
                    opacity: '0'
                },function(){
                  $('.recommend-stalk').hide();
                  $('.active-stalker').show();
                  $('#countdown').children().remove();
                  $('#countdown').countup({
                      start: new Date()
                  });
                  $('.stalker_time').css({visibility:'visible'});
                  $('.active-stalker').animate({
                    opacity: '1'
                  });
                });
                chrome.storage.local.set({'cpa_stalkee_user_data': userData}, function (result) {
                    $.get("https://api.instagram.com/v1/users/"+userData.id+"/media/recent/?count=40&client_id="+cid, function(response) {
                        var currentImages = currentData[stalkee];
                        for( var i = 0; i < response.data.length; i++ ) {
                            var img_url = response.data[i].images.low_resolution.url;
                            var caption = "";
                            if( response.data[i].caption ) {
                                caption = response.data[i].caption.text;
                            }

                            // console.log( img_url, caption );
                            currentImages[img_url] = {
                                caption: caption,
                                seen: false
                            }
                        }
                        currentData[stalkee] = currentImages;
                        chrome.storage.local.set({"cpa_stalkee_image_data": JSON.stringify(currentData)});
                    });
                });
            });
        });
    });
    //animate


  });

  $('.back-btn').on('click',function(){
    $('.recommend-stalk').animate({
        opacity: '0'
    },function(){
      $('.recommend-stalk').hide();
      $('.stalker_time').css({visibility:'visible'});
      $('.active-stalker').show();
      $('.active-stalker').animate({
        opacity: '1'
      });
    });
  });

});


chrome.storage.local.get(['cpa_stalkee_user_data','cpa_time','cpa_stalkee'], function (result) {
  if(result.cpa_stalkee && result.cpa_stalkee != ''){
    $('.container').show();
    $('#cpa_stalkee_un').text(result.cpa_stalkee);
    $('#countdown').countup();
    $('.stalker_time').css({'visibility':'visible'});
    $('.img-circle').attr('src',result.cpa_stalkee_user_data.profile_picture);
  }else{
    $('.container').show();
    $('.active-stalker').hide();
    $('.recommend-stalk').show();
    $('.recommend-stalk').css({opacity:1});
  }
});
