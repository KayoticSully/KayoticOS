/*
 |---------------------------------------------------------------------
 | Devices
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Routines for the simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
 | in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
 | that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 | JavaScript in both the host and client environments.
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

var hardwareClockID = -1;

//
// Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in text book.)
//
function simEnableKeyboardInterrupt()
{
   // Listen for key presses (keydown, actually) in the document 
   // and call the simulation processor, which will in turn call the 
   // os interrupt handler.
   document.addEventListener("keydown", simOnKeypress, false);
}

function simEnableMouseInterrupt()
{
   CANVAS.addEventListener('mousewheel', simOnMouseScoll, false);
   CANVAS.addEventListener('DOMMouseScroll',simOnMouseScoll, false);
}

function simDisableKeyboardInterrupt()
{
   document.removeEventListener("keydown", simOnKeypress, false);
}

function simDisableMouseInterrupt() {
   CANVAS.removeEventListener('mousewheel', simOnMouseScoll, false);
   CANVAS.removeEventListener('DOMMouseScroll',simOnMouseScoll, false);
}

function simOnKeypress(event)
{
   // The canvas element CAN receive focus if you give it a tab index. 
   // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
   if (event.target.id == "display")
   {
      event.preventDefault();
      
      // Note the pressed key code in the params (Mozilla-specific).
      var params = new Array(event.which, event.shiftKey);
      
      // Enqueue this interrupt on the kernal interrupt queue so that it gets to the Interrupt handler.
      _KernelInterruptQueue.enqueue( new Interrput(KEYBOARD_IRQ, params) );
   }
}

function simOnMouseScoll(event)
{
   // multi-browser support
   var delta = event.wheelDelta;
   if (!delta) {
      delta = event.details;
   }
   
   // Enqueue this interrupt on the kernal interrupt queue so that it gets to the Interrupt handler.
   _KernelInterruptQueue.enqueue( new Interrput(MOUSE_IRQ, delta) );
}

function hostErrorResponse()
{
   // Could probably call this in a better way than
   // just directly from the kernel.  Not sure how
   // the best way would be.
   html = '<audio controls="controls" height="100" width="100" autoplay="autoplay" >' +
                '<source src="media/The_Device_Has_Been_Modified.mp3" type="audio/mp3" />' +
                '<embed height="100" width="100" src="media/The_Device_Has_Been_Modified.mp3" autoplay="true" />' +
            '</audio>';
   $('html').append(html);
   
   $('#display').addClass('error');
}