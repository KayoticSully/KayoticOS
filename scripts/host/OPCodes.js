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
 |   Updated: 05/20/2013
 |---------------------------------------------------------------------
 */

function OPCodes(processor)
{
    
    //================================================
    // Helper functions to set flags
    //================================================
    
    // Checks for overflow or underflow of result
    function checkOverUnderflow(result)
    {
        if (result > 127 || result < -128)
        {
            processor.Status.V = 1;
        }
        else
        {
            processor.Status.V = 0;
        }
    }
    
    // Checks result sign and if it is zero
    function checkSignAndZero(result)
    {
        // assume result > 0
        processor.Status.S = 0;
        processor.Status.Z = 0;
        
        if (result < 0)
        {
            processor.Status.S = 1;
        }
        else if (result == 0)
        {
            processor.Status.Z = 1;
        }
    }
    
    // check to see if result is larger than 8 bits
    function checkCarry(result) {
        // Unused, not sure how this is supp
    }
    
    //================================================|
    // Break
    //------------------------------------------------
    // System call to stop program execution
    //================================================
    this["00"] = function()
    {
        // LOG
        devLog("BREAK [00]");
        
        // set Interrupt flag to 1.
        // this still doesn't work as it *really* should,
        // but it atleast represents the proper state of
        // the flags.
        processor.Status.I = 1;
        
        // make interrupt
        var interrupt = new Interrput(SYSTEMCALL_IRQ, ["00"]);
        // throw interrupt
        _KernelInterruptQueue.enqueue(interrupt);
    }
    
    //================================================|
    // LDA [constant]
    //------------------------------------------------
    // Load the accumulator with a constant
    //================================================
    this["A9"] = function()
    {    
        // get data fields
        var data = processor.fetch();
        
        // LOG
        devLog("LDA [A9 " + data + "]");
        
        // Load Acc after converting from hex to int
        processor.Acc = intFromHex(data);
        
        // check sign and zero after 2's complement correction
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // LDA [least significant] [most significant]
    //------------------------------------------------
    // Load the accumulator from Memory
    //================================================
    this["AD"] = function()
    {
        // get data fields
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("LDA [AD " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get data at memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // Load Acc after converting from hex to int
        processor.Acc = intFromHex(data);
        
        // check sign and zero after 2's complement correction
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // STA [least significant] [most significant]
    //------------------------------------------------
    // Store the accumulator to Memory
    //================================================
    this["8D"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("STA [8D " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get Acc
        var data = processor.Acc;
        
        // store data at memory location
        _Memory.store(parseInt(location, 16), hexFromInt(data));
    }
    
    //================================================|
    // ADC [least significant] [most significant]
    //------------------------------------------------
    // Add w/ Carry from Memory location to Acc
    //================================================
    this["6D"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("ADC [6D " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get data value
        var data = _Memory.get(parseInt(location, 16));
        var dataValue = intFromHex(data);
        
        // get carry bit
        var carry = processor.Status.C;
        
        // reset carry before operation
        processor.Status.C = 0;
        
        // do operation + carry
        var result = processor.Acc + dataValue + carry;
        
        checkOverUnderflow(result);
        checkCarry(result);
        
        // put result in Acc
        processor.Acc = result;
        
        // check sign and zero after 2's complement correction
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // ADC [constant]
    //------------------------------------------------
    // Add w/ Carry from constant value to Acc
    //================================================
    this["69"] = function()
    {
        // get data fields
        var data = processor.fetch();
        
        // LOG
        devLog("ADC [69 " + data + "]");
        
        // get data value
        var dataValue = intFromHex(data);
        
        // get carry bit
        var carry = processor.Status.C;
        
        // reset carry before operation
        processor.Status.C = 0;
        
        // do operation
        var result = processor.Acc + dataValue + carry;
        
        checkOverUnderflow(result);
        checkCarry(result);
        
        // put result in Acc
        processor.Acc = result;
        
        // check sign and zero after 2's complement correction
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // SBC [least significant] [most significant]
    //------------------------------------------------
    // Subtract w/ Carry from Memory location to Acc
    //================================================
    this["ED"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("SBC [ED " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get Acc
        var data = _Memory.get(parseInt(location, 16));
        
        // perform operation
        var result = processor.Acc - intFromHex(data);
        
        checkOverUnderflow(result);
        checkCarry(result);
        
        // store result
        processor.Acc = result;
        
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // SBC [constant]
    //------------------------------------------------
    // Subtract w/ Carry from constant value to Acc
    //================================================
    this["E9"] = function()
    {
        // get data fields
        var data = processor.fetch();
        
        // LOG
        devLog("SBC [E9 " + data + "]");
        
        // perform operation
        var result = processor.Acc - intFromHex(data);
        
        checkOverUnderflow(result);
        checkCarry(result);
        
        // store result
        processor.Acc = result;
        
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // LDX [least significant] [most significant]
    //------------------------------------------------
    // Load the X register from a memory location
    //================================================
    this["AE"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("LDX [AE " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // store data in X register
        processor.Xreg = intFromHex(data);
        
        checkSignAndZero(processor.Xreg);
    }
    
    //================================================|
    // LDX [constant]
    //------------------------------------------------
    // Load the X register with a constant
    //================================================
    this["A2"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        devLog("LDX [A2 " + data + "]");
        
        // store data in X register
        processor.Xreg = intFromHex(data);
        
        checkSignAndZero(processor.Xreg);
    }
    
    //================================================|
    // STX [least significant] [most significant]
    //------------------------------------------------
    // Store the X register to Memory
    //================================================
    this["8E"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("STX [8E " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get X
        var data = processor.Xreg;
        
        // store data at memory location
        _Memory.store(parseInt(location, 16), hexFromInt(data));
    }
    
    //================================================|
    // DEX
    //------------------------------------------------
    // Decrements the X register
    //================================================
    this["CA"] = function()
    {
        // LOG
        devLog("DEX [CA]");
        
        // Decrement X
        processor.Xreg = processor.Xreg - 1;
        
        // set status bits
        checkSignAndZero(processor.Xreg);
    }
    
    //================================================|
    // INX
    //------------------------------------------------
    // Increments the X register
    //================================================
    this["E8"] = function()
    {
        // LOG
        devLog("INX [E8]");
        
        // Increment X
        processor.Xreg = processor.Xreg + 1;
        
        // set status bits
        checkSignAndZero(processor.Xreg);
    }
    
    //================================================|
    // TAX
    //------------------------------------------------
    // Transfer Accumulator to X
    //================================================
    this["AA"] = function()
    {
        // LOG
        devLog("TAX [AA]");
        
        // transfer Acc to X
        processor.Xreg = processor.Acc;
        
        // set status bits
        checkSignAndZero(processor.Xreg);
    }
    
    //================================================|
    // TXA
    //------------------------------------------------
    // Transfer X to Acc
    //================================================
    this["8A"] = function()
    {
        // LOG
        devLog("TXA [8A]");
        
        // transfer Acc to X
        processor.Acc = processor.Xreg;
        
        // set status bits
        checkSignAndZero(processor.Acc);
    }
    
    //================================================|
    // LDY [least significant] [most significant]
    //------------------------------------------------
    // Load the Y register from a memory location
    //================================================
    this["AC"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("LDY [AC " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // store data in Y register
        processor.Yreg = intFromHex(data);
        
        checkSignAndZero(processor.Yreg);
    }
    
    //================================================|
    // LDY [constant]
    //------------------------------------------------
    // Load the Y register with a constant
    //================================================
    this["A0"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        devLog("LDY [A0 " + data + "]");
        
        // store data at memory location
        processor.Yreg = intFromHex(data);
        
        checkSignAndZero(processor.Yreg);
    }
    
    //================================================|
    // STY [least significant] [most significant]
    //------------------------------------------------
    // Store the Y register to Memory
    //================================================
    this["8C"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("STY [8E " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        
        // get Y
        var data = processor.Yreg;
        
        // store data at memory location
        _Memory.store(parseInt(location, 16), hexFromInt(data));
    }
    
    //================================================|
    // DEY
    //------------------------------------------------
    // Decrements the Y register
    //================================================
    this["88"] = function()
    {
        // LOG
        devLog("DEY [88]");
        
        // decrement Y
        processor.Yreg = processor.Yreg - 1;
        
        // set status bits
        checkSignAndZero(processor.Yreg);
    }
    
    //================================================|
    // INY
    //------------------------------------------------
    // Increments the Y register
    //================================================
    this["C8"] = function()
    {
        // LOG
        devLog("DEY [C8]");
        
        // Increment Y
        processor.Yreg = processor.Yreg + 1;
        
        // set status bits
        checkSignAndZero(processor.Yreg);
    }
    
    //================================================|
    // TAY
    //------------------------------------------------
    // Transfer Acc to Y
    //================================================
    this["BA"] = function()
    {
        // LOG
        devLog("TAY [BA]");
        
        // Increment Y
        processor.Yreg = processor.Acc;
        
        // set status bits
        checkSignAndZero(processor.Yreg);
    }
    
    //================================================|
    // TYA
    //------------------------------------------------
    // Transfer Y to ACC
    //================================================
    this["98"] = function()
    {
        // LOG
        devLog("TYA [98]");
        
        // Increment Y
        processor.Acc = processor.Yreg;
        
        // set status bits
        checkSignAndZero(processor.Acc);
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
    
    //================================================|
    // CPX [least significant] [most significant]
    //------------------------------------------------
    // Compare byte in memory to X register
    // Sets Z if equal
    //================================================
    this["EC"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("CPX [EC " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // check equality by subtraction
        var result = processor.Xreg - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
    }
    
    //================================================|
    // CPX [constant]
    //------------------------------------------------
    // Compare constant to X register
    // Sets Z if equal
    //================================================
    this["E0"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        devLog("CPX [E0 " + data + "]");
        
        // check equality by subtraction
        var result = processor.Xreg - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
    }
    
    //================================================|
    // CPY [least significant] [most significant]
    //------------------------------------------------
    // Compare byte in memory to Y register
    // Sets Z if equal
    //================================================
    this["CC"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("CPY [CC " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory location
        var data = _Memory.get(parseInt(location, 16));
        
        // check equality by subtraction
        var result = processor.Yreg - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
    }
    
    //================================================|
    // CPY [constant]
    //------------------------------------------------
    // Compare constant to Y register
    // Sets Z if equal
    //================================================
    this["C0"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        devLog("CPY [C0 " + data + "]");
        
        // check equality by subtraction
        var result = processor.Yreg - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
    }
    
    //================================================|
    // INC [least significant] [most significant]
    //------------------------------------------------
    // Increment value of a byte
    //================================================
    this["EE"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("INC [EE " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory
        var data = _Memory.get(parseInt(location, 16));
        
        // increment
        var result = intFromHex(data) + 1;
        
        checkSignAndZero(result);
        
        _Memory.store(parseInt(location, 16), hexFromInt(result));
    }
    
    //================================================|
    // DEC [least significant] [most significant]
    //------------------------------------------------
    // Decrement value of a byte
    //================================================
    this["CE"] = function()
    {
        // get location filds
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("DEC [EE " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get data from memory
        var data = _Memory.get(parseInt(location, 16));
        
        // increment
        var result = intFromHex(data) - 1;
        
        checkSignAndZero(result);
        
        _Memory.store(parseInt(location, 16), hexFromInt(result));
    }
    
    //================================================|
    // BNE [memory offset]
    //------------------------------------------------
    // Branch X bytes if Z == 0
    //================================================
    this["D0"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        var msg = "BNE [D0 " + data + "]";
        
        // if z == 0
        if(processor.Status.Z == 0)
        {
            msg += "<br>&nbsp;&nbsp;" + "PC before branch: " + processor.PC;
            
            // get the branch-ahead offset.
            var offset = parseInt(data, 16);
            
            // apply branch-ahead offset
            processor.PC = processor.PC + offset;
            
            // check to see that we haven't gone "around" past 255.
            if(processor.PC > 255)
            {
                // fix to make this 255 ????? 
                processor.PC = processor.PC - 256;
            }
            
            // LOG
            msg += "<br>&nbsp;&nbsp;" + "PC after branch: " + processor.PC;
        }
        
        devLog(msg);
    }
    
    //================================================|
    // BEQ [memory offset]
    //------------------------------------------------
    // Branch X bytes if Z == 1
    //================================================
    this["F0"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        var msg = "BEQ [F0 " + data + "]";
        
        // if z == 0
        if(processor.Status.Z == 1)
        {
            msg += "<br>&nbsp;&nbsp;" + "PC before branch: " + processor.PC;
            
            // get the branch-ahead offset.
            var offset = parseInt(data, 16);
            
            // apply branch-ahead offset
            processor.PC = processor.PC + offset;
            
            // check to see that we haven't gone "around" past 255.
            if(processor.PC > 255)
            {
                // fix to make this 255 ????? 
                processor.PC = processor.PC - 256;
            }
            
            // LOG
            msg += "<br>&nbsp;&nbsp;" + "PC after branch: " + processor.PC;
        }
        
        devLog(msg);
    }
    
    //================================================|
    // BPL [memory offset]
    //------------------------------------------------
    // Branch X bytes if S == 0
    //================================================
    this["10"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        var msg = "BPL [10 " + data + "]";
        
        // if z == 0
        if(processor.Status.S == 0)
        {
            msg += "<br>&nbsp;&nbsp;" + "PC before branch: " + processor.PC;
            
            // get the branch-ahead offset.
            var offset = parseInt(data, 16);
            
            // apply branch-ahead offset
            processor.PC = processor.PC + offset;
            
            // check to see that we haven't gone "around" past 255.
            if(processor.PC > 255)
            {
                // fix to make this 255 ????? 
                processor.PC = processor.PC - 256;
            }
            
            // LOG
            msg += "<br>&nbsp;&nbsp;" + "PC after branch: " + processor.PC;
        }
        
        devLog(msg);
    }
    
    //================================================|
    // BMI [memory offset]
    //------------------------------------------------
    // Branch X bytes if S == 1
    //================================================
    this["30"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        var msg = "BMI [30 " + data + "]";
        
        // if z == 0
        if(processor.Status.S == 1)
        {
            msg += "<br>&nbsp;&nbsp;" + "PC before branch: " + processor.PC;
            
            // get the branch-ahead offset.
            var offset = parseInt(data, 16);
            
            // apply branch-ahead offset
            processor.PC = processor.PC + offset;
            
            // check to see that we haven't gone "around" past 255.
            if(processor.PC > 255)
            {
                // fix to make this 255 ????? 
                processor.PC = processor.PC - 256;
            }
            
            // LOG
            msg += "<br>&nbsp;&nbsp;" + "PC after branch: " + processor.PC;
        }
        
        devLog(msg);
    }
    
    //================================================|
    // JMP [least significant] [most significant]
    //------------------------------------------------
    // Jump to memory location
    //================================================
    this["4C"] = function()
    {
        // get location filds
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("JMP [4C " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // convert to int
        var intLocation = parseInt(location, 16);
        
        // set location
        processor.PC = intLocation;
    }
    
    //================================================|
    //  CMP [least significant] [most significant]
    //------------------------------------------------
    // Compare Acc with data at a memory location.
    // Set Z if equal
    //================================================
    this["CD"] = function()
    {
        // get data field
        var location1 = processor.fetch();
        var location2 = processor.fetch();
        
        // LOG
        devLog("CMP [CD " + location1 + " " + location2 + "]");
        
        // convert encoding
        var location = location2 + location1;
        // get Acc
        var data = _Memory.get(parseInt(location, 16));
        
        // check equality by subtraction
        var result = processor.Acc - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
    }
    
    //================================================|
    //  CMP [constant]
    //------------------------------------------------
    // Compare Acc with constant
    // Set Z if equal
    //================================================
    this["C9"] = function()
    {
        // get data field
        var data = processor.fetch();
        
        // LOG
        devLog("CMP [C9 " + data + "]");
        
        // check equality by subtraction
        var result = processor.Acc - intFromHex(data);
        
        // sets result bits
        checkSignAndZero(result);
        checkCarry(result);
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
        _KernelInterruptQueue.enqueue(new Interrput(SYSTEMCALL_IRQ, ["FF", processor.Xreg, processor.Yreg]));
    }
}