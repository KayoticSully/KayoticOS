/*
 |---------------------------------------------------------------------
 | Page
 |---------------------------------------------------------------------
 | Scripts needed to manage parts of the page not related to the VM
 | or OS.
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/11/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | The jQuery library is also imported for use in this page and
 | minimally within the VM and OS.
 */

$(document).ready(function(){
    //-------------------------
    // Browser Alerts Controls
    //-------------------------
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