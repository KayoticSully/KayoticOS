/*
 |---------------------------------------------------------------------
 | Utils 
 |---------------------------------------------------------------------
 | Utility functions
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | Just making comments consistent across all files
 */

function trim(str) // Use a regular expression to remove leading and trailing spaces.
{
    // I removed the whitespace on either side of the OR "|" operator.
    // It was messing up if the only space was a newline character.
    return str.replace(/^\s+|\s+$/g, "");
    /* 
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
        - "\s+$" is the same thing, but at the end of the string.
        - "g" makes is global, so we get all the whitespace.
        - "" is nothing, which is what we replace the whitespace with.
    */
}

function rot13(str)     // An easy-to understand implementation of the famous and common Rot13 obfuscator.
{                       // You can do this in three lines with a complex regular experssion, but I'd have
    var retVal = "";    // trouble explaining it in the future.  There's a lot to be said for obvious code.
    for (var i in str)
    {
        var ch = str[i];
        var code = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0)
        {            
            code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
            retVal = retVal + String.fromCharCode(code);
        }
        else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0)
        {
            code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
            retVal = retVal + String.fromCharCode(code);
        }
        else
        {
            retVal = retVal + ch;
        }
    }
    return retVal;
}

function devLog(str)
{
	if(DEVLOG)
	{
		simLog(str, "DevLog");
		console.log(str.replace('<br>&nbsp;&nbsp;', "\n   ").replace('<br>&nbsp;&nbsp;', "\n   "));
	}
}

function toPettyHex(number, digits)
{
	if(digits === undefined)
		digits = 4;
	
	var hex = '';
	if( ! (number instanceof String))
		hex = number.toString(16);
	else
		hex = number;
	
	if(hex.length < digits)
	{
		for(var i = digits - hex.length; i > 0; i--)
			hex = "0" + hex;
	}
	
	return hex.toUpperCase();
}

function encodeToHex(str) {
	var result = "";
	for(index in str) {
		var charCode = str.charCodeAt(index);
		var hex = toHex(charCode);
		result += hex;
	}
	
	return result.toUpperCase();
}

function decodeFromHex(hex) {
	if (hex != null) {
		var hexArr = hex.match(PROGRAM_PATTERN);
		var result = "";
		
		for(hexByte in hexArr) {
			// decode character
			var charCode = parseInt(hexArr[hexByte], 16);
			// convert to string
			var character = String.fromCharCode(charCode);
			
			result += character;
		}
		
		return result;
	} else {
		return "";
	}
}

//
// Helper function to convert int to hex
// 
function toHex(data)
{
    var hex = data.toString(16);
    
    if(hex.length == 1)
    {
	hex = "0" + hex;
    }
    
    return hex;
}

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Controls compiler output
 * 
 * @param {String} line A line to add to output list
 * @param {String} type Classes to add to output list item
 * @param {Boolean} verbose Set to true if log should only be shown when verbose output is on. Default false
 */
function log(line, type, verbose) {
    if(verbose === undefined) verbose = false;
    if(type === undefined) type = '';
    
    if((verbose == false) || (verbose == true && logLevel == 'verbose')) {
	var color = DEFAULT_FONT_COLOR;
	
	if (type == 'error') {
		color = "#FF4040";
	} else if (type == "info") {
		color = "#245A7A";
	} else if (type == "warning") {
		color = "#BF7F30";
	}
	
        _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", line, false, color)));
        console.log(line);
    }
}