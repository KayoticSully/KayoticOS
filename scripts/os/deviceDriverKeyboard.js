/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    
    // "Constructor" code.
    
    //-------------------------
    // Properties
    //-------------------------
    this.capslock = false;
    this.symbols = new SymbolCodes();
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params. 
    var keyCode = params[0];
    var isShifted = params[1];
    
    if(isNaN(keyCode) || typeof isShifted !== "boolean")
    {
        krnTrapError("Bad Keyboard Input");
    }
    
    krnTrace("Key code:" + keyCode + ' = ' + String.fromCharCode(keyCode) + " shifted:" + isShifted);
    var chr = "";
    
    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted || this.capslock)
        {
            chr = String.fromCharCode(keyCode);
        }
        
        _KernelInputQueue.enqueue(chr);        
    }    
    else if ( !isShifted && // block when shift is held to allow symbols to handle it
             (((keyCode >= 48) && (keyCode <= 57)) ||   // digits 
               (keyCode == 32)                     ||   // space
               (keyCode == 13) ) )                      // enter
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
    }
    else if(this.symbols.hasCode(keyCode))
    {
        chr = this.symbols.getSymbol(keyCode, isShifted);
        _KernelInputQueue.enqueue(chr);
    }
    else if (keyCode == 20) // capslock
    {
        this.capslock = this.capslock ? false : true;
    }
    else if (keyCode == 8) // backspace
    {
        _Console.delChar();
    }
    else if(keyCode >= 37 && keyCode <= 40 || // arrows
            keyCode == 9)                     // tab
    {
        _OsShell.specialKeys(keyCode);
    }
}