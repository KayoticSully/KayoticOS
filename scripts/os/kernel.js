/*
 |---------------------------------------------------------------------
 | Kernel
 |---------------------------------------------------------------------
 | Requires globals.js
 |---------------------------------------------------------------------
 | Routines for the Operataing System, NOT the host.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 12/4/2012
 |---------------------------------------------------------------------
 | This code references page numbers in the text book:
 | Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */


//
// OS Startup and Shutdown Routines   
//
function krnBootstrap()      // Page 8.
{
    simLog("Bootstrap Init", "Kernel");  // Use simLog because we ALWAYS want this, even if _Trace is off.

    // Initialize our global queues.
    _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
    _KernelBuffers = new Array();         // Buffers... for the kernel.
    _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
    _Console = new Console();             // The console output device.
    
    // Initialize the Console.
    krnTrace("Starting Console.");
    _Console.init();

    // Initialize standard input and output to the _Console.
    _StdIn  = _Console;
    _StdOut = _Console;

    // Load the Keyboard Device Driver
    krnTrace("Loading the keyboard device driver.");
    krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
    krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
    krnTrace(krnKeyboardDriver.status);
    
    krnTrace("Loading the mouse device driver.");
    krnMouseDriver = new DeviceDriverMouse();     // Construct it.
    krnMouseDriver.driverEntry();                 // Call the driverEntry() initialization routine.
    krnTrace(krnMouseDriver.status);
    
    // Load the File System
    krnFileSystemDriver = new DeviceDriverFileSystem();
    krnFileSystemDriver.driverEntry();
    krnTrace(krnFileSystemDriver.status);

    // Load Queues
    _ResidentQ = new Array();
    
    // Load the Memory Manager
    _Memory = new MemoryManager();
    
    _Scheduler = new ProcessScheduler();
    
    // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
    krnTrace("Enabling the interrupts.");
    krnEnableInterrupts();
    
    // Launch the shell.
    krnTrace("Creating and Launching the shell.");
    _OsShell = new Shell();
    _OsShell.init();
    
    // draw taskbar
    _Console.drawTaskBar();
}

function krnShutdown()
{
    krnTrace("Begin Shutdown OS.");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interruupts.
    krnTrace("Disabling the interrupts.");
    krnDisableInterrupts();
    
    // 
    // Unload the Device Drivers?
    // More?
    //
    _OsShell = null;
    _Scheduler = null;
    _Memory = null;
    _ResidentQ = null;
    _CPU = null;
    krnKeyboardDriver = null;
    krnFileSystemDriver = null;
    _StdOut = null;
    _StdIn  = null;
    _Console = null;
    _KernelInputQueue = null;
    _KernelBuffers = null;
    _KernelInterruptQueue = null;
    
    krnTrace("End Shutdown OS");
}

function krnOnCPUClockPulse() 
{
    /* This gets called from the host hardware every time there is a hardware clock pulse. 
       This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
       This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
       that it has to look for interrupts and process them if it finds any.                           */
    // DOES THIS BELONG HERE ???????????
    if(_OSclock % SCREEN_REFRESH_INTERVAL == 0)
    {
        // draw the taskbar part of the gui
        _Console.drawTaskBar();
        _Console.refresh();
    }
    
    // Check for an interrupt, are any. Page 560
    if (_KernelInterruptQueue.getSize() > 0)
    {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queye based on the IRQ number/id to enforce interrupt priority.
        var interrput = _KernelInterruptQueue.dequeue();
        krnInterruptHandler(interrput.irq, interrput.params);
    }
    else
    {
        var somethingExecuted = false;
        
        // cycle all cpu's
        for (var i in _CPUS)
        {
            var CPU = _CPUS[i];
            
            if (CPU.isExecuting)// If there are no interrupts then run a CPU cycle if there is anything being processed.
            {
                somethingExecuted = true;
                CPU.cycle();
                _Scheduler.tick(i);
            }
        }
        
        if (!somethingExecuted)
        {
            // If there are no interrupts and there is nothing being executed then just be idle.
            krnTrace("Idle");
        }
    }
}

