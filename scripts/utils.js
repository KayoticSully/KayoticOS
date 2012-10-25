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

function trim(str)      // Use a regular expression to remove leading and trailing spaces.
{
	return str.replace(/^\s+ | \s+$/g, "");
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
		console.log(str);
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