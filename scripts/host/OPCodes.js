

function OPCodes()
{
    this["00"] = function()
    {
        var interrupt = new Interrput(SYSTEMCALL_IRQ, ["00"]);
        _KernelInterruptQueue.enqueue(interrupt);
    }
    
    this["A9"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        // Load Acc after converting from hex to int
        _CPU.Acc = parseInt(data, 16);
    }
    
    this["AD"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        // get data at memory location
        var data = _Memory.get(parseInt(location, 16));
        // Load Acc after converting from hex to int
        _CPU.Acc = parseInt(data, 16);
    }
    
    this["8D"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        // get Acc
        var data = _CPU.Acc;
        // store data at memory location
        _Memory.store(parseInt(location, 16), data.toString(16));
    }
    
    this["6D"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        // get Acc
        var data = _Memory.get(parseInt(location, 16));
        // store data at memory location
        _CPU.Acc += parseInt(data, 16);
    }
    
    this["A2"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        
        // store data at memory location
        _CPU.Xreg = parseInt(data, 16);
    }
    
    this["AE"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        // store data at memory location
        var data = _Memory.get(parseInt(location, 16));
        
        _CPU.Xreg = parseInt(data, 16);
    }
    
    this["A0"] = function()
    {
        // get data field
        var data = _CPU.fetch();
        
        // store data at memory location
        _CPU.Yreg = parseInt(data, 16);
    }
    
    this["AC"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        var data = _Memory.get(parseInt(location, 16));
        
        _CPU.Yreg = parseInt(data, 16);
    }
    
    this["EA"] = function()
    {
        // no op
    }
    
    this["EC"] = function()
    {
        // get data field
        var location1 = _CPU.fetch();
        var location2 = _CPU.fetch();
        var location = location2 + location1;
        
        var data = _Memory.get(parseInt(location, 16));
        
        if(parseInt(data, 16) == _CPU.Xreg)
            _CPU.Zflag = 0;
        else
            _CPU.Zflag = 1;
    }
    
    this["FF"] = function()
    {
        if(_CPU.Xreg == 1)
        {
            _KernelInterruptQueue.enqueue(new Interrput(PRINT_IRQ, [_CPU.Yreg]));
            //_StdOut.putLine(_CPU.Yreg);
        }
    }
}