// 
// Interrupt Handling
// 
function krnEnableInterrupts()
{
    // Keyboard
    simEnableKeyboardInterrupt();
    simEnableMouseInterrupt();
    // Put more here.
}

function krnDisableInterrupts()
{
    // Keyboard
    simDisableKeyboardInterrupt();
    simDisableMouseInterrupt();
    // Put more here.
}

function krnInterruptHandler(irq, params)    // This is the Interrupt Handler Routine.  Page 8.
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    krnTrace("[Handling IRQ] " + irq);

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
    // TODO: Use Interrupt Vector in the future.
    // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.  
    //       Maybe the hardware simulation will grow to support/require that in the future.
    switch (irq)
    {
        case TIMER_IRQ:
            krnTimerISR();                   // Kernel built-in routine for timers (not the clock).
            break;
        case KEYBOARD_IRQ:
            krnKeyboardDriver.isr(params);   // Kernel mode device driver
            _StdIn.handleInput();
            break;
        case FS_IRQ:
            krnFileSystemDriver.isr(params);
            break;
        case SYSTEMCALL_IRQ:
            krnHandleSysCall(params);
            break;
        case PROGRAM_IRQ:
            krnProgramISR(params);
            break;
        case HOST_IRQ:
            krnHostISR(params);
            break;
        case KRN_IRQ:
            krnISR(params);
            break;
        case MOUSE_IRQ:
            krnMouseDriver.isr(params);
            break;
        case BADOP_IRQ:
            simLog("Bad OP - Killing Program", "Error");
            console.log("BADOP: " + params);
            _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", _Memory.ActivePID)));
            break;
        default: 
            krnTrapError("Invalid Interrupt Request. irq=" + irq, params);
    }

    // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
}

function krnProgramISR(params)
{
    switch (params[0]) {
        case "ready":
            krnReadyProgram(params[1]);
            break;
        case "execute":
            krnExecute();
            break;
        case "context-switch":
            krnContextSwitch(params[1]);
            break;
        case "kill":
            krnKillProgram(params[1]);
            break
    }
}

function krnHostISR(params)
{
    switch(params[0]) {
        case 'load':
            krnLoadProgram(params[1]);
            break;
    }
}

