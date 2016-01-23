var cid = "77c5d80362e34ae6869148deea59b1e7";

$(document).ready(function(){

    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        var userData = {};
        var stalkee = $("#cpa_text").val();
        var now = moment();
        chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': now}, function (result) {
          $('.add-stalker').hide();
          $('#cpa_stalkee_un').text(stalkee);
          $('.active-stalker').show();
          $('#countdown').countup();
            $.get("https://api.instagram.com/v1/users/search?q="+stalkee+"&client_id="+cid, function(response){
                userData = response.data[0];
                $('.img-circle').attr('src',userData.profile_picture);
                chrome.storage.local.set({'cpa_stalkee_user_data': userData}, function (result) {

                });
            });
        });
    });

    chrome.storage.local.get(['cpa_stalkee_user_data','cpa_time','cpa_stalkee'], function (result) {
      if(result.cpa_stalkee && result.cpa_stalkee != ''){
        $('.add-stalker').hide();
        $('#cpa_stalkee_un').text(result.cpa_stalkee);
        $('.active-stalker').show();
        $('#countdown').countup();
        // $('#testdate').text(result.cpa_time.format());
        $('.img-circle').attr('src',result.cpa_stalkee_user_data.profile_picture);
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
      });
    });


});
