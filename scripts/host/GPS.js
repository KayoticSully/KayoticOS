/*
 |---------------------------------------------------------------------
 | GPS
 |---------------------------------------------------------------------
 | A GPS Device for KayoticOS
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/11/2012
 |   Updated: 9/11/2012
 
 var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    var infowindow = new google.maps.InfoWindow({
                        map: map,
                        position: pos,
                        content: 'Location found using HTML5.'
                    });
 */

/*--------------------------------
 * "Constructor"
 *--------------------------------
 * Sets up the object definition
 * and initializes anything that
 * is needed.
 */

var GPS = (function()
{
    //-----------------------------------------------------------------
    // Constructor | This function object is returned at the end
    //-----------------------------------------------------------------
    var geocoder = new google.maps.Geocoder();
    
    function GPS()
    {
        //--------------------------------
        // "Public" Instance Variables
        //--------------------------------
        this.getLocation = function()
        {
            if (navigator.geolocation) 
            {
                navigator.geolocation.getCurrentPosition( function(position){
                    
                });
            }
        }
    }
    
    
    
    return Log;
})();

/*--------------------------------
 * Prototype Functions
 *--------------------------------
 * Functions available to all
 * instances of this object.
 */
Log.prototype = {
    //--------------------------------
    // toString
    //--------------------------------
    // Constructs the default string
    // output for this object.
    //
    toString : function(){
        return this;
    },
    
    
}