function krnISR(params)
{
    switch(params[0]) {
        case 'printText':
            _StdOut.addText(params[1], params[2]);
            break;
        case 'printLine':
            _StdOut.putLine(params[1], params[2], params[3]);
            break;
        case 'printHexLine':
            _StdOut.putLine(decodeFromHex(params[1]), params[2]);
            break;
        case 'rollIn':
            _Memory.rollIn(params[1], params[2]);
            break;
        case 'editor':
            var fileName = decodeFromHex(params[1]);
            // load editor
            _Editor = new Editor();
            // load file
            _Editor.init(fileName, params[2]);
            // switch to editor
            _Console.editMode = true;
            _OsShell.status = 'Editing ' + fileName;
            break;
        case 'compile':
            var source = trim(decodeFromHex(params[2]));
            var target = trim(params[3]);
            
            console.log(params[2]);
            
            //logLevel = 'verbose';
            var line = "Compiling File " + decodeFromHex(params[1]);
            log(line, 'normal', false);
            
            // Lex Source
            var lexer       = new Lexer();
            var tokenStream = lexer.lex(source);
            var tokenErrors = lexer.getErrors();
            
            if (tokenErrors.length > 0) {
                log('-------');
                log('Failure', 'error');
                log('-------');
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
                break;
            }
            
            // Parse Tokens
            var parser      = new Parser();
            var parseResults = parser.parse(tokenStream);
            var parseErrors = parser.getErrors();
            
            if (parseErrors.length > 0) {
                log('-------');
                log('Failure', 'error');
                log('-------');
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
                break;
            }
            
            // Analyze!
            var symbolTable = parser.getSymbolTable();
            var ast         = parser.getAST();
            
            var analysis    = new SemanticAnalysis();
            analysis.analyze(symbolTable, ast);
            var analysisErrors = analysis.getErrors();
            
            if (analysisErrors.length > 0) {
                log('-------');
                log('Failure', 'error');
                log('-------');
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
                break;
            }
            
            // CodeGen!
            var codegen = new CodeGen();
            var hexCode = codegen.generate(symbolTable, ast);
            
            // make sure file is created
            console.log('target: ' + target);
            _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("create", target, { printLine : false })));
            _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("write", target, encodeToHex(hexCode), { printLine : false })));
            
            log('-------');
            log('Success!');
            log('-------');
            
            var line = "Compiled code saved in " + decodeFromHex(target);
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", line, true)));
            break;
        
        case 'load':
            var source = trim(decodeFromHex(params[2]));
            //var priority = trim(decodeFromHex(params[3]));
            var instructions = source.match(PROGRAM_PATTERN);
            
            if(instructions !== null && source == instructions.join(' ')) {
                var PID = _Memory.loadProgram(instructions);
                
                // if execute
                if (params.length > 3 && params[3] === true) {
                    _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("ready", PID)));
                } else {
                    // Print Acknowledgement
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printText", "Your specimen has been processed and now we are ready")));
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "to begin the test proper. Your unique specimen identification", false)));
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "number is " + PID, true)));
                }
            }
            else
            {
                // Print Error
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printText", "Program does not comply with proper formatting standards specified in", "#FF0000")));
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "the Testing Procedures Manual, section 42 paragraph 285.", true, "#FF0000")));
            }
        break;
    }
}

function krnLoadProgram(priority)
{
    var programContents = trim(programLoadContents());
    
    if(programContents != '')
    {
        var instructions = programContents.match(PROGRAM_PATTERN);
        
        if(programContents == instructions.join(' '))
        {
            var PID = _Memory.loadProgram(instructions, priority);
            
            // Print Acknowledgement
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printText", "Your specimen has been processed and now we are ready")));
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "to begin the test proper. Your unique specimen identification", false)));
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "number is " + PID, true)));
        }
        else
        {
            // Print Error
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printText", "Program does not comply with proper formatting standards specified in", "#FF0000")));
            _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "the Testing Procedures Manual, section 42 paragraph 285.", true, "#FF0000")));
        }
    }
    else
    {
        // Print Error
        _StdIn.addText("You first need something to load.");
    }
    
    _StdOut.advanceLine();
    _OsShell.putPrompt();
}

function krnHandleSysCall(params)
{
    if(params[0] === "00")
    {
        krnBreak(params[1]);
    }
    else if(params[0] == "FF")
    {
        switch(parseInt(params[1]))
        {
            case 1:
                _StdOut.addText(params[2].toString() + " ");
            break;
            
            case 2:
                // since the OS works on 2's complement, the Y register
                // might be negative.  Since memory locations can't be
                // negative, we need to reconvert it from hex.
                var hexLocation = hexFromInt(params[2]);
                var location = parseInt(hexLocation, 16);
                
                // get first character from starting location
                var characterHex = _Memory.get(location++, params[3]);
                
                console.log('ID:' + location);
                
                while(characterHex != "00")
                {
                    // decode character
                    var charCode = parseInt(characterHex, 16);
                    // convert to string
                    var character = String.fromCharCode(charCode);
                    // print character
                    _StdOut.addText(character);
                    
                    // get next
                    characterHex = _Memory.get(location++, params[3]);
                }
                
                _StdOut.addText(" ");
            break;
        }
    }
}

function krnTimerISR()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    alert("test");
    // Check multiprogramming parameters and enfore quanta here. Call the scheduler / context switch here if necessary.
}

