/*
 |---------------------------------------------------------------------
 | ObjectShell
 |---------------------------------------------------------------------
 | An ongoing attempt to create a proper data-protected shell
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 12/4/2012
 |---------------------------------------------------------------------
 | TODO: Write a base class / prototype for system services and let
 |       Shell inherit from it.
 |
 | Note: This shell behaves a lot like BASH with tab-completes and everything
 */

/*====================================================================*
 | NOTE: Only this "class" was switched over to this format as a test.|
 | It is obviously working, but I wanted to make sure this            |
 | technically follows good coding practices before moving other      |
 | classes over.  I would like to avoid -infinity if possible.        |
 | This was just an experiment based off your notes about             |
 | "private static" functions.                                        |
 *====================================================================*/

//--------------------------------
// "Class" Definition
//--------------------------------
// Uses a function expression and JavaScrip's closure property
// to allow variables and functions to fall into a "private static"
// access level.
// 
var Shell = (function()
{
    //-----------------------------------------------------------------
    // Constructor | This function object is returned at the end
    //-----------------------------------------------------------------
    function Shell()
    {
        //--------------------------------
        // Properties
        //--------------------------------
        this.promptStr   = ">";
        this.commandList = {}; // Made this an object so it can be accessed like an associative array
        this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        this.apologies   = "[sorry]";
        this.status      = "status <string> to change this text";
        
        Object.defineProperty(this, 'taskbar', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _SystemClock.toString() + " | " + this.status;
            }
        });
        
        //--------------------------------
        // "Public" Instance Functions
        //--------------------------------
        this.init        = shellInit;
        this.putPrompt   = shellPutPrompt;
        this.handleInput = shellHandleInput;
        this.execute     = shellExecute;
        this.specialKeys = shellSpecialKeys;
    }
    
    //--------------------------------
    // "Private Static" Members
    //--------------------------------
    //=========================
    // Functions
    //=========================
    function shellPutPrompt()
    {
        // slightly cheaty, but I will make this into an interrupt
        // create a new line object here since this is only called at the start of a line
        var prompt = krnFileSystemDriver.currentPath() + this.promptStr
        _Console.addLine('', prompt);
    }
    
    function shellHandleInput(buffer)
    {
        krnTrace("[Shell Command] " + buffer);
        
        // Store command in history as long as its not blank
        if(trim(buffer) != '')
            _Console.history.add(buffer);
        
        // Parse the input...
        //
        var userCommand = shellParseInput(buffer);
        
        // ... and assign the command and args to local variables.
        var cmd = userCommand.command;
        var args = userCommand.args;
        
        // Determine the command and execute it.
        //
        // Javascript may not support associative arrays (one of the few nice features of PHP, actually)
        // so we have to iterate over the command list in attempt to find a match.
        // TODO: Is there a better way?
        // Answer: Yes, use an associative array... well an object.
        //
        var commandFunction = null;
        
        if(cmd in this.commandList)
        {
            commandFunction = this.commandList[cmd].function;
        }
        
        if (commandFunction != null)
        {
            this.execute(commandFunction, args);
        }
        else
        {
            // It's not found, so check for curses and apologies before declaring the command invalid.
            if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
            {
                this.execute(shellCurse);
            }
            else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apoligies.
            {
                this.execute(shellApology);
            }
            else // It's just a bad command.
            {
                this.execute(shellInvalidCommand);
            }
        }
    }
    
    function shellParseInput(buffer)
    {
        var retVal = new UserCommand();
        
        // 1. Remove leading and trailing spaces.
        buffer = trim(buffer);
        // 2. Lower-case it.
        //buffer = buffer.toLowerCase();
        
        // 3. Separate on spaces so we can determine the command and command-line args, if any.
        var tempList = buffer.match(/[\w\.\-]+|"[\w\.\-\s]*"/g);
        
        // 4. Take the first (zeroth) element and use that as the command.
        var cmd = null;
        if(tempList && tempList.length > 0)
            var cmd = trim(tempList.shift().toLowerCase());  // Yes, you can do that to an array in Javascript.  See the Queue class.
            
        // 4.2 Record it in the return value.
        retVal.command = cmd;
        
        // 5. Now create the args array from what's left.
        for (var i in tempList)
        {
            var arg = trim(tempList[i]);
            if (arg != "")
            {
                retVal.args[retVal.args.length] = tempList[i].replace(/["]/g, "");
            }
        }
        
        return retVal;
    }
    
    function shellExecute(fn, args)
    {
        // we just got a command, so advance the line... 
        _StdIn.addLine();
        
        // .. call the command function passing in the args...
        var options = fn(args);
        
        options = $.extend(
        // defaults
        {
            defer : false
        },
        // override with
        options );
        
        if(! options.defer)
        {
            // Check to see if we need to advance the line again
            //if (_StdIn.CurrentXPosition > 0)
            //{
                //_StdIn.addLine();
            //}
            
            // ... and finally write the prompt again.
            this.putPrompt();
        }
    }
    
    function shellInit()
    {
        var sc = null;
        // Load the command list.
        
        // ver
        sc = new ShellCommand();
        sc.command = "ver";
        sc.description = "- Displays the current version data."
        sc.function = shellVer;
        this.commandList[sc.command] = sc;
        
        // help
        sc = new ShellCommand();
        sc.command = "help";
        sc.description = "- This is the help command. Seek help."
        sc.function = shellHelp;
        this.commandList[sc.command] = sc;
        
        // shutdown
        sc = new ShellCommand();
        sc.command = "shutdown";
        sc.description = "- Shuts down the virtual OS."
        sc.function = shellShutdown;
        this.commandList[sc.command] = sc;
        
        // cls
        sc = new ShellCommand();
        sc.command = "cls";
        sc.description = "- Clears the screen and resets the cursosr position."
        sc.function = shellCls;
        this.commandList[sc.command] = sc;
        
        // man <topic>
        sc = new ShellCommand();
        sc.command = "man";
        sc.description = "<topic> - Displays the MANual page for <topic>.";
        sc.function = shellMan;
        this.commandList[sc.command] = sc;
        
        // trace <on | off>
        sc = new ShellCommand();
        sc.command = "trace";
        sc.description = "<on | off> - Turns the OS trace on or off.";
        sc.function = shellTrace;
        this.commandList[sc.command] = sc;
        
        // rot13 <string>
        sc = new ShellCommand();
        sc.command = "rot13";
        sc.description = "<string> - Does rot13 obfuscation on <string>.";
        sc.function = shellRot13;
        this.commandList[sc.command] = sc;
        
        // prompt <string>
        sc = new ShellCommand();
        sc.command = "prompt";
        sc.description = "<string> - Sets the prompt.";
        sc.function = shellPrompt;
        this.commandList[sc.command] = sc;
        
        // date
        sc = new ShellCommand();
        sc.command = "date";
        sc.description = "- Displays the current date and time";
        sc.function = shellDate;
        this.commandList[sc.command] = sc;
        
        // whereami
        sc = new ShellCommand();
        sc.command = "whereami";
        sc.description = "- Displays your current location";
        sc.function = shellWhereAmI;
        this.commandList[sc.command] = sc;
        
        // euthanize
        sc = new ShellCommand();
        sc.command = "euthanize";
        sc.description = "- Warms up the neurotoxin emitters";
        sc.function = shellEuthanize;
        this.commandList[sc.command] = sc;
        
        /* blackout  removed to make room
        sc = new ShellCommand();
        sc.command = "blackout";
        sc.description = " - Simulates a power failure";
        sc.function = shellPowerFailure;
        this.commandList[sc.command] = sc;*/
        
        // status
        sc = new ShellCommand();
        sc.command = "status";
        sc.description = "<string> - Changes the status on the taskbar";
        sc.function = shellStatus;
        this.commandList[sc.command] = sc;
        
        // load-program
        sc = new ShellCommand();
        sc.command = "load-program";
        sc.description = "- Loads a program from the User Program Entry field";
        sc.function = loadProgram;
        this.commandList[sc.command] = sc;
        
        // run
        sc = new ShellCommand();
        sc.command = "run";
        sc.description = "<int> - Starts execution of specified process id";
        sc.function = shellRun;
        this.commandList[sc.command] = sc;
        
        // history
        sc = new ShellCommand();
        sc.command = "history";
        sc.description = "- Displays command history";
        sc.function = shellHistory;
        this.commandList[sc.command] = sc;
        
        // processes - list the running processes and their IDs
        
        // kill <id> - kills the specified process id.
        sc = new ShellCommand();
        sc.command = "kill";
        sc.description = "<id> - kills the specified process id";
        sc.function = shellKill;
        this.commandList[sc.command] = sc;
        
        // quantum <num> - sets quantum clock ticks
        sc = new ShellCommand();
        sc.command = "quantum";
        sc.description = "- returns current quantum | <num> - sets quantum clock ticks";
        sc.function = shellQuantum;
        this.commandList[sc.command] = sc;
        
        // processes - displays all process information
        sc = new ShellCommand();
        sc.command = "processes";
        sc.description = "- displays all process information";
        sc.function = shellProcesses;
        this.commandList[sc.command] = sc;
        
        // running - displays pid's of active processes
        sc = new ShellCommand();
        sc.command = "running";
        sc.description = "- displays pid's of active processes";
        sc.function = shellRunning;
        this.commandList[sc.command] = sc;
        
        // create <filename> - creates a file on the HDD of the given name
        sc = new ShellCommand();
        sc.command = "create";
        sc.description = "<filename> - creates a file on the HDD of the given name";
        sc.function = shellFileCreate;
        this.commandList[sc.command] = sc;
        
        // write <filename> <data> - writes <data> to given <filename>
        sc = new ShellCommand();
        sc.command = "write";
        sc.description = "<filename> <data> - writes <data> to given <filename>";
        sc.function = shellFileWrite;
        this.commandList[sc.command] = sc;
        
        // read <filename> - gets contents of <filename>
        sc = new ShellCommand();
        sc.command = "read";
        sc.description = "<filename> - gets contents of <filename>";
        sc.function = shellFileRead;
        this.commandList[sc.command] = sc;
        
        // delete <filename> - deletes given file <filename>
        sc = new ShellCommand();
        sc.command = "delete";
        sc.description = "<filename> - deletes given file <filename>";
        sc.function = shellFileDelete;
        this.commandList[sc.command] = sc;
        
        // mkdir <dirname> - creates a directory with name <dirname>
        sc = new ShellCommand();
        sc.command = "mkdir";
        sc.description = "<dirname> - creates a directory with name <dirname>";
        sc.function = shellDirectoryCreate;
        this.commandList[sc.command] = sc;
        
        // cd <dirname> - enters directory <dirname>
        sc = new ShellCommand();
        sc.command = "cd";
        sc.description = "<dirname> - enters directory <dirname>";
        sc.function = shellChangeDirectory;
        this.commandList[sc.command] = sc;
        
        // format - formats the harddrive
        sc = new ShellCommand();
        sc.command = "format";
        sc.description = "my ENTIRE drive - formats the harddrive";
        sc.function = shellDriveFormat;
        this.commandList[sc.command] = sc;
        
        // ls - list files
        sc = new ShellCommand();
        sc.command = "ls";
        sc.description = "- lists files";
        sc.function = shellListFiles;
        this.commandList[sc.command] = sc;
        
        // cpu-scheduler
        sc = new ShellCommand();
        sc.command = "cpu-scheduler";
        sc.description = "<[rr|fcfs|priority]> - gets or sets cpu scheduling algorithm";
        sc.function = shellCpuScheduling;
        this.commandList[sc.command] = sc;
        
        // cpu-scheduler
        sc = new ShellCommand();
        sc.command = "edit";
        sc.description = "<filename> - opens the text editor";
        sc.function = shellEdit;
        this.commandList[sc.command] = sc;
        
        // Display the initial prompt.
        _Console.addText("Oh... it's YOU.");
        this.putPrompt();
    }
    
    function shellSpecialKeys(keyCode)
    {
        switch(keyCode)
        {
            case 9: // tab
                shellTabComplete();
            break;
            
            case 8: // backspace
                _StdIn.delChar();
                break;
            
            case 38: // up arrow
                _Console.history.previous();
            break;
            
            case 40: // down arrow
                _Console.history.next();
            break;
            
            case 37: // left arrow
                if (_Console.buffer.CursorXPosition > 0) {
                    _Console.buffer.CursorXPosition--;
                }
            break;
            
            case 39: // right arrow
                // allow the cursor to go to the end of the line, no further
                var inputLine = _Console.buffer.inputLine;
                if (_Console.buffer.CursorXPosition < inputLine.line.length) {
                    _Console.buffer.CursorXPosition++;
                }
            break;
            
            case 33: // page up
                var newOffset = _Console.screenOffset + 1;
                var maxOffset = _Console.buffer.length - SCREEN_LINE_LENGTH;
                
                // check bounds for maxOffset
                if (maxOffset < 0) maxOffset = 0;
                
                if (newOffset > maxOffset) newOffset = maxOffset;
                
                _Console.screenOffset = newOffset;
            break;
            
            case 34: // page down
                var newOffset = _Console.screenOffset - 1;
                
                if (newOffset < 0) {
                    newOffset = 0;
                }
                
                _Console.screenOffset = newOffset;
            break;
        }
    }
    
    //
    // Checks to see if what has been entered
    // might match a possible command
    //
    function shellTabComplete()
    {
        // get current entry
        var input = _Console.buffer.inputLine;
        var entry = input.line;
        
        var possible = new Array();
        for(var key in _OsShell.commandList)
        {
            if(key.indexOf(entry) == 0)
            {
                possible.push(_OsShell.commandList[key].command);
            }
        }
        
        if(possible.length == 1)
        {
            var command = possible[0];
            _Console.buffer.replaceLine(command);
        }
    }
    
    //=========================
    // Objects
    //=========================
    //
    // An "interior" or "private" class (prototype) used only inside Shell() (we hope).
    //
    function UserCommand()
    {
        // Properties
        this.command = "";
        this.args = [];
    }
    
    //
    // Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
    //
    var ShellCommand = function()     
    {
        // Properties
        this.command = "";
        this.description = "";
        this.function = "";
    }
    
    //=========================
    // Shell Command Functions
    //=========================
    // Again, not part of Shell() class per se', just called from there.
    //
    function shellInvalidCommand()
    {
        _StdIn.addText("Invalid Command. ");
        if (_SarcasticMode)
        {
            _StdIn.addText("Duh. Go back to your Speak & Spell.");
        }
        else
        {
            _StdIn.addText("Type 'help' for, well... help.");
        }
    }
    
    function shellCurse()
    {
        _StdIn.addText("Oh, so that's how it's going to be, eh? Fine.");
        _StdIn.addLine();
        _StdIn.addText("Bitch.");
        _SarcasticMode = true;
    }
    
    function shellApology()
    {
        _StdIn.addText("Okay. I forgive you. This time.");
        _SarcasticMode = false;
    }
    
    function shellVer(args)
    {
        _StdIn.addText(APP_NAME + " Core Version " + APP_VERSION);    
    }
    
    function shellHelp(args)
    {
        _StdIn.addText("Commands:");
        
        for (i in _OsShell.commandList)
        {
            _StdIn.addLine();
            _StdIn.addText("  " + _OsShell.commandList[i].command, "#FFFFFF");
            _StdIn.addText(" " + _OsShell.commandList[i].description);
        }    
    }
    
    function shellShutdown(args)
    {   
        _StdIn.addText("Shutting down...");
        // Call Kernal shutdown routine.
        krnShutdown();
        simHostShutdown();
        // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        
        if(args == "-r")
        {
            setTimeout(simBtnStartOS_click, 500);
        }
        
        return {defer : true };
    }
    
    function shellCls(args)
    {
        _StdIn.clearScreen();
        _StdIn.resetXY();
    }
    
    function shellMan(args)
    {
        if (args.length > 0)
        {
            var topic = args[0];
            switch (topic)
            {
                case "help": 
                    _StdIn.addText("Help displays a list of (hopefully) valid commands.");
                    break;
                default:
                    _StdIn.addText("No manual entry for " + args[0] + ".");
            }        
        }
        else
        {
            _StdIn.addText("Usage: man <topic>  Please supply a topic.");
        }
    }
    
    function shellTrace(args)
    {
        if (args.length > 0)
        {
            var setting = args[0];
            switch (setting)
            {
                case "on": 
                    if (_Trace && _SarcasticMode)
                    {
                        _StdIn.addText("Trace is already on, dumbass.");
                    }
                    else
                    {
                        _Trace = true;
                        _StdIn.addText("Trace ON");
                    }
                    
                    break;
                case "off": 
                    _Trace = false;
                    _StdIn.addText("Trace OFF");                
                    break;                
                default:
                    _StdIn.addText("Invalid arguement.  Usage: trace <on | off>.");
            }        
        }
        else
        {
            _StdIn.addText("Usage: trace <on | off>");
        }
    }
    
    function shellRot13(args)
    {
        if (args.length > 0)
        {
            _StdIn.addText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
        }
        else
        {
            _StdIn.addText("Usage: rot13 <string>  Please supply a string.");
        }
    }
    
    function shellPrompt(args)
    {
        if (args.length > 0)
        {
            _OsShell.promptStr = args[0];
        }
        else
        {
            _StdIn.addText("Usage: prompt <string>  Please supply a string.");
        }
    }
    
    function shellDate(args)
    {
        _StdIn.addText(_SystemClock.toString());
    }
    
    function shellWhereAmI(args)
    {
        //
        // I fully plan on moving most of this code to a GPS "device".
        // Just didn't have the time to do that once I got it working.
        //
        function getLocation(position)
        {
            var geocoder = new google.maps.Geocoder();
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            geocoder.geocode({'latLng': pos}, function(results, status) {
                if(status == 'OK')
                {
                    var location = results[0];
                    var city = location.address_components[2].long_name;
                    var state = location.address_components[4].long_name;
                    var zip = location.address_components[6].short_name;
                    
                    _StdOut.addLine("There you are: " + city + ', ' + state + ' ' + zip, true);
                }
                else
                {
                    _StdOut.addLine("Your location is not worthy of global positioning.", true);
                }
            });
        }
        
        if (navigator.geolocation) 
        {
            _StdOut.addLine("Share your location, you ca-*static* trust me.");
            navigator.geolocation.getCurrentPosition(
                getLocation
            , function(error){
                _StdOut.addLine("Your location is not worthy of global positioning.", true);
            });
            
            return { defer : true };
        }
        else
        {
            _StdOut.addText("Your location is not worthy of global positioning.");
            return null;
        }
    }
    
    function shellEuthanize()
    {
        _KernelInterruptQueue.enqueue(new Interrput(EUTHANIZE_IRQ, new Array()));
    }
    
    function shellPowerFailure()
    {
        _StdOut.addText("Why did you push that!");
        clearInterval(hardwareClockID);
    }
    
    function shellStatus(str)
    {
        var status =  str.join(' ');
        _OsShell.status = status;
        _StdOut.addText("Status set to " + status);
    }
    
    function loadProgram(args)
    {
        _KernelInterruptQueue.enqueue(new Interrput(HOST_IRQ, new Array("load", args[0])));
        return { defer : true };
    }
    
    function shellRun(args)
    {
        if(args == 'all')
        {
            for(var PID in _ResidentQ)
            {
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("ready", _ResidentQ[PID].PID)));
            }
        }
        else
        {
            // add programs to ReadyQ
            for(var PID in args)
            {
                _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("ready", args[PID])));
            }
        }
        
        _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("context-switch", null)));
        _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("execute", null)));
        
        return { defer : true }
    }
    
    function shellHistory()
    {
        _StdOut.addLine("Command History:");
        
        _Console.history.print(
            // some functional programming because I was bored.
            function(command, index){
                if(index != _Console.history.length - 1)
                    _StdOut.addLine('  ' + command);
                else
                    _StdOut.addText('  ' + command);
            }
        );
    }
    
    function shellKill(args)
    {
        _KernelInterruptQueue.enqueue(new Interrput(PROGRAM_IRQ, new Array("kill", args)));
    }
    
    function shellQuantum(args)
    {
        if(args != "")
        {
            _Scheduler.quantum = args;
            _StdOut.addText("Quantum is set to " + _Scheduler.quantum);
        }
        else
        {
            _StdOut.addText("Current quantum is " + _Scheduler.quantum);
        }
    }
    
    function shellProcesses()
    {
        var numOfRunning = _Scheduler.totalRunning;
        var numOfPrograms = _ResidentQ.length;
        
        if(_CPU.isExecuting)
            numOfRunning++;
        
        _StdOut.addLine(numOfRunning + " running out of " + numOfPrograms + " programs.");
    }
    
    function shellRunning()
    {
        var runningProcesses = new Array();
        for(PID in _ResidentQ)
        {
            if(_ResidentQ[PID].state == "ready" || _ResidentQ[PID].state == "waiting" || _ResidentQ[PID].state == "running")
                runningProcesses.push(PID);
        }
        
        runningProcesses.sort();
        
        if(runningProcesses.length == 0)
            runningProcesses = "None";
        
        _StdOut.addLine(runningProcesses);
    }
    
    function shellFileCreate(args)
    {
        var fileName = args[0];
        
        _StdOut.addLine("Creating File " + fileName);
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("create", encodeToHex(fileName), { printLine : true })));
        
        return { defer : true }
    }
    
    function shellFileDelete(args)
    {
        var fileName = args[0];
        
        _StdOut.addLine("Deleting File " + fileName);
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("delete", encodeToHex(fileName), { printLine : true })));
        
        return { defer : true }
    }
    
    function shellFileWrite(args)
    {
        var fileName = args[0];
        var fileData = args[1];
        
        _StdOut.addLine("Writing To File " + fileName);
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("write", encodeToHex(fileName), encodeToHex(fileData), { printLine : true })));
        
        return { defer : true }
    }
    
    function shellFileRead(args)
    {
        var fileName = args[0];
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("read", encodeToHex(fileName))));
        
        return { defer : true }
    }
    
    function shellDirectoryCreate(args)
    {
        var dirName = args[0];
        
        _StdOut.addLine("Creating Directory " + dirName);
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("create", encodeToHex(dirName), { printLine : true, mode : 'directory' })));
        
        return { defer : true }
    }
    
    function shellChangeDirectory(args) {
        var dirName = args[0];
        var interrupt = null;
        
        switch (dirName) {
            case '..':
                interrupt = new Interrput(FS_IRQ, new Array("close", '', { printLine : true }));
            break;
            
            case '.':
                // nothing
            break;
            
            default:
                interrupt = new Interrput(FS_IRQ, new Array("open", encodeToHex(dirName), { printLine : true }));
        }
        
        if (interrupt !== null) {
            _KernelInterruptQueue.enqueue(interrupt);
            return { defer : true };
        }
        
        return {};
    }
    
    function shellDriveFormat(args)
    {
        if(args[0] == "my" && args[1] == "ENTIRE" && args[2] == "drive") {
            _StdOut.addLine("Formatting Drive");
            
            _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("format", { printLine : true })));
            
            return { defer : true }
        }
        else
        {
            _StdOut.addText("Say the magic words...");
        }
        
        return null;
    }
    
    function shellListFiles(args)
    {
        var all = false;
        if(args[0] == 'all') {
            all = true;
        }
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("list", { allFiles : all })));
        return { defer : true }
    }
    
    function shellCpuScheduling(args) {
        
        var message = "";
        if(args.length == 0) {
            message = "Current Algorithm: " + _Scheduler.algo;
        } else if(args[0] == 'rr' || args[0] == 'fcfs' || args[0] == 'priority') {
            _Scheduler.algo = args[0];
            message = "Algorithm Set To: " + _Scheduler.algo;
        } else {
            message = "Invalid Input.  Command syntax: cpu-scheduler <[rr|fcfs|priority]>";
        }
        
        _StdOut.addText(message);
    }
    
    function shellEdit(args) {
        var fileName = args[0];
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("read", encodeToHex(fileName), { editor : true })));
        
        return { defer: true };
    }
    
    return Shell;
})();