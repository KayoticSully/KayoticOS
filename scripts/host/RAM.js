/*
 |---------------------------------------------------------------------
 | RAM
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Acts as the physical memory for the host VM
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 10/3/2012
 |   Updated: 10/3/2012
 |---------------------------------------------------------------------
 */

var RAM = (function(){
    
    var memory = new Array();
    
    function RAM()
    {
        this.get = function(PC)
        {
            return memory[PC];
        }
        
        this.set = function(PC, value)
        {
            memory[PC] = value;
        }
    }
    
    return RAM;
})();