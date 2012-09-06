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
function SystemDate() {
    //--------------------------------
    // "Private" Instance Variables
    //--------------------------------
    var dateTime = new Date();
    
    //--------------------------------
    // Properties
    //--------------------------------
    Object.defineProperty(this, 'month', {
        writeable       : false,
        enumerable      : false,
        get             : function()
        {
            return this.monthName(dateTime.getMonth());
        }
    });
    
    Object.defineProperty(this, 'day', {
        writeable       : false,
        enumerable      : false,
        get             : function()
        {
            return this.verboseDay(dateTime.getDate());
        }
    });
    
    Object.defineProperty(this, 'year', {
        writeable       : false,
        enumerable      : false,
        get             : function()
        {
            return dateTime.getFullYear();
        }
    });
    
    Object.defineProperty(this, 'time', {
        writeable       : false,
        enumerable      : false,
        get             : function()
        {
            return this.formatDigits(dateTime.getHours()) + ":" +
                   this.formatDigits(dateTime.getMinutes()) + ":" +
                   this.formatDigits(dateTime.getSeconds());
        }
    });
    
    //--------------------------------
    // Instance Functions
    //--------------------------------
    this.update = function()
    {
        dateTime = new Date();
    }
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
        return this.time + " on " + this.month + " " + this.day + ", " + this.year;
    },
    
    monthName : function (number)
    {
	switch(parseInt(number))
	{
            case 0: return "January";
            case 1: return "February";
            case 2: return "March";
            case 3: return "April";
            case 4: return "May";
            case 5: return "June";
            case 6: return "July";
            case 7: return "August";
            case 8: return "September";
            case 9: return "October";
            case 10: return "November"
            case 11: return "December";
            default: return null;
	}
    },
    
    verboseDay : function(date) {
        switch(parseInt(date))
        {
            case 1: return "1st";
            case 2: return "2nd";
            case 3: return "3rd";
            default: return date + "th";
        }
    },
    
    formatDigits : function(number)
    {
        if(number < 10)
            return '0' + number;
        else
            return number;
    }
}