function krnExecute()
{
    var progsStarting = _Scheduler.readyQ.length;
    if (progsStarting >= _CPU_COUNT)
    {
        for (var i = 0; i < _CPU_COUNT; i++)
        {
            _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", i)));
            _CPUS[i].isExecuting = true;
        }   
    }
    else if (progsStarting < _CPU_COUNT)
    {
        for (var i = 0; i < progsStarting; i++)
        {
            _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", i)));
            _CPUS[i].isExecuting = true;
        }   
    }
}

function krnContextSwitch(processor)
{
    // assume processor 0 
    if (processor === undefined)
    {
        processor = 0;
    }
    
    console.log("CONTEXT SWITCH LIKE A BOSS");
    krnTrace("Context Switch");
    
    // TODO
    if(_Memory.ActivePID[processor] != null)
    {
        // pack up running process
        var process = _ResidentQ[_Memory.ActivePID[processor]];
        
        krnSaveState(process, "ready");
        
        _Scheduler.schedule(process);
        
        _Mode = 0;
    }
    
    console.log("Running: " + _Scheduler.totalRunning);
    console.log(_Scheduler.readyQ[0]);
    
    // get PCB
    if(_Scheduler.totalRunning > 0)
    {
        var process = _Scheduler.getProcess(processor);
        
        console.log(process);
        if(process !== undefined) { // make sure PCB is something
            if(process.Base == -1) {
                var fileName = 'p' + process.PID;
                _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array('read', encodeToHex(fileName), { rollIn : true, mode : 'system_file' })));
            }
            else
                krnLoadState(process, "running");
        }
        else // Crash system if this ever happens!
            _KernelInterruptQueue.enqueue(new Interrput(EUTHANIZE_IRQ, "PCB is corrupt"));
            
        _Mode = 1;
    }
}

function krnSaveState(process, status)
{
    var cpu = process.cpuId;
    process.PC      = _CPUS[cpu].PC;
    process.Acc     = _CPUS[cpu].Acc;
    process.Xreg    = _CPUS[cpu].Xreg;
    process.Yreg    = _CPUS[cpu].Yreg;
    process.Zflag   = _CPUS[cpu].Zflag;
    process.state  = status;
}

function krnLoadState(process, status)
{
    var cpu = process.cpuId;
    // unpack PCB into CPU
    _CPUS[cpu].PC     = process.PC;
    _CPUS[cpu].Acc    = process.Acc;
    _CPUS[cpu].Xreg   = process.Xreg;
    _CPUS[cpu].Yreg   = process.Yreg;
    _CPUS[cpu].Zflag  = process.Zflag;
    // make sure processor is set to execute
    _CPUS[cpu].isExecuting = true;
    // unpack PCB into Memory
    _Memory.Base[cpu]        = process.Base;
    _Memory.Limit[cpu]       = process.Limit;
    _Memory.ActivePID[cpu]   = process.PID;
    // set state
    process.state       = status;
}

function krnResetProgram(process)
{
    process.PC      = 0;
    process.Acc     = 0;
    process.Xreg    = 0;
    process.Yreg    = 0;
    process.Zflag   = 0;
}

function krnReadyProgram(PID)
{
    var program = _ResidentQ[PID];
    // set PCB state
    program.state = "ready";
    // ensure fresh program state
    krnResetProgram(program);
    // schedule 
    _Scheduler.schedule(program);
}

function krnKillProgram(PID)
{
    // ensure the process you are killing
    // is not running.
    for (var p in _Memory.ActivePID)
    {
        if(_Memory.ActivePID[p] == PID)
        {
            //> I am happily surprised that this works.
            //> I also like that I managed to use a recursively calling interrupt
            // WHAT THE HELL WERE YOUR THINKING THIS WAS A HORRIBLE IDEA
            _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", p)));
            _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", PID)));
        }       
    }
    
    _Scheduler.kill(PID);
}

