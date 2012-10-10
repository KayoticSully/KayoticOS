Kayotic OS
==========
A JavaScript based operating system.


Topics
-------
*   [Constants](/KayoticSully/KayoticOS/blob/master/docs/constants.md)
*   [Host](/KayoticSully/KayoticOS/blob/master/docs/constants.md#Host)
*   [System Calls](/KayoticSully/KayoticOS/blob/master/docs/system_calls.md)
*   [Interrupts](/KayoticSully/KayoticOS/blob/master/docs/interrupts.md)

Change Log
----------
**[iProject2]**
*   I had some issues with the PCB.  I believe it is implemented correctly, but I hard coded
    most of its access since I know I am only dealing with one process.  I need to re-think
    this for iProject 3.
*   "Step" works, but is very dangerous.  If stepping is turned on, pressing step will tell the
    CPU to execute the next memory location no matter what.  I need to add a few checks in to to
    prevent this.  As of right now this is also a good way to test out the error screen.
