Kayotic OS
==========
A JavaScript based operating system.


Topics (Table of Contents): Not updated at all since last time :(
-------
*   [Constants](/KayoticSully/KayoticOS/blob/master/docs/constants.md)
*   [Host](/KayoticSully/KayoticOS/blob/master/docs/constants.md#Host)
*   [System Calls](/KayoticSully/KayoticOS/blob/master/docs/system_calls.md)
*   [Interrupts](/KayoticSully/KayoticOS/blob/master/docs/interrupts.md)

Notes
-------
**[iProject2]**
*   I had some issues with the PCB.  I believe it is implemented correctly, but I hard coded
    most of its access since I know I am only dealing with one process.  I need to re-think
    this for iProject 3.
*   I hard coded run <num> to always start at location $000 for now, so the program can be run
    multiple times.  This will of course change for iProject3.
*   "Step" works, but is very dangerous.  If stepping is turned on, pressing step will tell the
    CPU to execute the next memory location no matter what.  I need to add a few checks in to to
    prevent this.  As of right now this is also a good way to test out the error screen.
*   Right now the system call to print out a "00" delimited string pulls the string from memory
    and prints it within the one cycle of the ISR.  I'm not sure if this is "correct".
*   Also open up the JavaScript console during program execution to see the dev-log :)