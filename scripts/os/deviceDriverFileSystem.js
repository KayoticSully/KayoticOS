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
            kind        : 0,
            tsb         : nil + nil + nil,
            format      : 0 + nil + nil + nil + nil,
        },
        
        DATA : {
            kind        : 1,
            mark        : 2, // I don't think I need this, but I will leave what I have implemented so far of it just in case
            baseTSB     : "777",
            growth      : -1,
            blockSize  : 123
        },
        
        STRUCTURE : {
            mark        : 5,
            baseTSB     : "001",
            growth      : 1,
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
                console.log(writeFile(params[1], params[2]));
                _StdOut.putLine("File " + params[1] + " successfully written.", true);
            break;
            
            case "read":
                var file = readFile(params[1]);
                _StdOut.putLine(decodeFromHex(file.data), true);
            break;
            
            case "create":
                console.log(createFile(params[1]));
                _StdOut.putLine("File " + params[1] + " successfully created.", true);
            break;
            
            case "delete":
                console.log(deleteFile(params[1]));
                _StdOut.putLine("File " + params[1] + " successfully deleted.", true);
            break;
            
            case "format":
                format();
                _StdOut.putLine("Format Complete!", true);
            break;
            
            case "list":
                var fileList = getFiles();
                
                for(file in fileList)
                    _StdOut.putLine("  " + fileList[file]);
                
                _StdOut.putLine("", true);
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
        else {
            var fileObject = new File(handle);
            fileObject.data = data;
            fileObject.save();
            return fileObject;
        }
    }
    
    function readFile(fileName) {
        var handle = getHandle(fileName);

        if(handle.kind != Type.FILE.kind)
            return null;
        else
            return new File(handle);
    }
    
    function getFiles(dirName) {
        var handle = new Handle();
        var tsb = BaseType.STRUCTURE.baseTSB;
        
        var files = new Array();
        while(handle.kind != BaseType.STRUCTURE.mark) {
            handle.parse(drive.read(tsb));
            
            if(handle.kind == Type.FILE.kind)
                files.push(handle.data);
            
            tsb = nextTSB(tsb, BaseType.STRUCTURE.growth);
        }
        
        return files;
    }
    
    function createFile(fileName) {
        // get free file handle
        var firstEmpty = getHandle();
        // make sure file does not already exist
        var handle = getHandle(fileName);
        
        if(handle.kind != BaseType.STRUCTURE.mark) {
            return null;// error file name already exists
        } else {
            // we have an empty file marker
            // lets try to allocate some space
            return allocateRecord(firstEmpty, fileName, Type.FILE);
        }
    }
    
    function deleteFile(fileName) {
        var handle = getHandle(fileName);
        
        if(handle.kind != Type.FILE.kind)
            return null;
        else
            return deleteChain(handle);
    }
    
    function createDir(dirName) {
        
    }
    
    function deleteDir(dirName) {
        
    }
    
    // TODO make private
    function format() {
        // set MBR
        drive.write("000", "MBR");        
        
        // set structure marker
        var defaultStructureMarker = BaseType.STRUCTURE.mark + BaseType.EMPTY.tsb + nil;
        drive.write(BaseType.STRUCTURE.baseTSB, defaultStructureMarker);
        
        var tsb = "002";
        while(tsb != undefined) {
            drive.write(tsb, BaseType.EMPTY.format);
            tsb = nextTSB(tsb, 1);
        }
    }
    
    //=======================================
    // Helper Functions
    //=======================================
    function getHandle(fileName) {
        
        var handle = new Handle();
        var tsb = BaseType.STRUCTURE.baseTSB;
        
        while(handle.kind != BaseType.STRUCTURE.mark) {
            handle.parse(drive.read(tsb));
            
            // if we are looking for an empty handle and found one return it
            if(fileName == undefined && handle.kind == BaseType.EMPTY.kind) {
                handle.tsb = tsb;
                return handle;
            }
            // if we are looking for a file and found it reutrn it
            else if(handle.kind != BaseType.EMPTY.kind && handle.data == fileName) {
                handle.tsb = tsb;
                return handle;
            }
            
            tsb = nextTSB(tsb, BaseType.STRUCTURE.growth);
        }
        
        // if we found no empty slots return the marker
        handle.tsb = nextTSB(tsb, -1 * BaseType.STRUCTURE.growth);
        return handle;
    }
    
    function allocateRecord(handle, data, type){
        
        // get next open handle slot if we are at a marker
        if(handle.kind == BaseType.STRUCTURE.mark || handle.kind == BaseType.DATA.mark) {
            var next = getNextEmptyRecord(handle.tsb, type.growth);
            
            if(next == undefined) {
                throw {
                    message : "Hard Drive Full"
                }
            }
            
            // copy marker down
            next.parse(handle.rawRecord);
            next.write();
        }
        
        
        // insert new data
        handle.kind = type.kind;
        handle.data = data;
        handle.chainTSB = nil + nil + nil;
        handle.write();
        return handle;
    }
    
    function getNextEmptyRecord(tsb, growth) {
        var handle = new Handle();
        
        while(handle.kind != BaseType.EMPTY.kind) {
            handle.parse(drive.read(tsb));
            handle.tsb = tsb;
            
            tsb = nextTSB(tsb, growth);
            
            if(tsb == undefined)
                return undefined;
        }
        
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
    
    function nextHandle(handle) {
        var next = new Handle(drive.read(handle.chainTSB));
        next.tsb = handle.chainTSB;
        return next;
    }
    
    function deleteChain(handle) {
        handle.kind = BaseType.EMPTY.kind;
        handle.write();
        
        if(handle.chainTSB == nil + nil+ nil)
            return null; // have to return something might find a use for this later
        else
            return deleteChain(nextHandle(handle));
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
        
        // properties
        this.data = null;
        
        // auto fetch file data
        if(handle.chainTSB != nil + nil + nil)
            this.data = chase(handle);
        
        Object.defineProperty(this, 'name', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return handle.data;
            }
        });
        
        this.save = function() {
            
            var toWrite = this.data;
            var lastHandle = handle;
            
            // while we have more than a block left to write
            while(toWrite.length > 0) {
                // grab the next block
                var block = toWrite.substr(0, BaseType.DATA.blockSize);
                // store the leftovers
                toWrite = toWrite.substr(BaseType.DATA.blockSize);
                
                // get an empty record for the data
                var blockHandle = null;
                if(lastHandle.chainTSB == nil + nil + nil)
                    blockHandle = getNextEmptyRecord(BaseType.DATA.baseTSB, BaseType.DATA.growth);
                else
                    blockHandle = nextHandle(lastHandle);
                
                // chain the last handle to this new one
                lastHandle.chainTSB = blockHandle.tsb;
                lastHandle.write();
                
                lastHandle = allocateRecord(blockHandle, block, BaseType.DATA);
            }
            
            // clean up if we had a longer file than we are writing
            if(lastHandle.chainTSB != nil + nil + nil)
                deleteChain(nextHandle(lastHandle));
            
            // make sure its the end
            lastHandle.chainTSB = nil + nil + nil;
            lastHandle.write();
        }
        
        // auto chain ftw!
        function chase(handle) {
            
            var chainHandle = nextHandle(handle);
            
            if(chainHandle.chainTSB == nil + nil + nil)
                return chainHandle.data;
            else
                return chainHandle.data + chase(chainHandle);
        }
    }
}

DeviceDriverFileSystem.prototype = new DeviceDriver;