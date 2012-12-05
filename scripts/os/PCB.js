/*
 |---------------------------------------------------------------------
 | PCB
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Handles the process control block for each program
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 10/3/2012
 |   Updated: 11/4/2012
 |---------------------------------------------------------------------
 */

var PCB = (function(){
    
    function PCB(PID, Base, priority)
    {
        this.PID    = PID;   // Program ID
        this.Base   = Base;
        this.Limit  = Base + PROGRAM_SIZE - 1;
        this.priority = priority | 1; // default to 1
        
        this.PC     = 0;     // Program Counter
        this.Acc    = 0;     // Accumulator
        this.Xreg   = 0;     // X register
        this.Yreg   = 0;     // Y register
        this.Zflag  = 0;     // Z-ero flag (Think of it as "isZero".)
        this.state  = "new"  // program state
        
        this.updateMemoryFrame = function(base) {
            this.Base   = base;
            this.Limit  = base + PROGRAM_SIZE - 1;
        }
    }
    
    return PCB;
})();

PCB.prototype.toString = function()
{
    var str = '<div class="pcbObject">' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'PID:' +
                        '</div>' +
                        '<div class="value">' +
                            this.PID + "&nbsp(" + this.priority + ")" +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'PC:' +
                        '</div>' +
                        '<div class="value">' +
                            toPettyHex(this.PC) +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'ACC:' +
                        '</div>' +
                        '<div class="value">' +
                            toPettyHex(this.Acc, 2) +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'X:' +
                        '</div>' +
                        '<div class="value">' +
                            toPettyHex(this.Xreg, 2) +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'Y:' +
                        '</div>' +
                        '<div class="value">' +
                            toPettyHex(this.Yreg, 2) +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'Z:' +
                        '</div>' +
                        '<div class="value">' +
                            toPettyHex(this.Zflag, 2) +
                        '</div>' +
                    '</div>' +
                    '<div class="property">' +
                        '<div class="name">' +
                            'State:' +
                        '</div>' +
                        '<div class="value">' +
                            this.state +
                        '</div>' +
                    '</div>' +
                '</div>';
    return str;
}