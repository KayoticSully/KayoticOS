/*
 |---------------------------------------------------------------------
 | CPU
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Routines for the host CPU simulation, NOT for the OS itself.  
 | In this manner, it's A LITTLE BIT like a hypervisor,
 | in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code
 | that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 | JavaScript in both the host and client environments.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | This code references page numbers in the text book: 
 | Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */

var CPU = (function()
{
    
    function CPU()
    {
        var OPs = new OPCodes();
        
        this.PC    = 0;     // Program Counter
        this.Acc   = 0;     // Accumulator
        this.Xreg  = 0;     // X register
        this.Yreg  = 0;     // Y register
        this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
        this.isExecuting = false;
    
        this.init = function() 
        {
            this.PC    = 0
            this.Acc   = 0;
            this.Xreg  = 0;
            this.Yreg  = 0;
            this.Zflag = 0;      
            this.isExecuting = false;
        }
        
        this.pulse = function()
        {
            // Increment the hardware (host) clock.
            _OSclock++;
            
            // Update System Time
            _SystemClock.update();
            
            // Call the kernel clock pulse event handler.
            krnOnCPUClockPulse();
        }
        
        this.cycle = function()
        {
            krnTrace("CPU cycle");
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do real work here. Set this.isExecuting appropriately.
            
            // Fetch
            var instruction = this.fetch();
            
            if(instruction in OPs)
                OPs[instruction]();
            
            console.log(instruction);
        }
        
        this.fetch = function()
        {
            return _Memory.get(this.PC++);
        }
    }
    
    return CPU;
})();