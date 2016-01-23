var cid = "77c5d80362e34ae6869148deea59b1e7";

$(document).ready(function(){

    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        var userData = {};
        var stalkee = $("#cpa_text").val();
        chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': new Date()}, function (result) {
            $('#cpa_stalkee_un').text(stalkee);
            $('.active-stalker').show();
            $('.add-stalker').hide();
            $.get("https://api.instagram.com/v1/users/search?q="+stalkee+"&client_id="+cid, function(response){
                userData = response.data[0];
                console.log(userData);
                chrome.storage.local.set({'cpa_stalkee_user_data': userData}, function (result) {

                });
            });
        });
    });

    chrome.storage.local.get('cpa_stalkee', function (result) {
      if(result.cpa_stalkee && result.cpa_stalkee != ''){
        $('.add-stalker').hide();
        $('#cpa_stalkee_un').text(result.cpa_stalkee);
        $('.active-stalker').show();
        $('#countdown').countup();
      }
    });

    function clearUser(){
      chrome.storage.local.set({'cpa_stalkee': ''});
    }

    $('.over-it').on('click',function(){
      chrome.storage.local.set({'cpa_stalkee': ''},function(){
        $('.active-stalker').hide();
        $('.add-stalker').show();
      });
    });


});
