/*
 |---------------------------------------------------------------------
 | OP Codes
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Operations the CPU can understand
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 10/9/2012
 |   Updated: 11/4/2012
 |---------------------------------------------------------------------
 */

function OPCodes()
{
    //================================================
    // Break
    //------------------------------------------------
    // System call to stop program execution
    //================================================
    this["00"] = function()
    {
        // LOG
        devLog("BREAK [00]");
        
        // make interrupt
        var interrupt = new Interrput(SYSTEMCALL_IRQ, ["00"]);
        // throw interrupt
        _KernelInterruptQueue.enqueue(interrupt);
    }
    
    //================================================
    // LDA [constant]
    //------------------------------------------------
    // Load the accumulator with a constant
    //================================================
    this["A9"] = function()
    {    
        // get data fields
        var data = _CPU.fetch();
        
        // LOG
        devLog("LDA [A9 " + data + "]");
        
        // Load Acc after converting from hex to int
        _CPU.Acc = parseInt(data, 16);
    }
    
    //================================================
    // LDA [least significant] [most significant]
    //------------------------------------------------
    // Load the accumulator from Memory
    //================================================
    this["AD"] = function()
    {
        // get data fields
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("LDA [AD " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        alert(location);
        // get data at memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // Load Acc after converting from hex to int
        _CPU.Acc = parseInt(data, 16);
    }
    
    //================================================
    // STA [least significant] [most significant]
    //------------------------------------------------
    // Store the accumulator to Memory
    //================================================
    this["8D"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("STA [8D " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get Acc
        var data = _CPU.Acc;
        
        // store data at memory location
        _Memory.store(parseInt(location, 16), toHex(data));
    }
    
    //================================================
    // ADC [least significant] [most significant]
    //------------------------------------------------
    // Add w/ Carry from Memory location to Acc
    //================================================
    this["6D"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("ADC [6D " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get Acc
        var data = _Memory.get(parseInt(location, 16));
        
        // store data at memory location
        _CPU.Acc += parseInt(data, 16);
    }
    
    //================================================
    // LDX [constant]
    //------------------------------------------------
    // Load the X register with a constant
    //================================================
    this["A2"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        
        // LOG
        devLog("LDX [A2 " + data + "]");
        
        // store data in X register
        _CPU.Xreg = parseInt(data, 16);
    }
    
    //================================================
    // LDX [least significant] [most significant]
    //------------------------------------------------
    // Load the X register from a memory location
    //================================================
    this["AE"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("LDX [AE " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // store data in X register
        _CPU.Xreg = parseInt(data, 16);
    }
    
    //================================================
    // LDY [constant]
    //------------------------------------------------
    // Load the Y register with a constant
    //================================================
    this["A0"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        
        // LOG
        devLog("LDY [A0 " + data + "]");
        
        // store data at memory location
        _CPU.Yreg = parseInt(data, 16);
    }
    
    //================================================
    // LDY [least significant] [most significant]
    //------------------------------------------------
    // Load the Y register from a memory location
    //================================================
    this["AC"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("LDY [AC " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // store data in Y register
        _CPU.Yreg = parseInt(data, 16);
    }
    
    //================================================
    // NOP
    //------------------------------------------------
    // No Operation
    //================================================
    this["EA"] = function()
    {
        // LOG
        devLog("NOP [EA]");
    }
    
    //================================================
    // CPX [least significant] [most significant]
    //------------------------------------------------
    // Compare byte in memory to X register
    // Sets Z if equal
    //================================================
    this["EC"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("CPX [EC " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        if(parseInt(data, 16) == _CPU.Xreg)
            _CPU.Zflag = 1;
        else
            _CPU.Zflag = 0;
    }
    
    //================================================
    // INC [least significant] [most significant]
    //------------------------------------------------
    // Increment value of a byte
    //================================================
    this["EE"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        
        // LOG
        devLog("INC [EE " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory
        var data = _Memory.get(parseInt(location, 16));
        
        // increment
        var result = parseInt(data, 16) + 1;
        
        _Memory.store(parseInt(location, 16), result.toString(16));
    }
    
    //================================================
    // BNE [memory offset]
    //------------------------------------------------
    // Branch X bytes if Z == 0
    //================================================
    this["D0"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        
        // LOG
        devLog("BNE [D0 " + data + "]");
        
        // if z == 0
        if(_CPU.Zflag == 0)
        {
            devLog("  PC before branch: " + _CPU.PC);
            
            // get the branch-ahead offset.
            var offset = parseInt(data, 16);
            
            // apply branch-ahead offset
            _CPU.PC = _CPU.PC + offset;
            
            // check to see that we haven't gone "around" past 255.
            if(_CPU.PC > 255)
            {
                // fix to make this 255 ????? 
                _CPU.PC = _CPU.PC - 256;
            }
            
            // LOG
            devLog("  PC after branch: " + _CPU.PC);
        }
    }
    
    //================================================
    // System Call
    //------------------------------------------------
    // Throws a system call
    //================================================
    this["FF"] = function()
    {
        // LOG
        devLog("System Call [FF]");
        // send system call
        _KernelInterruptQueue.enqueue(new Interrput(SYSTEMCALL_IRQ, ["FF", _CPU.Xreg, _CPU.Yreg]));
    }
    
    //
    // Helper function to convert int to hex
    // 
    function toHex(data)
    {
        var hex = data.toString(16);
        
        if(hex.length == 1)
        {
            hex = "0" + hex;
        }
        
        return hex;
    }
}