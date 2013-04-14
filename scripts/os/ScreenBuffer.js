/*
 |---------------------------------------------------------------------
 | Screen Buffer
 |---------------------------------------------------------------------
 | Requires: LineObject.js
 |---------------------------------------------------------------------
 | Keeps the last X number of lines for the console in an array.
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 4/9/2013
 |   Updated: 4/12/2013
 |---------------------------------------------------------------------
 | Note: 26 Lines for 1 screen at current screen height
 */

var ScreenBuffer = function(){
    this.lines = new Array();
    
    // properties
    Object.defineProperty(this, 'inputLine', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return this.lines[0];
        }
    });
    
    Object.defineProperty(this, 'length', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return this.lines.length;
        }
    });
    
    // make sure there is something for the inputBuffer
    this.addLine(new LineObject());
}

ScreenBuffer.prototype.toString = function(){
    return JSON.stringify(this.lines);
}

ScreenBuffer.prototype.addLine = function(line){
    this.lines.unshift(line);
}

ScreenBuffer.prototype.startIndex = function(offset) {
    if (offset == undefined) {
        offset = 0;
    }
    
    return (SCREEN_LINE_LENGTH - 1) + offset;
}

ScreenBuffer.prototype.getLine = function(index)
{
    return this.lines[index];
}