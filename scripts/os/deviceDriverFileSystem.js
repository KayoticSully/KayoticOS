/*
 |---------------------------------------------------------------------
 | deviceDriverFileSystem (KFS)
 |---------------------------------------------------------------------
 | requires HDD.js
 |---------------------------------------------------------------------
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 12/2/2012
 |   Updated: 12/2/2012
 |---------------------------------------------------------------------
 */

var DeviceDriverFileSystem = function() {
    
    //=======================================
    // Private Variables
    //=======================================
    var drive = null;
    var nil = "`";
    
    // Base Data Types
    var BaseType = {
        EMPTY : {
            kind    : 0,
            tsb     : nil + nil + nil,
            format  : 0 + nil + nil + nil + nil,
        },
        
        DATA : {
            kind    : 1,
            mark    : 2,
            baseTSB : "777",
            growth  : -1,
        },
        
        STRUCTURE : {
            mark    : 5,
            baseTSB : "001",
            growth  : 1,
        },
    }
    
    // DataTypes
    var Type = {
        FILE : extend( BaseType.STRUCTURE,
        {
            kind    : 3,
        }),
        
        DIRECTORY : extend( BaseType.STRUCTURE,
        {
            kind    : 4,
        })
    }
    
    //=======================================
    // Overriden From Device Driver
    //=======================================
    this.driverEntry = function() {
        this.status = "Loaded";
        drive = new HDD();
    }
    
    this.isr = function(params) {
        switch (params[0]) {
            case "write":
                writeFile(params[1], params[2]);
            break;
            
            case "read":
                return readFile(params[1]);
            break;
        
            case "test":
                getHandle(Types.FILE);
            break;
        }
    }
    
    //========================================
    // Drive Operations
    //========================================
    function writeFile(fileName, data) {
        diskDrives[loadedDrive].write(0,0,0, data);
    }
    
    function readFile(fileName) {
        var handle = getHandle(fileName);
        if(handle.kind != Type.FILE.kind)
            return null;
        else
            return new File(handle);
    }
    
    function listFiles(dirName) {
        
    }
    
    function createFile(fileName) {
        var fileHandle = getHandle(Type.FILE);
    }
    
    function deleteFile(fileName) {
        
    }
    
    function createDir(dirName) {
        
    }
    
    function deleteDir(dirName) {
        
    }
    
    // TODO make private
    this.format = function() {
        // set MBR
        drive.write("000", "MBR");        
        
        // set structure marker
        var defaultStructureMarker = BaseType.STRUCTURE.mark + BaseType.EMPTY.tsb + nil;
        drive.write(BaseType.STRUCTURE.baseTSB, defaultStructureMarker);
        
        var tsb = "002";
        while(tsb != "777") {
            drive.write(tsb, BaseType.EMPTY.format);
            tsb = nextTSB(tsb, 1);
        }
        
        var defaultDataMarker = BaseType.DATA.mark + BaseType.EMPTY.tsb + nil;
        drive.write(BaseType.DATA.baseTSB, defaultDataMarker);
    }
    
    //=======================================
    // Helper Functions
    //=======================================
    function getHandle(fileName) {
        
        var handle = new Handle();
        var tsb = BaseType.STRUCTURE.baseTSB;
        
        while(handle.kind != BaseType.STRUCTURE.mark && handle.data != fileName) {
            handle.parse(drive.read(tsb));
            tsb = nextTSB(tsb, BaseType.STRUCTURE.growth);
        }
        
        // go back to last tsb since we overshot it
        handle.tsb = nextTSB(tsb, -1 * BaseType.STRUCTURE.growth);
        return handle;
    }
    
    // this function enables awesomesauce
    function extend(object1, object2) {
        for(var attr in object1)
        {
            object2[attr] = object1[attr];
        }
        
        return object2;
    }
    
    function nextTSB(tsb, growth){
        var baseTen = parseInt(tsb, 8);
        baseTen += growth;
        
        var newTSB = baseTen.toString(8);
        
        // enforce leading zeros
        if(newTSB.length == 1)
            newTSB = "00" + newTSB;
        else if(newTSB.length == 2)
            newTSB = "0" + newTSB;
        else if(newTSB.length > 3)
            newTSB = undefined;
        
        return newTSB;
    }
    
    
    
    //======================================
    // Helper Objects
    //======================================
    // TODO only out here for testing, will pull into private scope later
    var Handle = function() {
        
        var _kind = null;
        var _chainTSB = null;
        var _data = null;
        var _tsb = null;
        
        Object.defineProperty(this, 'kind', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _kind;
            }
        });
        
        Object.defineProperty(this, 'chainTSB', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _chainTSB;
            }
        });
        
        Object.defineProperty(this, 'data', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _data;
            }
        });
        
        Object.defineProperty(this, 'tsb', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                if(isNaN(_tsb))
                    return null;
                else
                    return _tsb;
            },
            set             : function(value) {
                _tsb = value;
            }
        });
        
        
        this.parse = function(raw) {
            _kind = raw[0];
            _chainTSB = raw.substring(1, 4);
            _data = raw.substring(4, raw.indexOf(nil));
        }
        
    }
    
    var File = function(handle) {
        
        Object.defineProperty(this, 'name', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return handle.data;
            }
        });
        
        this.data = chase(handle.chainTSB);
        
        function chase(tsb) {
            var chainHandle = new Handle(drive.read(tsb));
            
            if(chainHandle.chainTSB == null)
                return chainHandle.data;
            else
                return chainHandle.data + chase(chainHandle.chainTSB);
            
        }
    }
}

DeviceDriverFileSystem.prototype = new DeviceDriver;