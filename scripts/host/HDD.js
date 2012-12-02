/*
 |---------------------------------------------------------------------
 | HDD
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 | Acts as the physical memory for the host VM
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
        
        this.write = function(track, sector, block, value) {
            var storageId = this.getStorageId(track, sector, block);
            localStorage[storageId] = value;
        }
        
        this.read = function(track, sector, block) {
            var storageId = this.getStorageId(track, sector, block);
            return localStorage[storageId];
        }
    }
    
    return HDD;
})();

HDD.prototype.toString = function()
{
    var str = '';
    return str;
}

HDD.prototype.getStorageId = function(track, sector, block) {
    // we can pretend that this spins up the
    // drive and seeks to the track, sector, block
    return this.driveId.toString() +
           track.toString() +
           sector.toString() +
           block.toString();
}