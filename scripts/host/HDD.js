/*
 |---------------------------------------------------------------------
 | HDD
 |---------------------------------------------------------------------
 | Requires global.js
 |---------------------------------------------------------------------
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 12/2/2012
 |   Updated: 12/4/2012
 |---------------------------------------------------------------------
 */

var HDD = (function(){
    
    var driveCount = 0;
    
    // HDD Display Monitor
    function displayHDD() {
        var table = '<table class="table table-condensed table-hover">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>' +
                                'Location' +
                            '</th>' +
                            '<th>' +
                                'Data'
                            '</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>';
        
        for(var i = 0; i < 512; i++) {
            var location = i.toString(8);
            
            // enforce leading zeros
            if(location.length == 1) {
                location = "00" + location;
            } else if(location.length == 2) {
                location = "0" + location;
            }
            
            table +=    '<tr>' +
                            '<th>' + location + '</th>' +
                            '<td>' + localStorage['0' + location] + '</td>' +
                        '</tr>';
        }
        
        table += '</tbody></table>';
        $('#HDDisplay').html(table);
    }
    
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
            displayHDD();
        }
        
        this.read = function(tsb) {
            var storageId = this.driveId + tsb;
            return localStorage[storageId];
        }
        
        displayHDD();
    }
    
    return HDD;
})();