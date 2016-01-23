$(document).ready(function(){

    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        var stalkee = $("#cpa_text").val();
        chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': new Date()}, function (result) {
            $('#cpa_stalkee_un').text(stalkee);
            $('.active-stalker').show();
            $('.add-stalker').hide();
        });
    });

    chrome.storage.local.get('cpa_stalkee', function (result) {
      if(result.cpa_stalkee && result.cpa_stalkee != ''){
        $('.add-stalker').hide();
        $('#cpa_stalkee_un').text(result.cpa_stalkee);
        $('.active-stalker').show();
        $('#countdown').countup();
      }
        console.log( result );
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
