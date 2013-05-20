Sully's 6502 Extended OPCode Set
=================================
These are the implemented OPCodes for Kayotic OS.  It is based off of the full 6502 instruction set, but is by no means complete.  I did my best to represent the proper processor states, but some things had to be changed for the sake of simplicity.

OP Codes
--------
__Listed In-Order as defined in OPCodes.js__

__BRK__ - System call to stop program execution  
__Flags Affected:__ I  
> __00__ : Implied Addressing  

__LDA__ - Load Accumulator with value.  
__Flags Affected:__ S, Z  
> __A9 XX__ : Immediate Addressing  
> __AD XX XX__ : Absolute Addressing

