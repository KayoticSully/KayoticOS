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
 |   Updated: 10/3/2012
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
        this.Offset = 0;
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
            var PID = _JobQ.length;
            
            var newPCB = new PCB(PID, slot * PROGRAM_SIZE);
            
            _JobQ.push(newPCB);
            
            for(var instruction in instructionArray)
            {
                this.store(instruction, instructionArray[instruction], newPCB.Offset);
            }
            
            _ReadyQ.push(_JobQ[PID]);
            return PID;
        }
        
        this.store = function(location, value, specifiedOffset)
        {
            var memOffset = this.Offset
            if(specifiedOffset !== undefined)
                memOffset = specifiedOffset;
            
            _RAM.set(parseInt(location) + memOffset, value);
        }
        
        this.get = function(location)
        {
            return _RAM.get(parseInt(location) + this.Offset);
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