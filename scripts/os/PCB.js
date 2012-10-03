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
 |   Updated: 10/3/2012
 |---------------------------------------------------------------------
 */

var PCB = (function(){
    
    function PCB(pc, acc, x, y, z, memoffset)
    {
        this.PC    = PC;    // Program Counter
        this.Acc   = acc;   // Accumulator
        this.Xreg  = x;     // X register
        this.Yreg  = y;     // Y register
        this.Zflag = z;     // Z-ero flag (Think of it as "isZero".)
        this.MemOffset = memoffset; // stores the memory offset
    }
    
    return PCB;
})();