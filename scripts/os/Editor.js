/*
 |---------------------------------------------------------------------
 | Editor
 |---------------------------------------------------------------------
 | A text editor for KayoticOS
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 4/19/2013
 |   Updated: 4/20/2013
 |---------------------------------------------------------------------
 */


var Editor = (function()
{
    function Editor()
    {
        this.fileName = null;
        //--------------------------------
        // "Public" Instance Functions
        //--------------------------------
        this.init        = init;
        this.handleEnter = handleEnter;
        this.specialKeys = specialKeys;
        this.controlKeys = controlKeys;
        this.save        = save;
        this.quit        = quit;
        this.savedStatus = _OsShell.status;
    }
    
    function init(fileName, fileData) {
        this.fileName = fileName;
        
        var fileText = decodeFromHex(fileData);
        var fileLines = fileText.split("\n");
        
        // wipe buffer
        _Console.savedBuffer = _Console.buffer;
        _Console.buffer = new ScreenBuffer();
        
        for (var lineIndex in fileLines) {
            if (lineIndex == 0) {
                _Console.addText(fileLines[lineIndex]);
            } else {
                _Console.addLine(fileLines[lineIndex]);
            }
        }
    }
    
    function save() {
        var fileText = '';
        
        // Get all the text seperated by new line characters to save
        // to file
        for (var index = _Console.buffer.length - 1; index >= 0; index--) {
            fileText += _Console.buffer.lines[index].line;
            
            if (index < _Console.buffer.length) {
                fileText += "\n";
            }
        }
        
        console.log(fileText);
        
        _KernelInterruptQueue.enqueue(new Interrput(FS_IRQ, new Array("write", encodeToHex(this.fileName), encodeToHex(fileText))));
        
        _OsShell.status = 'Saved ' + this.fileName;
    }
    
    function quit() {
        // reset systme to state previous to editing
        _Console.buffer = _Console.savedBuffer;
        _Console.savedBuffer = null;
        _OsShell.status = this.savedStatus;
        
        // turn editor off
        _Console.editMode = false;
        _OsShell.putPrompt();
    }
    
    function handleEnter() {
        if (_Console.buffer.CursorLineIndex > 0) {
            _Console.buffer.CursorLineIndex--;
        } else {
            _Console.buffer.addLine(new LineObject());
        }
    }
    
    function specialKeys(keyCode) {
        // Override what differs from the normal
        // shell.  Otherwise just let that
        // Object handle things
        switch(keyCode)
        {
            case 9: // tab
                // Only spaces are allowed... tabs are evil
                _StdIn.addText("    ");
            break;
            
            case 8:
                
            break;
            
            case 38: // up arrow
                // line index works backwards.  0 is bottom most.
                if (_StdIn.buffer.CursorLineIndex < _StdIn.buffer.length) {
                    _StdIn.buffer.CursorLineIndex++;
                    
                    // make sure cursor isn't off in the void
                    var inputLength = _StdIn.buffer.inputLine.size();
                    if (_StdOut.buffer.CursorXPosition > inputLength) {
                        _StdOut.buffer.CursorXPosition = inputLength;
                    }
                }
            break;
            
            case 40: // down arrow
                if (_StdIn.buffer.CursorLineIndex > 0) {
                    _StdIn.buffer.CursorLineIndex--;
                    
                    // make sure cursor isn't off in the void
                    var inputLength = _StdIn.buffer.inputLine.size();
                    if (_StdOut.buffer.CursorXPosition > inputLength) {
                        _StdOut.buffer.CursorXPosition = inputLength;
                    }
                }
            break;
            
            default:
                _OsShell.specialKeys(keyCode);
        }
    }
    
    function controlKeys(keyCode) { 
        switch (keyCode) {
            case 83: // ctrl + s
                this.save();
                break;
            case 81: // ctrl + q
                this.quit();
                break;
        }
    }
    
    return Editor;
})();