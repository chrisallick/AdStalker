var cid = "77c5d80362e34ae6869148deea59b1e7";

$(document).ready(function(){
    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        event.stopPropagation();
        var userData = {};
        var stalkee = $("#cpa_text").val();
        var now = moment();
        chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': now}, function (result) {
          $('.add-stalker').hide();
          $('#cpa_stalkee_un').text(stalkee);
          $('.active-stalker').show();
          $('#countdown').countup();
          $('html').height('350px');
          $('body').height('350px');
          $('.demo-card-wide').height('350px');
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
    });

    $('#cpa_phone').submit(function(){
      var phone = $('#cpa_phonenum').val();
      chrome.storage.local.set({'cpa_phone': phone}, function (result) {

      });
    });

    chrome.storage.local.get(['cpa_stalkee_user_data','cpa_time','cpa_stalkee'], function (result) {
      if(result.cpa_stalkee && result.cpa_stalkee != ''){
        $('.add-stalker').hide();
        $('#cpa_stalkee_un').text(result.cpa_stalkee);
        $('.active-stalker').show();
        $('#countdown').countup();
        $('.img-circle').attr('src',result.cpa_stalkee_user_data.profile_picture);
        $('html').height('350px');
        $('body').height('350px');
        $('.demo-card-wide').height('350px');
      }
    });

    function clearUser(){
      chrome.storage.local.set({'cpa_stalkee': ''});
    }

    $('.over-it').on('click',function(){
      chrome.storage.local.set({'cpa_stalkee': ''},function(){
        $('#countdown').children().remove();
        $('#cpa_stalkee_un').text('');
        $('#cpa_text').val('');
        $('.active-stalker').hide();
        $('.add-stalker').show();
        $('html').height('100px');
        $('body').height('100px');
        $('.demo-card-wide').height('100px');
      });
    });


});
