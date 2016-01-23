
function sendNotification(){
  var options = {
    type: 'image',
    iconUrl: 'icon128.png',
    imageUrl: 'map.png',
    title: 'Time to stalk',
    message: 'Your crush checked in nearby',
    buttons: [
      {
        title: 'Stalk'
      }
    ]
  };
  chrome.storage.local.get('cpa_phone', function (result) {
    sendTextMessage(result.cpa_phone);
  });
  chrome.notifications.create('12345', options, function(){
    console.log('success');
  });


  function sendTextMessage(phone){
    $.get("http://53e0a6b5.ngrok.com/sms/send/?num="+phone);
  }
}



chrome.commands.onCommand.addListener(function(command) {
    var match = String(command).match(/presets\-(\d+)/);
    var presetID = parseInt(match[1], 10);
    switch(presetID) {
        case 1:
            sendNotification();
            break;
        default:
            return false;
    }
});
