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
 |   Updated: 11/7/2012
 */

var ProcessScheduler = (function(){
    
    var processTicks    = -1;
    var processQ = new Queue();
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
                var num = parseInt(value);
                if(! isNaN(num))
                    sys_quantum = num;
            }
        });
        
        Object.defineProperty(this, "totalRunning", {
            writeable   :   false,
            enumerable  :   false,
            get         :   function() {
                return processQ.getSize();
            }
        });
        
        Object.defineProperty(this, "running", {
            writeable   :   false,
            enumerable  :   false,
            get         :   function() {
                return 
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
        
        this.schedule = function(process)
        {
            // put into process q
            processQ.enqueue(process);
        }
        
        this.getProcess = function()
        {
            return processQ.dequeue();
        }
        
        this.kill = function(pid)
        {
            var process = _ReadyQ[pid];
            processQ.remove(process);
        }
        
    }
    
    return ProcessScheduler;
})();
