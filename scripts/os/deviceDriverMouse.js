/*
 |---------------------------------------------------------------------
 | Device Driver Mouse
 |---------------------------------------------------------------------
 | Requires deviceDriver.js
 |---------------------------------------------------------------------
 | The Kernel Keyboard Device Driver.
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 4/19/2013
 |   Updated: 4/19/2013
 */

DeviceDriverMouse.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
function DeviceDriverMouse()                     // Add or override specific attributes and method pointers.
{
    // Override the base method pointers.
    this.driverEntry = krnMouseDriverEntry;
    this.isr = krnMouseEvent;
}

function krnMouseDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "Loaded";
    // More?
}

function krnMouseEvent(params)
{
    // to keep the code simple, lets just
    // emulate a keypress
    var key = 33;
    if (params < 0) {
        key = 34;
    }
    
    _OsShell.specialKeys(key);
}