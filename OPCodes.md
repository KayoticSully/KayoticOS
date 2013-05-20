Sully's 6502 Extended OPCode Set
=================================
These are the implemented OPCodes for Kayotic OS.  It is based off of the full 6502 instruction set, but is by no means complete.  I did my best to represent the proper processor states, but some things had to be changed for the sake of simplicity.

OP Codes
--------
**Listed In-Order as defined in OPCodes.js**

### BRK
System call to stop program execution

__00__ : Implied Addressing


### LDA
Load Accumulator with value

__A9 XX__ : Immediate Addressing

__AD XX XX__ : Absolute Addressing
