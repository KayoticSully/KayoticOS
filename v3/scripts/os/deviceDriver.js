/*
 |---------------------------------------------------------------------
 | Device Driver
 |---------------------------------------------------------------------
 | The "base class" (or 'prototype') for all Device Drivers.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/12/2012
 */

function DeviceDriver()
{
    // Base Attributes
    this.version = "0.07";
    this.status = "unloaded";
    this.preemptable = false;
    // this.queue = new Queue();     // TODO: We will eventually want a queue for, well, queueing requests for this device to be handled by deferred proceedure calls (DPCs).

    // Base Method pointers.
    this.driverEntry = null;    // Initialization routine.  Should be called when the driver is loaded.
    this.isr = null;            // Interrupt Service Routine
    // TODO: this.dpc = null;   // Deferred Procedure Call routine - Start next queued operation on this device.
}
