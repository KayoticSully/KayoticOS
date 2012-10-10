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
        // init ram
        for(var i = 0; i < RAM_SIZE; i++)
            memory[i] = 0;
        
        var displayPageNumber = 0;
        Object.defineProperty(this, 'displayPage', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return parseInt(displayPageNumber);
            },
            set             : function(value) {
                displayPageNumber = value;
                this.display();
            }
        });
        
        
        this.get = function(PC)
        {
            if(PC >= 0 && PC < RAM_SIZE)
            {
                return memory[PC];
            }
            
            return null;
        }
        
        this.set = function(PC, value)
        {
            if(PC >= 0 && PC < RAM_SIZE)
            {
                memory[PC] = value;
            }
        }
        
        this.display = function()
        {
            $("#memory").html(this.toString());
        }
        
        this.display();
    }
    
    return RAM;
})();

RAM.prototype.toString = function()
{
    var str = '';
    
    var offset = PROGRAM_SIZE * this.displayPage;
    
    for(var group = offset; group < PROGRAM_SIZE * (this.displayPage + 1); group += 32)
    {
        str += '<div class="memCol">';
        
        for(var location = group; location < group + 32 && location < RAM_SIZE; location++)
        {
            var value = this.get(location);
            str += '<strong>$' + toPettyHex(location) + ":</strong>" + toPettyHex(value, 2) + "<br>";
        }
        
        str += '</div>';
    }
    
    str += '<div class="kosclearfix"></div>';
    return str;
}