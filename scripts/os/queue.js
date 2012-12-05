/*
 |---------------------------------------------------------------------
 | Queue
 |---------------------------------------------------------------------
 | A simple Queue, which is really just a dressed-up Javascript Array.
 |  See the Javascript Array documentation at http://www.w3schools.com/jsref/jsref_obj_array.asp .
 |  Look at the push and shift methods, as they are the least obvious here.
 |---------------------------------------------------------------------
 | Author(s): Alan G. Labouseur, Ryan Sullivan
 |   Created: 8/?/2012
 |   Updated: 9/6/2012
 */
   
function Queue() {
    // Properties
    this.q = new Array();

    // Methods
    this.getSize  = function()
    {
        return this.q.length;    
    }

    this.isEmpty  = function()
    {
        return (this.q.length == 0);    
    }

    this.enqueue  = function(element)
    {
        this.q.push(element);
    }
    
    this.priorityEnqueue = function(element) // element MUST have a priority property
    {
        var inserted = false;
        for(var qElement in this.q) {
            if(element.priority < this.q[qElement].priority) {
                this.q.splice(qElement, 0, element);
                inserted = true;
                break;
            }
        }
        
        if(!inserted) {
            this.enqueue(element);
        }
    }
    
    this.dequeue  = function()
    {
        var retVal = null;
        if (this.q.length > 0)
        {
            retVal = this.q.shift();
        }
        return retVal;        
    }
    
    this.remove = function(obj)
    {
        var i = 0;
        var item = this.q[i];
        
        while(item != obj && i < this.q.length)
        {
            i++;
            item = this.q[i];
        }
        
        this.q.splice(i, 1);
    }
    
    this.toString = function()
    {
        retVal = "";
        for (i in this.q)
        {
            retVal += "[" + this.q[i] + "] ";
        }
        return retVal;
    }    
}
