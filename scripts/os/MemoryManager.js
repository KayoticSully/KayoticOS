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
    
    var Offset = 0;
    
    function MemoryManager()
    {
        //------------------------------------
        // Memory Manager Instance Functions
        //------------------------------------
        this.loadProgram = function(instructionArray)
        {
            //
            // Once we are dealing with more than one process
            // need to figure out PC Offset here
            //
            var PID = _JobQ.length;
            var newPCB = new PCB(PID, Offset);
            
            _JobQ.push(newPCB);
            
            for(var instruction in instructionArray)
            {
                this.store(instruction, instructionArray[instruction]);
            }
            
            _ReadyQ.push(_JobQ[PID]);
            return PID;
        }
        
        this.store = function(location, value)
        {
            _RAM.set(parseInt(location) + Offset, value);
        }
        
        this.get = function(location)
        {
            return _RAM.get(parseInt(location) + Offset);
        }
    }
    
    return MemoryManager;
})();