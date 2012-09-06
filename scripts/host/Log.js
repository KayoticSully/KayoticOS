/*
 |---------------------------------------------------------------------
 | Log
 |---------------------------------------------------------------------
 | A single log object for KayoticOS
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/4/2012
 |   Updated: 9/4/2012
 */

/*--------------------------------
 * "Constructor"
 *--------------------------------
 * Sets up the object definition
 * and initializes anything that
 * is needed.
 */
function Log(source, message, clock, now) {
    //--------------------------------
    // "Public" Instance Variables
    //--------------------------------
    this.source = source;
    this.message = message;
    this.clock = clock;
    this.now = now;
    
    //--------------------------------
    // "Private" Instance Variables
    //--------------------------------
    
    //--------------------------------
    // Properties
    //--------------------------------

    //--------------------------------
    // Instance Functions
    //--------------------------------
}

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
        //return JSON.stringify(this);
        return "({ clock:" + this.clock + ", source:" + this.source + ", msg:" + this.message + ", now:" + this.now  + " })"  + "\n";
    }
}