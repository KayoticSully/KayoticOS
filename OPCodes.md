Sully's 6502 Expanded OPCode Set
=================================
These are the implemented OPCodes for Kayotic OS.  It is based off of the full 6502 instruction set, but is by no means complete.  I did my best to represent the proper processor states, but some things had to be changed for the sake of simplicity.

OP Codes
--------
__Listed In-Order as defined in OPCodes.js__

__BRK__ - System call to stop program execution.  
__Flags Affected:__ I  
> __00__ : Implied Addressing  


__LDA__ - Load Accumulator with value.  
__Flags Affected:__ S, Z  
> __A9 XX__ : Immediate Addressing  
> __AD XX XX__ : Absolute Addressing  

__STA__ - Store Accumulator to Memory.  
__Flags Affected:__ None  
> __8D XX XX__ : Absolute Addressing  


__ADC__ - Add with carry  
__Flags Affected:__ S, Z, C, V  
> __69 XX__ : Immediate Addressing  
> __6D XX XX__ : Absolute Addressing


__SBC__ - Subtract with Carry / Borrow  
__Flags Affected:__ S, Z, C, V  
> __E9 XX__ : Immediate Addressing  
> __ED XX XX__ : Absolute Addressing


__LDX__ - Load X  
__Flags Affected:__ S, Z
> __A2 XX__ : Immediate Addressing  
> __AE XX XX__ : Absolute Addressing  


__STX__ - Store X  
__Flags Affected:__ None  
> __8E XX XX__ : Absolute Addressing  


__DEX__ - Decrement X  
__Flags Affected:__ S, Z  
> __CA__ : Implied Addressing  


__INX__ - Increment X  
__Flags Affected:__ S, Z  
> __8E__ : Implied Addressing  


__TAX__ - Transfer Accumulator to X  
__Flags Affected:__ S, Z  
> __AA__ : Implied Addressing


__TXA__ - Transfer X to Accumulator  
__Flags Affected:__ S, Z  
> __8A__ : Implied Addressing  


__LDY__ - Load Y  
__Flags Affected:__ S, Z
> __A0 XX__ : Immediate Addressing  
> __AC XX XX__ : Absolute Addressing  


__STY__ - Store Y  
__Flags Affected:__ None  
> __8C XX XX__ : Absolute Addressing  


__DEY__ - Decrement Y  
__Flags Affected:__ S, Z  
> __88__ : Implied Addressing  


__INY__ - Increment Y  
__Flags Affected:__ S, Z  
> __C8__ : Implied Addressing


__TAY__ - Transfer Accumulator to Y  
__Flags Affected:__ S, Z  
> __BA__ : Implied Addressing


__TYA__ - Transfer Y to Accumulator  
__Flags Affected:__ S, Z  
> __98__ : Implied Addressing  


__NOP__ - No Operation  
__Flags Affected:__ None  
> __EA__ : Implied Addressing  


__CPX__ - Compare X to Value  
__Flags Affected:__ S, Z, C
> __E0 XX__ : Immediate Addressing  
> __EC XX XX__ : Absolute Addressing  


__CPY__ - Compare Y to Value  
__Flags Affected:__ S, Z, C
> __C0 XX__ : Immediate Addressing  
> __CC XX XX__ : Absolute Addressing  


__INC__ - Increment Memory Location  
__Flags Affected:__ S, Z  
> __EE XX XX__ : Absolute Addressing


__DEC__ - Decrement Memory Location  
__Flags Affected:__ S, Z  
> __CE XX XX__ : Absolute Addressing  


__BNE__ - Branch by XX bytes if Z == 0  
__Flags Affected:__ None  
> __D0 XX__ : Immediate Addressing  


__BEQ__ - Branch by XX bytes if Z == 1  
__Flags Affected:__ None  
> __F0 XX__ : Immediate Addressing  


__BPL__ - Branch by XX bytes if S == 0  
__Flags Affected:__ None  
> __10 XX__ : Immediate Addressing  


__BMI__ - Branch by XX bytes if S == 1  
__Flags Affected:__ None  
> __30 XX__ : Immediate Addressing


__JMP__ - Jump to Memory Location  
__Flags Affected:__ None  
> __4C XX XX__ : Absolute Addressing  


__CMP__ - Compare Accumulator to Value  
__Flags Affected:__ S, Z, C  
> __C9 XX__ : Immediate Addressing  
> __CD XX XX__ : Absolute Addressing  


__SYS__ - System Call
__Flags Affected:__ None but maybe I should be?
> __FF__ : Implied Addressing