function krnBreak(cpuId)
{
    // stop execution on this CPU
    _CPUS[cpuId].isExecuting = false;
    
    _ResidentQ[_Memory.ActivePID[cpuId]].state = "terminated";   
    _Memory.ActivePID[cpuId] = null;
    
    // this will cause a strange quantum bug, remember this
    if(_Scheduler.totalRunning > 0)
    {
        _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", cpuId)));
    }
    else
    {
        _StdOut.advanceLine();
        _OsShell.putPrompt();
    }
}

//
// OS Utility Routines
//
function krnTrace(msg)
{
    // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
    if (_Trace)
    {   
        if (msg == "Idle")
        {
            // We can't log every idle clock pulse because it would lag the browser very quickly.
            if (_OSclock % 10 == 0)  // Check the CPU_CLOCK_INTERVAL in globals.js for an 
            {                                                 // idea of the tick rate and adjust this line accordingly.
                simLog(msg, "Kernel");          
            }         
        }
        else
        {
            simLog(msg, "OS");
        }
    }
}

function errorTrace(msg)
{
    if (_Trace)
    {
        simLog(msg, "Error");
    }
}
function krnTrapError(msg, secondary)
{
    simLog("OS ERROR - TRAP: " + msg);
    
    // Can probably call this in a more "real" fashion
    // either way, this is just for effect, and because I could.
    hostErrorResponse();
    
    _Console.taskbarColor = "#FF0000";
    _Console.taskbarFontColor = "#FFFFFF";
    
    DEFAULT_FONT_COLOR = "#000000";
    
    _Console.putLine("");
    _Console.putText("[ERROR] " , "#FF0000");
    _Console.putLine(msg);
    _Console.putLine("[PARAMS] " + secondary);
    _Console.putLine("");
    
    var linePrefix = '        ';
    _Console.putLine(linePrefix + "You may now proceed into android hell...");
    
    DEFAULT_FONT_COLOR = "#FF0000";
    
    //
    // Print out the failure image
    //
    _Console.putLine(linePrefix + "                .+");
    _Console.putLine(linePrefix + "             /M;");
    _Console.putLine(linePrefix + "              H#@:              ;,");
    _Console.putLine(linePrefix + "              -###H-          -@/");
    _Console.putLine(linePrefix + "               %####$.  -;  .%#X");
    _Console.putLine(linePrefix + "                M#####+;#H :M#M.");
    _Console.putLine(linePrefix + "..          .+/;%#########X###-");
    _Console.putLine(linePrefix + " -/%H%+;-,    +##############/");
    _Console.putLine(linePrefix + "    .:$M###MH$%+############X  ,--=;-");
    _Console.putLine(linePrefix + "        -/H#####################H+=.");
    _Console.putLine(linePrefix + "           .+#################X.");
    _Console.putLine(linePrefix + "         =%M####################H;.");
    _Console.putLine(linePrefix + "            /@###############+;;/%%;,");
    _Console.putLine(linePrefix + "         -%###################$.");
    _Console.putLine(linePrefix + "       ;H######################M=");
    _Console.putLine(linePrefix + "    ,%#####MH$%;+#####M###-/@####%");
    _Console.putLine(linePrefix + "  :$H%+;=-      -####X.,H#   -+M##@-");
    _Console.putLine(linePrefix + " .              ,###;    ;      =$##+");
    _Console.putLine(linePrefix + "                .#H,               :XH,");
    _Console.putLine(linePrefix + "                 +                   .;-");
    
    DEFAULT_FONT_COLOR = "#000000";
    
    //
    // References, since I didn't make the media
    //
    _Console.putLine(" Music: http://www.albinoblacksheep.com/audio/modified");
    _Console.putText(" ACSII: http://pastebin.com/1AZwKrKp");
    
    simBtnHaltOS_click();
}
