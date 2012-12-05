/*
 |---------------------------------------------------------------------
 | Log
 |---------------------------------------------------------------------
 | A single log object for KayoticOS
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/4/2012
 |   Updated: 9/12/2012
 */

/*-------------------------------*
 * "Class" Object Definition
 *-------------------------------*/
var Log = (function()
{
    //---------------------------------
    // Private Static Variables
    //--------------------------------
    var last = null;
    
    //-----------------------------------------------------------------
    // Constructor | This function object is returned at the end
    //-----------------------------------------------------------------
    function Log(source, message, clock, now)
    {
        //--------------------------------
        // "Public" Instance Variables
        //--------------------------------
        this.last = last;
        this.source = source;
        this.message = message;
        this.clock = clock;
        this.now = now;
        
        // set last
        last = this.message;
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
        var html = '' +
            '<div id="msg-' + this.id + '" class="log_msg log_' + this.source + '">' +
                '<div class="time">' +
                    '<strong>' + this.now.logString() + '</strong> - ' + this.clock +
                '</div>' +
                '<div class="meta">' +
                    '<strong>Source:</strong> ' + this.source + 
                '</div>' +
                '<div class="message">' +
                    this.messageHTML() +
                '</div>' +
            '</div>';
        
        return html;
    },
    messageHTML : function() {
        var html = '';
        if(this.source.toLowerCase() == "devlog")
        {
            html += '<span class="devlog">' + this.message + '</span>';
        }
        else
        {
            html += this.message;
        }
        
        return html;
    }
}