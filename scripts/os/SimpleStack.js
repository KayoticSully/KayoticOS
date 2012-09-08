/*
 |---------------------------------------------------------------------
 | Stack
 |---------------------------------------------------------------------
 | A wrapper for an Array object that acts like a traditional Stack
 |---------------------------------------------------------------------
 | Author(s): Ryan Sullivan
 |   Created: 9/7/2012
 |   Updated: 9/7/2012
 |---------------------------------------------------------------------
 */

//--------------------------------
// "Class" Definition
//--------------------------------
var SimpleStack = (function()
{
    //-----------------------------------------------------------------
    // Constructor | This function object is returned at the end
    //-----------------------------------------------------------------
    function SimpleStack()
    {
        // Private Variables
        var stack = new Array();
        
        // properties
        Object.defineProperty(this, 'size', {
            writeable       : false,
            enumerable      : false,
            get             : function() {
                return stack.length;
            }
        });
        
        // public functions
        this.push = function(obj)
        {
            stack.push(obj);
        }
        
        this.pop = function()
        {
            return stack.pop();
        }
        
        this.popAll = function()
        {
            // pops everything off the stack at once
            var old = stack.join('');
            
            // create fresh array to use as new stack
            stack = new Array();
            
            // return all "popped" elements incase they are wanted
            return old;
        }
        
        
        
    }
    
    return SimpleStack;
})();