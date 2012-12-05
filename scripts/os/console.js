/*
 |---------------------------------------------------------------------
 | Console
 |---------------------------------------------------------------------
 | Requires globals.js; SimpleStack.js
 |---------------------------------------------------------------------
 | An extension of the Date object to suite the OS needs.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | The OS Console - stdIn and stdOut by default.
 | Note: This is not the Shell.  The Shell is the "command line interface"
 |       (CLI) or interpreter for this console.
 */

function Console()
{
    // Properties
    this.CurrentFont      = DEFAULT_FONT;
    this.CurrentFontSize  = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    this.CurrentYPosition = DEFAULT_FONT_SIZE + CONSOLE_TOP_MARGIN;
    this.taskbarFontColor = "#000000";
    this.taskbarColor     = DEFAULT_TASKBAR_COLOR;
    this.buffer 	  = new SimpleStack();
    this.history 	  = new CommandHistory();
    
    // Methods
    this.init        = consoleInit;
    this.clearScreen = consoleClearScreen;
    this.resetXY     = consoleResetXY;
    this.resetLine   = consoleResetLine;
    this.handleInput = consoleHandleInput;
    this.putText     = consolePutText;
    this.delChar     = consoleDelText;
    this.advanceLine = consoleAdvanceLine;
    this.drawTaskBar = consoleDrawTaskBar;
    this.putLine     = consolePutLine;
    this.putImage    = consolePutImage;
}

function consoleInit()
{
    consoleClearScreen();
    consoleResetXY();
}

function consoleClearScreen()
{
    DRAWING_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height - TASKBAR_HEIGHT);
}

function consoleResetXY()
{
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    this.CurrentYPosition = CONSOLE_TOP_MARGIN;    
}

function consoleResetLine()
{
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    var lineHeight = this.CurrentFontSize + FONT_HEIGHT_MARGIN;
    
    DRAWING_CONTEXT.clearRect(0, this.CurrentYPosition - this.CurrentFontSize, CANVAS.width, lineHeight);
    _OsShell.putPrompt();
}

function consoleHandleInput()
{
    while (_KernelInputQueue.getSize() > 0)
    {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if (chr == String.fromCharCode(13))  //     Enter key   
        {
            // The enter key marks the end of a console command, so ...
            // ... tell the shell ... 
            _OsShell.handleInput(this.buffer.popAll());
        }
        // TODO: Write a case for Ctrl-C.
        else
        {
            // This is a "normal" character, so ...
            // ... draw it on the screen...
            this.putText(chr);
            // ... and add it to our buffer.
            this.buffer.push(chr);
        }
    }
}

function consolePutLine(txt, prompt, color) 
{
    // Shortcut function that advances the line after putting text.
    if(prompt == undefined && typeof prompt != "boolean")
    {
	prompt = false;
    }
    
    if(color == undefined)
    {
	color = DEFAULT_FONT_COLOR;
    }
    
    this.putText(txt, color);
    this.advanceLine();
    
    if(prompt)
    {
	_OsShell.putPrompt();
    }
}

function consolePutText(txt, textColor)    
{
    // My first inclination here was to write two functions: putChar() and putString().
    // Then I remembered that Javascript is (sadly) untyped and it won't differentiate 
    // between the two.  So rather than be like PHP and write two (or more) functions that
    // do the same thing, thereby encouraging confusion and decreasing readability, I 
    // decided to write one function and use the term "text" to connote string or char.
    //
    // Actually following good coding practices, PHP can result in the same one function.
    // Just Saying.
    if (txt != "")
    {
	if(textColor == undefined)
	{
	    textColor = DEFAULT_FONT_COLOR;
	}
	
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, txt, textColor);
	
    	// Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, txt);
        this.CurrentXPosition = this.CurrentXPosition + offset;
    }
}

function consoleDelText()
{
    // Deletes the last character entered in the console.
    if(this.buffer.size > 0)
    {
	var character = this.buffer.pop();
	// Move the current X position.
	var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, character);
	this.CurrentXPosition = this.CurrentXPosition - offset;
	
	DRAWING_CONTEXT.clearRect(this.CurrentXPosition, this.CurrentYPosition - DEFAULT_FONT_SIZE, offset, DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN);
    }
}

