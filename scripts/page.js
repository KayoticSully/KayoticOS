$(document).ready(function(){
    if(document.location.hostname == ''  && navigator.userAgent.indexOf('Chrome') > -1)
    {
        $('#ChromeAlert').slideDown();
    }
    
    if(navigator.userAgent.indexOf('Trident') > -1)
    {
       $('#IEAlert').slideDown();
    }
});