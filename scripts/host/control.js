/*
 |---------------------------------------------------------------------
 | Control 
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
 | in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code that
 | hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
 | both the host and client environments.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | This (and other host/simulation scripts) is the only place that we should see "web" code, like 
 | DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)
 |  
 | This code references page numbers in the text book: 
 | Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */

//
// Control Services
//
function simInit()
{
	// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
	CANVAS  = document.getElementById('display');
	
	// Get a global reference to the drawing context.
	DRAWING_CONTEXT = CANVAS.getContext('2d');
	
	// Enable the added-in canvas text functions (see canvastext.js for provenance and details).
	CanvasTextFunctions.enable(DRAWING_CONTEXT);
	
	// Set focus on the start button.
	document.getElementById("btnStartOS").focus();     // TODO: This does not seem to work.  Why?
}

function simLog(msg, source)
{
    // Check the source.
    if (!source)
    {
        source = "?";
    }

    // Note the OS CLOCK.
    var clock = _OSclock;

    // Note the REAL clock in milliseconds since January 1, 1970.
    var now = new SystemDate(new Date().getTime());

    // Build the log string.
    var log = new Log(source, msg, clock, now);
    var logList = $('#taLog');
    
    // Update the log console.
    if(msg.toLowerCase() == 'idle' && log.last.toLowerCase() == 'idle')
	logList.find('.log_msg').first().replaceWith(log.toString());
    else
	logList.prepend(log.toString());

    // Optionally update a log database or some streaming service.
    // Not Yet
}


//
// Control Events
//
function simBtnStartOS_click(btn)
{
    if(!_POWER)
    {
	_POWER = true;
	// .. set focus on the OS console display ... 
	document.getElementById("display").focus();
	
	// ... Create and initialize the CPU ...
	_CPU = new cpu();
	_CPU.init();
	
	// Initialize System Clock Object
	_SystemClock = new SystemDate();
    
	// ... then set the clock pulse simulation to call ?????????.
	// I decided to "pulse" the CPU directly so the interval
	// is more like the pulse and it runs "through" the CPU
	//
	hardwareClockID = setInterval(_CPU.pulse, CPU_CLOCK_INTERVAL);
	
	// .. and call the OS Kernel Bootstrap routine.
	krnBootstrap();
    }
}

function simBtnHaltOS_click(btn)
{
    if(_POWER)
    {
	simLog("emergency halt", "host");
	simLog("Attempting Kernel shutdown.", "host");
	// Call the OS shutdown routine.
	krnShutdown();
	// Stop the JavaScript interval that's simulating our clock pulse.
	clearInterval(hardwareClockID);
	// TODO: Is there anything else we need to do here?
	_POWER = false;
    }
}

function simBtnReset_click(btn)
{
    // The easiest and most thorough way to do this is to reload (not refresh) the document.
    location.reload(true);  
    // That boolean parameter is the 'force get' flag. When it is true it causes the page to always
    // be reloaded from the server. If it is false or not specified, the browser may reload the 
    // page from its cache, which is not what we want.
}

//
// "Host Call" Functions
// Like system calls, just for the host
//
function programLoadContents()
{
   return $('#program_entry').val();
}