function consoleAdvanceLine()
{
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    
    if(this.CurrentYPosition >= CANVAS.height - (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN) - TASKBAR_HEIGHT)
    {
	// calculate line height to move up
	var lineHeight = DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
	
	// grab image less line height at top
	var image = DRAWING_CONTEXT.getImageData(0, lineHeight, CANVAS.width, CANVAS.height - lineHeight - TASKBAR_HEIGHT);
	
	// clear "screen"
	this.clearScreen();
	
	// draw image starting from the top
	DRAWING_CONTEXT.putImageData(image, 0, 0);
    }
    else
    {
	// if not at bottom try to get there
	this.CurrentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
    }
}

/* HIGHLY EXPERIMENTAL */
function consolePutImage(image)
{
    if(this.CurrentYPosition >= CANVAS.height - image.height - TASKBAR_HEIGHT)
    {
	var consImg = DRAWING_CONTEXT.getImageData(0, image.height, CANVAS.width, CANVAS.height - image.height - TASKBAR_HEIGHT);
	
	// clear "screen"
	this.clearScreen();
	
	// draw image starting from the top
	DRAWING_CONTEXT.putImageData(consImg, 0, 0);
    }
    
    DRAWING_CONTEXT.drawImage(image, CONSOLE_LEFT_MARGIN, this.CurrentYPosition - DEFAULT_FONT_SIZE);
    
    this.CurrentYPosition = image.height + 80;
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    
    _OsShell.putPrompt();
}


function consoleDrawTaskBar()
{
    // Still not sure if this belongs here or in the shell.
    // Having a little trouble finding that line that separates
    // the two objects
    
    // paint background
    var taskBarTop = CANVAS.height - TASKBAR_HEIGHT;
    DRAWING_CONTEXT.fillStyle = _Console.taskbarColor;
    DRAWING_CONTEXT.fillRect(0,  taskBarTop,  CANVAS.width, TASKBAR_HEIGHT);
    
    var taskFontSize = DEFAULT_FONT_SIZE - 3;
    var text_location = taskBarTop +  (TASKBAR_HEIGHT / 2) + (taskFontSize / 2) - 1;
    
    var txt = _OsShell.taskbar;
    DRAWING_CONTEXT.drawText(this.CurrentFont, taskFontSize, TASKBAR_LEFT_MARGIN, text_location, txt, _Console.taskbarFontColor);
}

//------------------------------
//  "Private" Objects 
//------------------------------
// Will actually make this "private"
// in the future when the entire
// console class is re-worked

/*
 |---------------------------------------------------------------------
 | Command History
 |---------------------------------------------------------------------
 | Keeps track of every command entered
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/11/2012
 |   Updated: 9/11/2012
 |---------------------------------------------------------------------
 */
var CommandHistory = (function()
{
    var index = 0;
    
    function ShellHistory()
    {
	this.commands = new Array();
	
	Object.defineProperty(this, 'length', {
	    writeable       : false,
	    enumerable      : false,
	    get             : function() {
		return this.commands.length;
	    }
	});
	
	this.add = function(command)
	{
	    this.commands.push(command);
	    index = this.commands.length;
	}
	
	//
	// Displays the previous stored command
	// 
	this.previous = function()
	{
	    if(index > 0)
	    {
		index--;
	    }
	    
	    var command = this.commands[index];
	    
	    setCommand(command);
	}
	
	//
	// Displays the next stored command
	// 
	this.next = function()
	{
	    if(index != this.commands.length)
	    {
		index++;
	    }
	    
	    var command = this.commands[index];
	    
	    if(index == this.commands.length)
		command = '';
	    
	    setCommand(command);
	}
	
	this.print = function(func)
	{
	    for(var line in this.commands)
		func(this.commands[line], line);
	}
    }
    
    function setCommand(command)
    {
	_Console.resetLine();
	_Console.buffer.popAll();
	
	for(var ch in command)
	{
	    _Console.buffer.push(command[ch]);
	}
	
	_Console.putText(command);
    }
    
    return ShellHistory;
})();
