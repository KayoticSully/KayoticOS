/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function Console()
{
    // Properties
    this.CurrentFont      = DEFAULT_FONT;
    this.CurrentFontSize  = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = CONSOLE_LEFT_MARGIN;
    this.CurrentYPosition = DEFAULT_FONT_SIZE + CONSOLE_TOP_MARGIN;
    this.buffer = new SimpleStack();
    
    // Methods
    this.init        = consoleInit;
    this.clearScreen = consoleClearScreen;
    this.resetXY     = consoleResetXY;
    this.handleInput = consoleHandleInput;
    this.putText     = consolePutText;
    this.delChar     = consoleDelText;
    this.advanceLine = consoleAdvanceLine;
    this.drawTaskBar = consoleDrawTaskBar;
    this.putLine     = consolePutLine;
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
    this.CurrentYPosition = this.CurrentFontSize + CONSOLE_TOP_MARGIN;    
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

function consolePutLine(txt)
{
    this.putText(txt);
    this.advanceLine();
}

function consolePutText(txt)    
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
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, txt);
	
    	// Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, txt);
        this.CurrentXPosition = this.CurrentXPosition + offset;
    }
}

function consoleDelText()
{
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

function consoleDrawTaskBar()
{
    // paint background
    var taskBarTop = CANVAS.height - TASKBAR_HEIGHT;
    DRAWING_CONTEXT.fillStyle = TASKBAR_COLOR;
    DRAWING_CONTEXT.fillRect(0,  taskBarTop,  CANVAS.width, TASKBAR_HEIGHT);
    
    var taskFontSize = DEFAULT_FONT_SIZE - 3;
    var text_location = taskBarTop +  (TASKBAR_HEIGHT / 2) + (taskFontSize / 2) - 1;
    
    var txt = _OsShell.taskbar;
    DRAWING_CONTEXT.drawText(this.CurrentFont, taskFontSize, TASKBAR_LEFT_MARGIN, text_location, txt);
}
