var cid = "77c5d80362e34ae6869148deea59b1e7";

$(document).ready(function(){
    $("#cpa_stalkee").submit(function(event){
        event.preventDefault();
        var userData = {};
        var stalkee = $("#cpa_text").val();
        chrome.storage.local.set({'cpa_stalkee': stalkee}, function (result) {
            console.log('hello');
            console.log("https://api.instagram.com/v1/users/search?q="+stalkee+"&client_id="+cid);
            $.get("https://api.instagram.com/v1/users/search?q="+stalkee+"&client_id="+cid, function(response){
                userData = response.data[0];
                console.log(userData);
                chrome.storage.local.set({'cpa_stalkee_user_data': userData}, function (result) {

                });
            });
        });
    });

    chrome.storage.local.get('cpa_stalkee', function (result) {
         console.log('hello');
        console.log( result );
    });
});