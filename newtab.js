stalkdar.init();

$(function() {
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

    // TODO: change the default userData

    //animate

    $('.recommend-stalk').animate({
        opacity: '0'
    },function(){
      $('.recommend-stalk').hide();
      $('.active-stalker').show();
      $('.active-stalker').animate({
        opacity: '1'
      });
    });
  });

  $('.back-btn').on('click',function(){

    $('.recommend-stalk').animate({
        opacity: '0'
    },function(){
      $('.recommend-stalk').hide();
      $('.active-stalker').show();
      $('.active-stalker').animate({
        opacity: '1'
      });
    });
  });

});


chrome.storage.local.get(['cpa_stalkee_user_data','cpa_time','cpa_stalkee'], function (result) {
  if(result.cpa_stalkee && result.cpa_stalkee != ''){
    $('#cpa_stalkee_un').text(result.cpa_stalkee);
    $('#countdown').countup();
    $('.img-circle').attr('src',result.cpa_stalkee_user_data.profile_picture);
  }else{

  }
});
