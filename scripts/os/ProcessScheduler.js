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
    var lastCPU         = 0;
    
    
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
        
        this.tick = function(processor)
        {
            // there may be something strange going on with this.
            // sometimes random context switches occur.  I haven't had time
            // to track down the source.  It could be working correctly, I am
            // just not sure.
            
            // only increment the scheduler clock once per cycle.  not once per cycle per cpu.
            if (processor == 0) {
                processTicks++;
            }
            
            // only schedule if more than one process
            if(this.algo == "rr" && processTicks % sys_quantum == 0 && processQ.q.length > 0)
            {
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", processor)));
            }
        }
        
        this.schedule = function(process)
        {
            // put into process q
            krnTrace("Scheduling Process " + process.PID);
            
            if(this.algo == "priority") {
                processQ.priorityEnqueue(process);
            } else {
                // assign CPU
                //console.log('Assigning process to cpu ' + lastCPU);
                //process.cpuId = lastCPU;
                
                processQ.enqueue(process);
                
                //lastCPU = (lastCPU + 1) % _CPU_COUNT;
            }
        }
        
        this.getProcess = function(cpu)
        {
            var process = processQ.dequeue();
            krnTrace("Scheduling Processor " + cpu);
            process.cpuId = cpu;
            return process;
        }
        
        this.kill = function(pid)
        {
            var process = _ResidentQ[pid];
            krnTrace("Killing Process " + process.PID);
            
            _CPUS[process.cpuId].PID = null;
            
            processQ.remove(process);
        }
        
        this.programInQ = function(pid) {
            for(var x in processQ.q) {
                if(x.pid == pid)
                    return true;
            }
            
            return false;
        }
        
        this.pickSacrifice = function() {
            // find process that is not already rolled out
            var index = processQ.getSize() - 1;
            var last = processQ.q[index--];
            while(last.Base < 0) {
                last = processQ.q[index--];
            }
            
            return last;
        }
    }
    
    return ProcessScheduler;
})();
