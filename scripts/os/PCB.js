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