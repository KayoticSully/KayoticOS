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
 |   Updated: 11/4/2012
 |---------------------------------------------------------------------
 | This code references page numbers in the text book: 
 | Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */

var CPU = (function()
{
    
    function CPU()
    {
        var OPs = new OPCodes(this);
        
        var _Acc   = 0;     // Accumulator
        Object.defineProperty(this, 'Acc', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return _Acc;
            },
            set             : function(value) {
                // correct for 2's complement
                if (value > 127)
                {
                    _Acc = value - 256;
                }
                else if(value < -128)
                {
                    _Acc = value + 256;
                }
                else
                {
                    _Acc = value;
                }
            }
        });
        
        this.PC    = 0;     // Program Counter
        this.Xreg  = 0;     // X register
        this.Yreg  = 0;     // Y register 
        this.Status = {      // S-tatus register  (for an indepth explanation: http://nesdev.com/6502.txt)
            C : 0,          // C-arry flag
            Z : 0,          // Z-ero flag (Think of it as "isZero".)
            I : 1,          // I-nterrupt flag (1 = enable interrupts, 0 = disable interrupts)
            D : 0,          // D-ecimal Mode
            B : 0,          // B-reak (set when BRK instruction is executed)
           NU : 1,          // Not used and must be 1 at all times
            V : 0,          // o-V-erflow flag
            S : 0,          // S-ign flag set if result of an operation is negative therefore 0 == positive, 1 == negative
        };
        
        this.isExecuting = false;
    
        this.init = function() 
        {
            this.PC    = 0
            this.Acc   = 0;
            this.Xreg  = 0;
            this.Yreg  = 0;
            this.Zflag = 0;
            this.Sflag = { C : 0, Z : 0, I : 1, D : 0, B : 0, NU : 1, V : 0, S : 0 };
            
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
            
            controlUpdateDisplay();
            
            if(STEP_TOGGLE)
                _CPU.isExecuting = false;
        }
        
        this.cycle = function()
        {   
            // Fetch
            var instruction = this.fetch();
            
            // decode
            if(instruction in OPs)
            {
                // execute
                OPs[instruction]();
            }
            else
            {
                // throw interrupt
                var interrupt = new Interrput(BADOP_IRQ, "Bad Operation " + instruction + " at location " + (parseInt(this.PC) - 1));
                _KernelInterruptQueue.enqueue(interrupt);
            }
        }
        
        this.fetch = function()
        {
            return _Memory.get(this.PC++);
        }
    }
    
    return CPU;
})();