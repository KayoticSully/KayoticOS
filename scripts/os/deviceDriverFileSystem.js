/*
 |---------------------------------------------------------------------
 | deviceDriverFileSystem
 |---------------------------------------------------------------------
 | requires HDD.js
 |---------------------------------------------------------------------
 | Acts as the physical memory for the host VM
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 12/2/2012
 |   Updated: 12/2/2012
 |---------------------------------------------------------------------
 */

DeviceDriverFileSystem.prototype = new DeviceDriver;
var DeviceDriverFileSystem = (function(){
    
    function DeviceDriverFileSystem()
    {
        this.driverEntry = loadFileSystem;
        this.isr = fileSystemAction;
    }
    
    function loadFileSystem() {
        this.status = "Loaded";
    }
    
    function fileSystemAction(params) {
        var action = params[0];
        
        switch(action) {
            case "write":
                
        }
    }
    
    return DeviceDriverFileSystem;
})();