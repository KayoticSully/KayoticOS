/*
 |---------------------------------------------------------------------
 | HDD
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 12/2/2012
 |   Updated: 12/2/2012
 |---------------------------------------------------------------------
 */

var HDD = (function(){
    
    var driveCount = 0;
    
    function HDD()
    {
        // Drive Identifier
        var _driveId = driveCount++;
        
        // Getter for Drive Identifier
        Object.defineProperty(this, 'driveId', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _driveId;
            }
        });
        
        this.write = function(tsb, value) {
            var storageId = this.driveId + tsb;
            localStorage[storageId] = value;
        }
        
        this.read = function(tsb) {
            var storageId = this.driveId + tsb;
            return localStorage[storageId];;
        }
    }
    
    return HDD;
})();