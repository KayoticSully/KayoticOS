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
    
    function PCB(PID, Base)
    {
        this.PID    = PID;   // Program ID
        this.Base   = Base;
        this.Limit  = Base + PROGRAM_SIZE - 1;
        
        this.PC     = 0;     // Program Counter
        this.Acc    = 0;     // Accumulator
        this.Xreg   = 0;     // X register
        this.Yreg   = 0;     // Y register
        this.Zflag  = 0;     // Z-ero flag (Think of it as "isZero".)
        this.state  = "new"  // program state
    }
    
    return PCB;
})();

PCB.prototype.toString = function()
{
    var str = '<div class="pcbObject">' +
                    '<div class="PID">' +
                        '<strong>PID:</strong>' + this.PID +
                    '</div>' +
                    '<div class="Data">' +
                        '<div>' +
                            '<strong>PC:</strong>' + '<span class="PCBField">&nbsp;' + toPettyHex(this.PC) + '</span>&nbsp;&nbsp;' +
                            '<strong>ACC:</strong>' + '<span class="PCBField">&nbsp;' + toPettyHex(this.Acc, 2) + '</span>' +
                        '</div>' +
                        '<div>' +
                            '<strong>X:</strong>' + '<span class="PCBField">&nbsp;' + toPettyHex(this.Xreg, 2) + '</span>&nbsp;&nbsp;' +
                            '<strong>Y:</strong>' + '<span class="PCBField">&nbsp;' + toPettyHex(this.Yreg, 2) + '</span>&nbsp;&nbsp;' +
                            '<strong>Z:</strong>' + '<span class="PCBField">&nbsp;' + toPettyHex(this.Zflag, 2) + '</span>&nbsp;&nbsp;' +
                        '</div>' +
                        '<div>' +
                            '<strong>State:</strong>' + '<span class="PCBField">&nbsp;' + this.state + '</span>&nbsp;&nbsp;' +
                        '</div>' +
                    '</div>' +
                '</div>';
    return str;
}