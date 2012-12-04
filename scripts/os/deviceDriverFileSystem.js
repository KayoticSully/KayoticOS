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
                console.log(readFile(params[1]));
            break;
            
            case "create":
                createFile(params[1]);
            break;
        }
    }
    
    //========================================
    // Drive Operations
    //========================================
    function writeFile(fileName, data) {
        var handle = getHandle(fileName);
        
        // if we didn't find the file
        if(handle.kind != Type.FILE.kind)
            return null;
        else
            return null; // write data
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
        // get free file handle
        var handle = getHandle(fileName);
        
        if(handle.kind != BaseType.STRUCTURE.mark) {
            // error file name already exists
        } else {
            // we have an empty file marker
            // lets try to allocate some space
            allocateRecord(handle, fileName, Type.FILE);
        }
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
    
    function allocateRecord(handle, data, type){
        // get next open handle slot
        var next = getNextEmptyRecord(handle.tsb, type.growth);
        
        if(next == undefined) {
            throw {
                message : "Hard Drive Full"
            }
        }
        
        // copy marker down
        next.parse(handle.rawRecord);
        next.write();
        
        // insert new data ending wil nil
        handle.kind = type.kind;
        handle.data = data;
        handle.write();
    }
    
    function getNextEmptyRecord(tsb, growth) {
        var handle = new Handle();
        
        while(handle.kind != BaseType.EMPTY.kind) {
            handle.parse(drive.read(tsb));
            tsb = nextTSB(tsb, growth);
            
            if(tsb == undefined)
                return undefined;
        }
        
        handle.tsb = nextTSB(tsb, -1*growth);
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
        
        // NO NEGATIVE NUMBERS
        if(baseTen < 0)
            return undefined;
        
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
    var Handle = function(raw) {
        
        var _kind = null;
        var _chainTSB = null;
        var _data = null;
        var _tsb = null;
        
        Object.defineProperty(this, 'kind', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return _kind;
            },
            set             : function(value) {
                _kind = value;
            }
        });
        
        Object.defineProperty(this, 'chainTSB', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return _chainTSB;
            },
            set             : function(value) {
                _chainTSB = value;
            }
        });
        
        Object.defineProperty(this, 'data', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return _data;
            },
            set             : function(value) {
                _data = value;
            }
        });
        
        Object.defineProperty(this, 'tsb', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return _tsb;
            },
            set             : function(value) {
                _tsb = value;
            }
        });
        
        Object.defineProperty(this, 'rawRecord', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _kind + _chainTSB + _data + nil;
            }
        });
        
        this.parse = function(raw) {
            _kind = raw[0];
            _chainTSB = raw.substring(1, 4);
            _data = raw.substring(4, raw.indexOf(nil, 4));
        }
        
        this.write = function() {
            drive.write(_tsb, this.rawRecord);
        }
        
        if(raw != undefined)
        {
            this.parse(raw);
        }
    }
    
    Handle.prototype.toString = function() {
        return this.tsb + " => [ " + this.kind + ", " + this.chainTSB + ", " + this.data + " ]";
    }
    
    var File = function(handle) {
        
        Object.defineProperty(this, 'name', {
            writeable       : true,
            enumerable      : false,
            get             : function() {
                return handle.data;
            }
        });
        
        if(handle.chainTSB == nil + nil + nil)
            this.data = null;
        else
            this.data = chase(handle.chainTSB);
        
        // auto chain ftw!
        function chase(tsb) {
            var raw = drive.read(tsb);
            
            var chainHandle = new Handle(raw);
            chainHandle.tsb = tsb;
            
            if(chainHandle.chainTSB == nil + nil + nil)
                return chainHandle.data;
            else
                return chainHandle.data + chase(chainHandle.chainTSB);
        }
    }
}

DeviceDriverFileSystem.prototype = new DeviceDriver;