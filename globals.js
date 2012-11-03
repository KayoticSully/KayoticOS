/*
 |---------------------------------------------------------------------
 | Globals 
 |---------------------------------------------------------------------
 | Global CONSTANTS and _Variables.
 | (Global over both the OS and Hardware Simulation.)
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 |---------------------------------------------------------------------
 | This code references page numbers in the text book: 
 | Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
 */

//------------------
// Global Constants
//------------------
var APP_NAME = "KayoticOS";  // Because I name everything using Kayotic
var APP_VERSION = "0.2.0"

var CPU_CLOCK_INTERVAL = 1;   // in ms, or milliseconds, so 1000 = 1 second.
var CPU_TIMER_RATE = 10; // every X number of intervals
var CPU_IDLE_MESSAGE_RATE = 100; // every X number of intervals

// IRQs
var TIMER_IRQ    = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                       // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var SYSTEMCALL_IRQ = 2;
var HOST_IRQ = 3;
var PROGRAM_IRQ = 4;
var EUTHANIZE_IRQ = 24;
var BADOP_IRQ = 25;

var PROGRAM_SIZE  = 256;
var PROGRAMS_ALLOWED = 3;
var RAM_SIZE  = PROGRAM_SIZE * PROGRAMS_ALLOWED;

var DEVLOG = true;

var STEP_TOGGLE = false;

//------------------
// Global Variables
//------------------
var _POWER = false;      // Just so the interface knows when the OS is on or off
var _CPU = null;
var _RAM = null;
var _Memory = null;
var _SystemClock = null; // Controls System Date Time
var _OSclock = 0;        // Page 23.
var _Mode = 0;           // 0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Trace = true;       // Default the OS trace to be on.
var _JobQ = null;        // PCB Job QUEUE
var _ReadyQ = null;        // PCB Job QUEUE

//
// Canvas Variables
//
// TODO: Fix the naming convention for these next N global vars.
// Will get to that before next project is finished
var CANVAS = null;              // Initialized in hostInit().
var DRAWING_CONTEXT = null;     // Initialized in hostInit().
var DEFAULT_FONT = "sans";      // Ignored, just a place-holder in this version.
var DEFAULT_FONT_COLOR = "#3F0";
var DEFAULT_FONT_SIZE = 13;     
var FONT_HEIGHT_MARGIN = 7;     // Additional space added to font size when advancing a line.
var TASKBAR_HEIGHT = 25;
var TASKBAR_LEFT_MARGIN = 10;
var DEFAULT_TASKBAR_COLOR = "#ffffff";
var CONSOLE_LEFT_MARGIN = 1;
var CONSOLE_TOP_MARGIN = 3;

//
// OS queues
//
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

//
// Standard input and output
//
// TODO: Use these properly instead of using _Console
var _StdIn  = null;
var _StdOut = null;

//
// UI
//
var _Console = null;
var _OsShell = null;


// At least this OS is not trying to kill you. (Yet.)
// Not if I can help it
var _SarcasticMode = false;

//
// Global Device Driver Objects - page 12
//
var krnKeyboardDriver = null;
