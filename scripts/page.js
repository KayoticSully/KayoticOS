$(document).ready(function(){
    if((document.location.hostname == '' || document.location.hostname.toLowerCase() == 'localhost') &&
       (navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('Safari') > -1 ))
    {
        $('#OfflineAlert').slideDown();
    }
    
    if(navigator.userAgent.indexOf('Trident') > -1)
    {
       $('#IEAlert').slideDown();
    }
});