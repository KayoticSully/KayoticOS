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
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | This code references page numbers in the text book:
 | Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */


//
// OS Startup and Shutdown Routines   
//
function krnBootstrap()      // Page 8.
{
    simLog("bootstrap", "host");  // Use simLog because we ALWAYS want this, even if _Trace is off.

    // Initialize our global queues.
    _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
    _KernelBuffers = new Array();         // Buffers... for the kernel.
    _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
    _Console = new Console();             // The console output device.

    // Initialize the Console.
    _Console.init();

    // Initialize standard input and output to the _Console.
    _StdIn  = _Console;
    _StdOut = _Console;

    // Load the Keyboard Device Driver
    krnTrace("Loading the keyboard device driver.");
    krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
    krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
    krnTrace(krnKeyboardDriver.status);

    // Load Queues
    _JobQ = new Array();
    _ReadyQ = new Array();
    
    // Load the Memory Manager
    _Memory = new MemoryManager();
    
    // 
    // ... more?
    //

    // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
    krnTrace("Enabling the interrupts.");
    krnEnableInterrupts();
    
    // Launch the shell.
    krnTrace("Creating and Launching the shell.")
    _OsShell = new Shell();
    _OsShell.init();
    
    // draw taskbar
    _Console.drawTaskBar();
}

function krnShutdown()
{
    krnTrace("begin shutdown OS");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interruupts.
    krnTrace("Disabling the interrupts.");
    krnDisableInterrupts();
    
    
    // 
    // Unload the Device Drivers?
    // More?
    //
    krnTrace("end shutdown OS");
}

function krnOnCPUClockPulse() 
{
    /* This gets called from the host hardware every time there is a hardware clock pulse. 
       This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
       This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
       that it has to look for interrupts and process them if it finds any.                           */
    
    // DOES THIS BELONG HERE ???????????
    if(_OSclock % CPU_TIMER_RATE == 0)
    {
        // draw the taskbar part of the gui
        _Console.drawTaskBar();
    }
    
    // Check for an interrupt, are any. Page 560
    if (_KernelInterruptQueue.getSize() > 0)    
    {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queye based on the IRQ number/id to enforce interrupt priority.
        var interrput = _KernelInterruptQueue.dequeue();
        krnInterruptHandler(interrput.irq, interrput.params);        
    }
    else if (_CPU.isExecuting) // If there are no interrupts then run a CPU cycle if there is anything being processed.
    {
        _CPU.cycle();
    }    
    else                       // If there are no interrupts and there is nothing being executed then just be idle.
    {
       krnTrace("Idle");
    }
}

// 
// Interrupt Handling
// 
function krnEnableInterrupts()
{
    // Keyboard
    simEnableKeyboardInterrupt();
    // Put more here.
}

function krnDisableInterrupts()
{
    // Keyboard
    simDisableKeyboardInterrupt();
    // Put more here.
}

function krnInterruptHandler(irq, params)    // This is the Interrupt Handler Routine.  Page 8.
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    krnTrace("Handling IRQ~" + irq);

    // Save CPU state. (I think we do this elsewhere.)
    
    
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
        case SYSTEMCALL_IRQ:
            krnHandleSysCall(params);
            break;
        default: 
            krnTrapError("Invalid Interrupt Request. irq=" + irq, params);
    }

    // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
}

function krnHandleSysCall(params)
{
    if(params[0] === "00")
    {
        krnBreak();
    }
    else if(params[0] == "FF")
    {
        switch(parseInt(params[1]))
        {
            case 1:
                _StdOut.putText(params[2].toString() + " ");
            break;
            
            case 2:
                // get first character from starting location
                var location = parseInt(params[2]);
                var characterHex = _Memory.get(location++);
                
                while(characterHex != "00")
                {
                    // decode character
                    var charCode = parseInt(characterHex, 16);
                    // convert to string
                    var character = String.fromCharCode(charCode);
                    // print character
                    _StdOut.putText(character);
                    
                    // get next
                    characterHex = _Memory.get(location++);
                }
                
                _StdOut.putText(" ");
            break;
        }
    }
}

function krnTimerISR()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    // Check multiprogramming parameters and enfore quanta here. Call the scheduler / context switch here if necessary.
}


function krnLoadProgram(instructionArray)
{
    return _Memory.loadProgram(instructionArray);
}

function krnRunProgram(PID)
{
    
    // force to start of memory for now
    // Quick fix to allow multiple runs of one program
    _CPU.PC = 0;
    
    _ReadyQ.state = "running";
    
    _CPU.isExecuting = true;
}

function krnBreak()
{
    _CPU.isExecuting = false;
    
    // hardcode update _ReadyQ[0] PCB
    // this will have to change once we
    // are dealing with more than one
    // program
    _ReadyQ[0].PC = _CPU.PC;
    _ReadyQ[0].Acc = _CPU.Acc;
    _ReadyQ[0].Xreg = _CPU.Xreg;
    _ReadyQ[0].Yreg = _CPU.Yreg;
    _ReadyQ[0].Zflag = _CPU.Zflag;
    _ReadyQ[0].state = "terminated";
    
    _StdOut.advanceLine();
    _OsShell.putPrompt();
}

//
// System Calls... that generate software interrupts via tha Application Programming Interface library routines.
//
// Some ideas:
// - ReadConsole
// - WriteConsole
// - CreateProcess
// - ExitProcess
// - WaitForProcessToExit
// - CreateFile
// - OpenFile
// - ReadFile
// - WriteFile
// - CloseFile


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
                simLog(msg, "OS");          
            }         
        }
        else
        {
            simLog(msg, "OS");
        }
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
