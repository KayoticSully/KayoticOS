/*
 |---------------------------------------------------------------------
 | Line Object
 |---------------------------------------------------------------------
 | Keeps the last X number of lines for the console in an array.
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 4/12/2013
 |   Updated: 4/12/2013
 |---------------------------------------------------------------------
 */

var LineObject = function(str, prompt, color)
{
    if (str == undefined) str = '';
    if (prompt == undefined) prompt = '';
    
    
    //var prompt ='';
    this.subStrings = new Array();
    this.prompt = prompt;
    
    // properties
    Object.defineProperty(this, 'text', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return this.prompt + this.line;
        }
    });
    
    // properties
    Object.defineProperty(this, 'line', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            var str = ''
            for (var index in this.subStrings) {
                str += this.subStrings[index].text;
            }
            
            return str;
        }
    });
    
    this.append(str, color);
}

LineObject.prototype.size = function()
{
    return this.text.length;
}

LineObject.prototype.clear = function()
{
    // clear the array
    this.subStrings = new Array();
    // make sure something is in there;
    this.append('');
}

LineObject.prototype.append = function(chars, color)
{
    if (color == undefined) {
        color = DEFAULT_FONT_COLOR;
    }
    
    var lastPartIndex = this.subStrings.length - 1;
    var lastPart = this.subStrings[lastPartIndex];
    
    if (this.subStrings.length > 0 && lastPart.color == color) {
        lastPart.text += chars;
    } else {
        this.subStrings.push({
            text : chars,
            color : color
        });
    }
}

LineObject.prototype.insert = function(position, characters)
{
    // first find the sub-string the position is located in
    var index = 0;
    var currentPosition = 0;
    while (this.subStrings[index].text.length < position - currentPosition) {
        currentPosition += this.subStrings[index].text.length;
        index++;
    }
    
    var subStr = this.subStrings[index];
    var subPosition = position - currentPosition;
    
    subStr.text = subStr.text.substr(0, subPosition) + characters + subStr.text.substr(subPosition);
}

LineObject.prototype.splitString = function(position) {
    // first find the sub-string the position is located in
    var index = 0;
    var currentPosition = 0;
    while (this.subStrings[index].text.length < position - currentPosition) {
        currentPosition += this.subStrings[index].text.length;
        index++;
    }
    
    var subStr = this.subStrings[index];
    var subPosition = position - currentPosition;
    
    return new Array(subStr.text.substr(0, subPosition), subStr.text.substr(subPosition));
}

LineObject.prototype.del = function(numOfCharacters, after)
{
    // This function as it is will cause problems if more than 1
    // character is asked to be deleted. There is no reason for that
    // to happen in any current possible situation, so... I'll leave
    // it like this for now.  It works.
    
    var removed = '';
    var current = 0;
    var target = _StdIn.buffer.CursorXPosition;
    var subStrIndex = 0;
    var relativePosition = null;
    
    while (relativePosition === null) {
        // get to the substring with the index needed
        var subStrLength = this.subStrings[subStrIndex].text.length;
        if (subStrLength < target - current) {
            subStrIndex++;
            current += subStrLength;
        } else {
            // find the relative position within the substring
            relativePosition = target - current;
        }
    }
    
    // compute the removed text and resulting text
    var str = this.subStrings[subStrIndex].text;
    var removeStart = relativePosition - numOfCharacters;
    
    if (after) {
        removeStart++;
        relativePosition++;
    }
    
    removed = str.slice(removeStart, relativePosition);
    this.subStrings[subStrIndex].text = str.substr(0, removeStart) + str.substr(relativePosition);
    
    return removed;
}

LineObject.prototype.cursorPositionToDrawData = function(cursorPosition)
{
    var index = 0;
    var text = '';

    while (this.subStrings[index].text.length < cursorPosition - text.length) {
        text += this.subStrings[index].text;
        index++;
    }

    var subPosition = cursorPosition - text.length;
    if (this.subStrings[index].text.length == subPosition) {
        text += this.subStrings[index].text;
    } else {
        text += this.subStrings[index].text.substring(0, subPosition);
    }
    
    // dont forget about the cursor!
    text = this.prompt + text;
    
    var xPos = DRAWING_CONTEXT.measureText(_Console.CurrentFont, _Console.CurrentFontSize, text);
    
    return xPos;
}