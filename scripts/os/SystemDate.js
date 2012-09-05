/*
 |---------------------------------------------------------------------
 | System Date
 |---------------------------------------------------------------------
 | An extension of the Date object to suite the OS needs.
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/5/2012
 |   Updated: 9/5/2012
 */

/*--------------------------------
 * "Constructor"
 *--------------------------------
 * Sets up the object definition
 * and initializes anything that
 * is needed.
 */
function SystemDate(args) {
    //--------------------------------
    // "Private" Instance Variables
    //--------------------------------
    var dateTime = new Date(args);
    
    //--------------------------------
    // "Public" Instance Variables
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
SystemDate.prototype = {
    //--------------------------------
    // toString
    //--------------------------------
    // Constructs the default string
    // output for this object.
    //
    toString : function(){
        return this;
    }
}