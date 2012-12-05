/*
 |---------------------------------------------------------------------
 | SymbolCodes
 |---------------------------------------------------------------------
 | Handles keyCodes that translate to Symbols
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/7/2012
 |   Updated: 9/7/2012
 |---------------------------------------------------------------------
 */

//--------------------------------
// "Class" Definition
//--------------------------------
var SymbolCodes = (function()
{
    //-----------------------------------------------------------------
    // Constructor | This function object is returned at the end
    //-----------------------------------------------------------------
    function SymbolCodes()
    {
        this.getSymbol = function(keyCode, isShifted)
        {
            var index = isShifted ? 0 : 1;
            return symbols[keyCode][index];
        }
        
        this.hasCode = function(keyCode)
        {
            return (keyCode in symbols);
        }
    }
    
    var symbols = {
    // keyCode : [shiftedChar, normalChar]
        48  : [')'],
        49  : ['!'],
        50  : ['@'],
        51  : ['#'],
        52  : ['$'],
        53  : ['%'],
        54  : ['^'],
        55  : ['&'],
        56  : ['*'],
        57  : ['('],
        186 : [':', ';'],
        187 : ['+', '='],
        188 : ['<', ','],
        189 : ['_', '-'],
        190 : ['>', '.'],
        191 : ['?', '/'],
        192 : ['~', '`'],
        219 : ['{', '['],
        220 : ['|', '\\'],
        221 : ['}', ']'],
        222 : ['"', "'"]
    }
    
    return SymbolCodes;
})();