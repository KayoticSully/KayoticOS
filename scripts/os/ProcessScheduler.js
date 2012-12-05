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
    
    var processTicks    = 0;
    var processQ        = new Queue();
    var sys_quantum     = 6; // not of solace
    var scheduling_algo = 'rr';
    
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
        
        Object.defineProperty(this, "readyQ", {
            writeable   :   false,
            enumerable  :   false,
            get         :   function() {
                return processQ.q;
            }
        });
        
        Object.defineProperty(this, "algo", {
            writeable   :   true,
            enumerable  :   false,
            get         :   function() {
                return scheduling_algo;
            },
            set         :   function(value) {
                scheduling_algo = value;
            }
        });
        
        this.tick = function()
        {
            // there may be something strange going on with this.
            // sometimes random context switches occur.  I haven't had time
            // to track down the source.  It could be working correctly, I am
            // just not sure.
            
            processTicks++;
            // only schedule if more than one process
            if(this.algo == "rr" && processTicks % sys_quantum == 0 && processQ.q.length > 0)
            {
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch")));
            }
        }
        
        this.schedule = function(process)
        {
            // put into process q
            krnTrace("Scheduling Process " + process.PID);
            if(this.algo == "priority") {
                processQ.priorityEnqueue(process);
            } else {
                processQ.enqueue(process);
            }
        }
        
        this.getProcess = function()
        {
            return processQ.dequeue();
        }
        
        this.kill = function(pid)
        {
            krnTrace("Killing Process " + process.PID);
            var process = _ResidentQ[pid];
            processQ.remove(process);
        }
        
    }
    
    return ProcessScheduler;
})();
