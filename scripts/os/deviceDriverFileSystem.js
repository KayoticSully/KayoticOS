/*
 |---------------------------------------------------------------------
 | deviceDriverFileSystem (KFS)
 |---------------------------------------------------------------------
 | requires HDD.js
 |---------------------------------------------------------------------
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 12/2/2012
 |   Updated: 12/5/2012
 |---------------------------------------------------------------------
 */

var DeviceDriverFileSystem = function() {
    
    //=======================================
    // Private Variables
    //=======================================
    var drive = null;
    var directoryPath = new SimpleStack();
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
           // mark        : 2, // I don't think I need this, but I will leave what I have implemented so far of it just in case
            baseTSB     : "777",
            growth      : -1,
            blockSize  : 123
        },
        
        STRUCTURE : {
            mark        : 6,
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
        
        SYSTEM_FILE : extend( BaseType.STRUCTURE,
        {
            kind    : 2,
        }),
        
        DIRECTORY : extend(BaseType.STRUCTURE,
        {
            kind    : 4
        }),
        
        DIRECTORY_DATA : extend( BaseType.STRUCTURE,
        {
            kind    : 5
        })
    }
    
    //=======================================
    // Overriden From Device Driver
    //=======================================
    this.driverEntry = function() {
        this.status = "Loaded";
        drive = new HDD();
        
        var MBR = drive.read('000');
        if(MBR != 'MBR') {
            format();
        }
        
        // setup default (root) directory
        var handle = new Handle();
        handle.tsb = Type.DIRECTORY.baseTSB;
        handle.parse(drive.read(handle.tsb));
        
        var dir = new Directory(handle);
        directoryPath.push(dir);
    }
    
    this.isr = function(params) {
        
        var options = { printLine : false };
        
        switch (params[0]) {
            // Write to data to file
            case "write":
                options.mode = 'file';
                if(params.length > 3)
                    options = extend(params[3], options);
                    
                var message = "File " + decodeFromHex(params[1]) + " successfully written.";
                try {
                    console.log(writeFile(params[1], params[2], options));
                } catch (error) {
                    console.log(error);
                    message = error.message;
                }
                
                if(options.printLine)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", message, true)));
            break;
            
            // read data from file
            case "read":
                options.rollIn = false;
                options.mode = 'file';
                if(params.length > 2)
                    options = extend(params[2], options);
                    
                var message = null;
                var file = null;
                try {
                    file = readFile(params[1], options);
                } catch (error) {
                    message = error.message;
                }
                
                console.log(file);
                
                if(options.rollIn)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("rollIn", file.name, file.data)));
                else if(message != null)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", message, true)));
                else
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printHexLine", file.data, true)));
            break;
            
            // crate new file
            case "create":
                options.mode = 'file'; // type default
                
                if(params.length > 2)
                    options = extend(params[2], options);
                
                var message = '';
                
                try {
                    var result = null;
                    
                    if(options.mode == 'file' || options.mode == 'system_file') {
                        result = createFile(params[1], options.mode)
                        message = "File " + decodeFromHex(params[1]) + " successfully created.";
                    } else if(options.mode == 'directory') {
                        result = createDir(params[1]);
                        message = "Directory " + decodeFromHex(params[1]) + " successfully created.";
                    }
                    
                    console.log(result);
                } catch(error) {
                    message = error.message;
                }
                
                if(options.printLine)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", message, true)));
            break;
            
            // delete existing file
            case "delete":
                if(params.length > 2)
                    options = extend(params[2], options);
                
                var message = "File " + decodeFromHex(params[1]) + " successfully deleted.";
                try {
                    console.log(deleteFile(params[1]));
                } catch (error) {
                    message = error.message;
                }
                
                if(options.printLine)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", message, true)));
            break;
            
            // format the entire drive
            case "format":
                if(params.length > 1)
                    options = extend(params[1], options);
                
                format();
                
                // I cant think of any errors here, so when we want output it will always be Format Complete!
                if(options.printLine)
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "Format Complete!", true)));
            break;
            
            // list files from the drive
            case "list":
                var dir = directoryPath.peek();
                
                var fileList = dir.getFiles(params[1]);
                
                for(index in fileList) {
                    var file = fileList[index];
                    var fileName = decodeFromHex(file.data);
                    
                    if(file.kind == Type.DIRECTORY.kind) {
                        fileName = '/' + fileName;
                    }
                    
                    _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "  " + fileName, false)));
                }
                
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
            break;
            
            case 'open':
                var dir = directoryPath.peek();
                var toOpen = params[1];
                var handle = dir.getFile(toOpen)
                
                if(handle) {
                    var nextDir = new Directory(handle);
                    directoryPath.push(nextDir);
                } else {
                    throw { message : "Can't open directory" }
                }
                
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
            break;
            
            case 'close':
                if(directoryPath.size > 1) {
                    directoryPath.pop();
                }
                
                _KernelInterruptQueue.enqueue(new Interrput(KRN_IRQ, new Array("printLine", "", true)));
            break;
        }
    }
    
    this.currentPath = function() {
        var pathStr = '';
        var path = directoryPath.toArray();
        
        for(var index = 1; index < path.length; index++) {
            pathStr = pathStr + '/' + decodeFromHex(path[index].name);
        }
        
        return pathStr;
    }
    
    //========================================
    // Drive Operations
    //========================================
    function writeFile(fileName, data, options) {
        // get the correct file type
        var type = null;
        switch(options.mode) {
            case 'file' :
                type = Type.FILE;
            break;
            
            case 'system_file':
                type = Type.SYSTEM_FILE;
            break;
        }
        
        var dir = directoryPath.peek();
        var handle = dir.getFile(fileName);
        console.log(handle);
        if(!handle) {
            // if we didn't find the file
            throw { message : "File does not exist." }
        } else if(handle.kind == Type.FILE.kind) {
            var fileObject = new File(handle);
            fileObject.data = data;
            fileObject.save();
            return fileObject;
        } else {
            throw { message : "Can not write to that." }
        }
        
        // old code
        //var handle = getHandle(fileName);
        /*if(handle.kind != type.kind) {
            if(handle.kind == BaseType.STRUCTURE.mark)
                throw { message : "File does not exist." }
            else
                throw { message : "Can't write to that file." }
        }*/
    }
    
    function readFile(fileName, options) {
        console.log("read file " + fileName + " " + options);
        
        // get the correct file type
        var type = null;
        switch(options.mode) {
            case 'file' :
                type = Type.FILE;
            break;
            
            case 'system_file':
                type = Type.SYSTEM_FILE;
            break;
        }
        
        console.log(type);
        
        
        var dir = directoryPath.peek();
        var handle = dir.getFile(fileName);
        
        if(!handle) {
            throw { message : "File does not exist." }
        } else {
            return new File(handle); 
        }
        
        // old code
        //var handle = getHandle(fileName);
        /*
        if(handle.kind != type.kind) {
            if(handle.kind == BaseType.STRUCTURE.mark)
                throw { message : "File does not exist." }
            else
                throw { message : "Can't read that file." }
        }*/
        
    }
    
    function getFiles(options) {
        
        var opts = extend(options, {
            allFiles    :   false
        });
        
        var handle = new Handle();
        var tsb = BaseType.STRUCTURE.baseTSB;
        
        var files = new Array();
        while(handle.kind != BaseType.STRUCTURE.mark) {
            handle.parse(drive.read(tsb));
            
            if(handle.kind == Type.FILE.kind)
                files.push(handle.data);
            else if(opts.allFiles && handle.kind == Type.SYSTEM_FILE.kind)
                files.push('~' + handle.data);
            
            tsb = nextTSB(tsb, BaseType.STRUCTURE.growth);
        }
        
        return files;
    }
    
    function createFile(fileName, mode) {
        
        // get the correct file type
        var type = null;
        switch(mode) {
            case 'file' :
                type = Type.FILE;
            break;
            
            case 'system_file':
                type = Type.SYSTEM_FILE;
            break;
        }
        
        var dir = directoryPath.peek();
        
        // get free structure file handle
        var firstEmpty = getHandle();
        
        // make sure file does not already exist
        if(dir.hasFile(fileName)) {
            throw { message : "File already exists." }
        } else {
            // we have an empty file marker
            // lets try to allocate some space
            var handle = allocateRecord(firstEmpty, fileName, type);
            dir.addFile(handle);
            return handle;
        }
        
        // old code
        //var handle = getHandle(fileName);
        /*if(handle.kind != BaseType.STRUCTURE.mark) {
            if(handle.kind == Type.SYSTEM_FILE) {
                throw { message : "Can't overwrite system file." }
            } else {
                throw { message : "File already exists." }
            }
        } */
    }
    
    function deleteFile(fileName) {
        
        var dir = directoryPath.peek();
        var success = dir.deleteFile(fileName);
        
        if(!success) {
            throw { message : "File does not exist." }
        }
        
        return true;
        
        // old code
        //var handle = getHandle(fileName);
        /*if(handle.kind != Type.FILE.kind)
            if(handle.kind == BaseType.STRUCTURE.mark)
                throw { message : "File does not exist." }
            else if(handle.kind == Type.SYSTEM_FILE)
                throw { message : "Can't delete a system file." }
            else
                throw { message : "Can't delete that file." }
        else
            return deleteChain(handle);*/
    }
    
    // wishfull thinking
    function createDir(dirName) {
        var workingDir = directoryPath.peek();
        
        var firstEmpty = getHandle();
        
        // make sure directory name is okay and not taken
        if(workingDir.hasFile(dirName)) {
            throw { message : "File already exists." }
        } else {
            // allocate folder name record
            var handle = allocateRecord(firstEmpty, dirName, Type.DIRECTORY);
            
            var metaDataHandle = getHandle();
            metaDataHandle = allocateRecord(metaDataHandle, '', Type.DIRECTORY_DATA);
            
            handle.chainTSB = metaDataHandle.tsb;
            handle.write();
            
            workingDir.addFile(handle);
            return handle;
        }
    }
    
    // wishfull thinking
    function deleteDir(dirName) {
        // forgot about this...  oops.
    }
    
    function format() {
        // set MBR
        drive.write("000", "MBR");        
        
        // create root directory
        var rootDir = Type.DIRECTORY_DATA.kind + BaseType.EMPTY.tsb + nil;
        drive.write(Type.DIRECTORY.baseTSB, rootDir);
        
        // set structure marker
        var defaultStructureMarker = BaseType.STRUCTURE.mark + BaseType.EMPTY.tsb + nil;
        drive.write("002", defaultStructureMarker);
        
        var tsb = "003";
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
        
        // Traverse the file structure looking for either the file
        // requested, or the first empty/free record depending on
        // if a filename was provided
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
        if(handle.kind == BaseType.STRUCTURE.mark) { // || handle.kind == BaseType.DATA.mark) {
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
        
        console.log("allocate " + handle.data);
        
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
                console.log('block ' + block);
                
                // store the leftovers
                toWrite = toWrite.substr(BaseType.DATA.blockSize);
                console.log('left ' + toWrite);
                
                // get an empty record for the data
                var blockHandle = null;
                if(lastHandle.chainTSB == nil + nil + nil) {
                    blockHandle = getNextEmptyRecord(BaseType.DATA.baseTSB, BaseType.DATA.growth);
                    blockHandle = allocateRecord(blockHandle, block, BaseType.DATA);
                } else {
                    blockHandle = nextHandle(lastHandle);
                    blockHandle.data = block;
                    blockHandle.write();
                }
                
                // chain the last handle to this new one
                lastHandle.chainTSB = blockHandle.tsb;
                lastHandle.write();
                
                lastHandle = blockHandle;
            }
            
            // clean up if we had a longer file than we are writing
            if(lastHandle.chainTSB != nil + nil + nil)
                deleteChain(nextHandle(lastHandle));
            
            // make sure its the end
            lastHandle.chainTSB = nil + nil + nil;
            lastHandle.write();
        }
    }
    
    var Directory = function(handle){
        var _metaDataHandle = null;
        var _metaData = '';
        var _name     = '';
        
        // figure out where to put the initial
        // handle data
        if(handle.kind == Type.DIRECTORY_DATA.kind) {
            _metaDataHandle = handle;
        } else if(handle.kind == Type.DIRECTORY.kind) {
            _name = handle.data;
            _metaDataHandle = nextHandle(handle);
        }
        
        // get all meta data split out across different
        // records
        _metaData = _metaDataHandle.data;
        
        // get all blocks if there is more than one
        if(_metaDataHandle.chainTSB != nil + nil + nil) {
            _metaData += chase(handle);
        }
        
        Object.defineProperty(this, 'name', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return _name;
            }
        });
        
        this.save = function() {
            // write out dir name
            if(handle.kind == Type.DIRECTORY.kind) {
                handle.data = _name;
                handle.write();
            }
            
            // write out dir contents
            _metaDataHandle.data = _metaData;
            _metaDataHandle.write();
        }
        
        this.getFiles = function(options) {
            // an array of file/directory handles within
            // this directory
            var files = new Array();
            for(var i = 0; i <= _metaData.length - 3; i = i + 3) {
                var handle = new Handle();
                var tsb = _metaData.substr(i, 3);
                
                handle.tsb = tsb;
                handle.parse(drive.read(tsb));
                files.push(handle);
            }
            
            return files;
        }
        
        this.addFile = function(handle) {
            _metaData += handle.tsb;
            this.save();
        }
        
        this.getFile = function(fileName) {
            var files = this.getFiles();
            
            for(index in files) {
                var file = files[index];
                if(file.data == fileName)
                {
                    return file;
                }
            }
            
            return false;
        }
        
        this.deleteFile = function(fileName) {
            var files = this.getFiles();
            var deleted = false;
            
            _metaData = '';
            for(index in files) {
                var file = files[index];
                
                if(file.data == fileName)
                {
                    // delete file and DO NOT add it's tsb
                    // to metaData
                    deleteChain(file);
                    deleted = true;
                } else {
                    // add any other file to metaData to keep it
                    _metaData += file.tsb;
                }
            }
            
            this.save();
            return deleted;
        }
        
        this.hasFile = function(fileName) {
            var files = this.getFiles();
            
            for(file in files) {
                if(files[file].data == fileName)
                {
                    return true;
                }
            }
            
            return false;
        }
    }
    
    Directory.prototype.toString = function() {
        return this.name;
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

DeviceDriverFileSystem.prototype = new DeviceDriver;