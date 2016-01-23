$(document).ready(function(){
    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();

        var stalkee = $("#cpa_text").val();
        chrome.storage.local.set({'cpa_stalkee': stalkee}, function (result) {
            window.close();
        });
    });

    chrome.storage.local.get('cpa_stalkee', function (result) {
        console.log( result );
    });
});