/*
 |---------------------------------------------------------------------
 | MemoryManager
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Acts as the Virtual Memory for the Guest OS
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 10/3/2012
 |   Updated: 11/4/2012
 |---------------------------------------------------------------------
 */

var MemoryManager = (function(){
    var slots = new Array();
    
    function MemoryManager()
    {
        // prepare Memory Manager
        for(var slot = 0; slot < PROGRAMS_ALLOWED; slot++)
            slots[slot] = 0;
        
        this.ActivePID = null;
        this.Base = null;
        this.Limit = null;
        //------------------------------------
        // Memory Manager Instance Functions
        //------------------------------------
        this.loadProgram = function(instructionArray)
        {
            //
            // Once we are dealing with more than one process
            // need to figure out PC Offset here
            //
            var slot = getFreeSlot();
            
            var PID = _ResidentQ.length;
            
            var newPCB = new PCB(PID, slot * PROGRAM_SIZE);
            
            _ResidentQ.push(newPCB);
            
            for(var instruction in instructionArray)
            {
                this.store(instruction, instructionArray[instruction], newPCB);
            }
            
            return PID;
        }
        
        this.store = function(location, value, pcb)
        {
            var memBase = this.Base;
            var memLimit = this.Limit;
            
            if(pcb !== undefined)
            {
                memBase = pcb.Base;
                memLimit = pcb.Limit;
            }
            
            var physicalLocation = parseInt(location) + memBase;
            
            // ensure memory access is within proper bounds
            if(physicalLocation >= memBase && physicalLocation <= memLimit)
            {
                _RAM.set(physicalLocation, value);
            }
            else
            {
                errorTrace("MEM Access Violation on STORE @" + physicalLocation + " from " + location + " B:" + memBase + " L:" + memLimit);
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", this.ActivePID)));
            }
        }
        
        this.get = function(location)
        {
            var physicalLocation = parseInt(location) + this.Base;
            
            if(physicalLocation >= this.Base && physicalLocation <= this.Limit)
            {
                return _RAM.get(physicalLocation);
            }
            else
            {
                errorTrace("MEM Access Violation on GET @" + physicalLocation + " from " + location  + " B:" + this.Base + " L:" + this.Limit);
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", this.ActivePID)));
                return null;
            }
        }
    }
    
    function getFreeSlot()
    {
        for(slot = 0; slot < slots.length; slot++)
        {
            if(slots[slot] == 0)
            {
                slots[slot] = 1;
                return slot;
            }
        }
        
        return false;
    }
    
    return MemoryManager;
})();