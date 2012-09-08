/*
 |---------------------------------------------------------------------
 | ObjectShell
 |---------------------------------------------------------------------
 | An ongoing attempt to create a proper data-protected shell
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/6/2012
 |---------------------------------------------------------------------
 | TODO: Write a base class / prototype for system services and let
 |       Shell inherit from it.
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
        this.commandList = {};
        this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        this.apologies   = "[sorry]";
        this.status      = "Status";
        
        //--------------------------------
        // "Public" Instance Functions
        //--------------------------------
        this.init        = shellInit;
        this.putPrompt   = shellPutPrompt;
        this.handleInput = shellHandleInput;
        this.execute     = shellExecute;
        
        
    }
    
    //--------------------------------
    // "Private Static" Members
    //--------------------------------
    //=========================
    // Functions
    //=========================
    function shellPutPrompt()
    {
        _StdIn.putText(this.promptStr);
    }
    
    function shellHandleInput(buffer)
    {
        krnTrace("Shell Command~" + buffer);
        
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
        buffer = buffer.toLowerCase();
        // 3. Separate on spaces so we can determine the command and command-line args, if any.
        var tempList = buffer.split(" ");
        // 4. Take the first (zeroth) element and use that as the command.
        var cmd = tempList.shift();  // Yes, you can do that to an array in Javascript.  See the Queue class.
        // 4.1 Remove any left-over spaces.
        cmd = trim(cmd);
        // 4.2 Record it in the return value.
        retVal.command = cmd;
        
        // 5. Now create the args array from what's left.
        for (var i in tempList)
        {
            var arg = trim(tempList[i]);
            if (arg != "")
            {
                retVal.args[retVal.args.length] = tempList[i];
            }
        }
        return retVal;
    }
    
    function shellExecute(fn, args)
    {
        // we just got a command, so advance the line... 
        _StdIn.advanceLine();
        // .. call the command function passing in the args...
        fn(args);
        // Check to see if we need to advance the line again
        if (_StdIn.CurrentXPosition > 0)
        {
            _StdIn.advanceLine();
        }
        // ... and finally write the prompt again.
        this.putPrompt();
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
        sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running."
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
        sc.description = " - Warms up the neurotoxin emitters";
        sc.function = shellEuthanize;
        this.commandList[sc.command] = sc;
        
        // blackout
        sc = new ShellCommand();
        sc.command = "blackout";
        sc.description = " - Simulates a power failure";
        sc.function = shellPowerFailure;
        this.commandList[sc.command] = sc;
        
        // charw
        sc = new ShellCommand();
        sc.command = "charw";
        sc.description = "<char> - Gets the pixel width of the given character";
        sc.function = shellCharWidth;
        this.commandList[sc.command] = sc;
        
        // status
        sc = new ShellCommand();
        sc.command = "status";
        sc.description = "<string> - Changes the status on the taskbar";
        sc.function = shellStatus;
        this.commandList[sc.command] = sc;
        
        // processes - list the running processes and their IDs
        
        // kill <id> - kills the specified process id.
        
        // Display the initial prompt.
        this.putPrompt();
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
        _StdIn.putText("Invalid Command. ");
        if (_SarcasticMode)
        {
            _StdIn.putText("Duh. Go back to your Speak & Spell.");
        }
        else
        {
            _StdIn.putText("Type 'help' for, well... help.");
        }
    }
    
    function shellCurse()
    {
        _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
        _StdIn.advanceLine();
        _StdIn.putText("Bitch.");
        _SarcasticMode = true;
    }
    
    function shellApology()
    {
        _StdIn.putText("Okay. I forgive you. This time.");
        _SarcasticMode = false;
    }
    
    function shellVer(args)
    {
        _StdIn.putText(APP_NAME + " Core Version " + APP_VERSION);    
    }
    
    function shellHelp(args)
    {
        _StdIn.putText("Commands:");
        for (i in _OsShell.commandList)
        {
            _StdIn.advanceLine();
            _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
        }    
    }
    
    function shellShutdown(args)
    {
         _StdIn.putText("Shutting down...");
         // Call Kernal shutdown routine.
        krnShutdown();   
        // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
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
                    _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                    break;
                default:
                    _StdIn.putText("No manual entry for " + args[0] + ".");
            }        
        }
        else
        {
            _StdIn.putText("Usage: man <topic>  Please supply a topic.");
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
                        _StdIn.putText("Trace is already on, dumbass.");
                    }
                    else
                    {
                        _Trace = true;
                        _StdIn.putText("Trace ON");
                    }
                    
                    break;
                case "off": 
                    _Trace = false;
                    _StdIn.putText("Trace OFF");                
                    break;                
                default:
                    _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
            }        
        }
        else
        {
            _StdIn.putText("Usage: trace <on | off>");
        }
    }
    
    function shellRot13(args)
    {
        if (args.length > 0)
        {
            _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
        }
        else
        {
            _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
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
            _StdIn.putText("Usage: prompt <string>  Please supply a string.");
        }
    }
    
    function shellDate(args)
    {
        _StdIn.putText(_SystemClock.toString());
    }
    
    function shellWhereAmI(args)
    {
        _StdIn.putText("Your location is not worthy of global positioning.");
    }
    
    function shellEuthanize()
    {
        _KernelInterruptQueue.enqueue(new Interrput(EUTHANIZE_IRQ, new Array()));
    }
    
    function shellPowerFailure()
    {
        clearInterval(hardwareClockID);
    }
    
    function shellCharWidth(character)
    {
        var letter = CanvasTextFunctions.letter(character);
        _StdIn.putText("Width of " + character + " is " + letter.width);
    }
    
    function shellStatus(str)
    {
        _OsShell.status = str;
    }
    
    return Shell;
})();

//--------------------------------
// "Public Static" Members
//--------------------------------
// Functions can be added to the prototype
// here to allow for "Public Static" access
//
Shell.prototype.update = function()
{
    DRAWING_CONTEXT.fillStyle = "#ffffff";
    DRAWING_CONTEXT.fillRect(0, CANVAS.height - (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN*2),  CANVAS.width, DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN*2);
    
    var cursorX = _Console.CurrentXPosition;
    var cursorY = _Console.CurrentYPosition;
    
    _Console.CurrentXPosition = 5;
    _Console.CurrentYPosition = CANVAS.height - FONT_HEIGHT_MARGIN;
    
    _Console.putText(_SystemClock.toString() + " | " + this.status);
    
    _Console.CurrentXPosition = cursorX;
    _Console.CurrentYPosition = cursorY;
}
