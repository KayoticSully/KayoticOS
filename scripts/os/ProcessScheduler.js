/*
 |---------------------------------------------------------------------
 | Process Scheduler
 |---------------------------------------------------------------------
 | Manages process scheduling
 | Supports:
 |  - Round Robin
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 11/4/2012
 |   Updated: 11/4/2012
 */

var ProcessScheduler = (function(){
    
    var processTicks    = -1;
    var sys_quantum     = 6; // not of solace
    
    function ProcessScheduler()
    {
        Object.defineProperty(this, "quantum", {
            writeable   :   true,
            enumerable  :   false,
            get         :   function() {
                return sys_quantum;
            },
            set         :   function(value) {
                sys_quantum = parseInt(value);
            }
        });
        
        this.tick = function()
        {
            processTicks = (processTicks + 1) % sys_quantum;
            
            if(processTicks == 0)
            {
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch")));
                devLog("Switch!");
            }
        }
    }
    
    return ProcessScheduler;
})();
