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
            slots[slot] = -1;
        
        this.ActivePID = null;
        this.Base = null;
        this.Limit = null;
        
        //------------------------------------
        // Memory Manager Instance Functions
        //------------------------------------
        this.loadProgram = function(instructionArray, priority)
        {
            var slot = getFreeSlot();
            // auto(bots) rollout if we have no space
            var sacrificialPCB = null;
            if(slot === false)
            {
                if(_Scheduler.readyQ.length + 1< PROGRAMS_ALLOWED) {
                    for(var slot in slots) {
                        var pid = slots[slot];
                        if(pid != _Memory.ActivePID && !_Scheduler.programInQ(pid))
                        {
                            sacrificialPCB = _ResidentQ[pid];
                            break;
                        }
                    }
                }
                else
                {
                    sacrificialPCB = _Scheduler.pickSacrifice();
                }
                
                
                if(! (sacrificialPCB instanceof PCB)) {
                    slot = sacrificialPCB;
                    sacrificialPCB = _ResidentQ[slots[slot]];
                }
                
                // get slot to compute memory locations for replacement
                slot = sacrificialPCB.Base / PROGRAM_SIZE;
                
                // Autobots...
                rollOut(sacrificialPCB);
            }
            
            var newPCB = null;
            var base = slot * PROGRAM_SIZE;
            
            if(priority instanceof PCB)
            {
                newPCB = priority;
                newPCB.updateMemoryFrame(base);
                krnLoadState(newPCB);
            }
            else
            {
                var PID = _ResidentQ.length;
                newPCB = new PCB(PID, base, priority);
                _ResidentQ.push(newPCB);
            }
            
            for(var instruction in instructionArray)
            {
                this.store(instruction, instructionArray[instruction], newPCB);
            }
            
            slots[slot] = newPCB.PID;
            return newPCB.PID;
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
        
        this.get = function(location, pcb)
        {
            var memBase = this.Base;
            var memLimit = this.Limit;
            
            if(pcb !== undefined)
            {
                memBase = pcb.Base;
                memLimit = pcb.Limit;
            }
            
            var physicalLocation = parseInt(location) + memBase;
            
            if(physicalLocation >= memBase && physicalLocation <= memLimit)
            {
                return _RAM.get(physicalLocation);
            }
            else
            {
                errorTrace("MEM Access Violation on GET @" + physicalLocation + " from " + location  + " B:" + memBase + " L:" + memLimit);
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", this.ActivePID)));
                return null;
            }
        }
        
        this.rollIn = function(fileName, fileData) {
            var file = decodeFromHex(fileName);
            var pid = parseInt(file.replace('p', ''));
            var pcb = _ResidentQ[pid];
            
            var instructions = fileData.match(PROGRAM_PATTERN);
            
            _Memory.loadProgram(instructions, pcb);
            
            _CPU.isExecuting = true;
        }
        
        function rollOut(PCB) {
            
            _CPU.isExecuting = false;
            
            var swapData = "";
            for(var location = 0; location < PROGRAM_SIZE; location++) {
                var dat = _Memory.get(location, PCB);
                // get data at memory location in the context of the program
                swapData += dat;
            }
            console.log('SwapData: ' + swapData);
            var fileName = "p" + PCB.PID;
            
            // make sure file handle is created
            _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("create", encodeToHex(fileName), { mode : 'system_file'})));
            _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("write", encodeToHex(fileName), swapData, { mode : 'system_file'})));
            PCB.Base = -1;
            PCB.Limit = -1;
        }
    }
    
    function getFreeSlot()
    {
        for(slot = 0; slot < slots.length; slot++)
        {
            if(slots[slot] == -1)
            {
                slots[slot] = -2;
                return slot;
            }
        }
        
        return false;
    }
    
    return MemoryManager;
})();