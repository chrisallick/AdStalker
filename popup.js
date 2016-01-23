$(document).ready(function(){

    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        var stalkee = $("#cpa_text").val();
        chrome.storage.local.set({'cpa_stalkee': stalkee,'cpa_time': new Date()}, function (result) {
          $('.add-stalker').hide();
          $('#cpa_stalkee_un').text(stalkee);
          $('.active-stalker').show();
          $('#countdown').countup();
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
        $('#countdown').remove();
        $('#cpa_stalkee_un').text('');
        $('#cpa_text').val('');
        $('.active-stalker').hide();
        $('.add-stalker').show();
      });
    });


});
