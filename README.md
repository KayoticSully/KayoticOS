Kayotic OS
==========
A JavaScript based operating system.


Topics (Table of Contents): Not updated at all since last time :(
-------
*   [Constants](/KayoticSully/KayoticOS/blob/master/docs/constants.md)
*   [Host](/KayoticSully/KayoticOS/blob/master/docs/constants.md#Host)
*   [System Calls](/KayoticSully/KayoticOS/blob/master/docs/system_calls.md)
*   [Interrupts](/KayoticSully/KayoticOS/blob/master/docs/interrupts.md)

Notes
-------
**[FinalProject]**
*   I have had no issued while running 4 programs.  However I can't understand why I do run into issues (only sometimes)
    while running more than 4 programs.  Theoretically I should be able to swap out multiple programs and it does work, just
    not in all cases.
*   My swapped out processes are stored in *system files* and are not readable or writeable by the user commands.  They are
    also normally hidden when listing files, but the option "all" will force system files to be shown. (Ex: ls all)
*   I added a view of the Resident Queue to my Interface, so you can see all loaded programs and their PCB's at once.
*   My file system works a little differently than we discussed in class.  My "directory structure" grows down from the top
    and my file data grows up from the bottom.  I also don't have a hard set "partition" for structure data, I set a floating partition
    marker that moves down as the filesystem needs more space for structure data.  Free space within this partition will be re-used before
    growing the partition.
*   My entire filesystem API is interrupt based.  I was toying with the idea of splitting out a seperate I/O Interrupt queue, but
    never had the time to try and implement that.
*   Speaking of things I did not have time to implement...  I figured out how I would write a full directory system (thus why I set
    my HDD records up the way I did) but am very sad to say I did not have time to actually implement it.  I also had a bunch of
    ideas for other record types such as trashed files so data can be recovered.

**[iProject3]**
*   Three programs can be loaded into memory... the only problem is more than 3 can be loaded.
    I did not go through the trouble of preventing a 4th program loading, since I would just
    have to remove that for the final project.  If a 4th - nth program is loaded the system executes
    program in memory location $0000, but it does update the correct PCB's status.
*   I pulled my DevLog into the System logs (it replaces the generic CPU Cycle message) and color coded
    things a little bit.  The DevLog still prints out in the JavaScript console though, I personally find
    it easier to read.
*   In general I am using Interrupts a lot more.  I moved a few Kernel function calls (like loading programs)
    over to Interrupt messages. To me it feels more correct that way.  I also use Interrupts exclusively for all
    process management now.
*   I added a "Reboot" button to the action bar.  This is a soft-reset vs "Reset" which I kept as a hard-reset.
    I also modified the shutdown command in the Shell.  It still shuts down the sysem properly but you can use
    the flag '-r' to reboot instead.  Ex: shutdown -r
*   The run command has been modified rather than creating a new runAll command.  You can specify the programs to run as
    parameters such as `run 0 1 2` or `run 1 0`.  The command `run all` can be used to run everything that is loaded in memory.
*   Lastly... I am not sure how you wanted the commands that deal with running processes to work (kill, processes, etc.).
    If a processes is printing output it is very confusing to type out a command, and the response back isn't always displayed if
    a process' output overwrites the command's output (or vice a versa).  I left it as that since I did not really have time
    to do anything clever to improve the user's experience.  Just making that note here...

**[iProject2]**
*   I had some issues with the PCB.  I believe it is implemented correctly, but I hard coded
    most of its access since I know I am only dealing with one process.  I need to re-think
    this for iProject 3.
*   I hard coded run <num> to always start at location $000 for now, so the program can be run
    multiple times.  This will of course change for iProject3.
*   "Step" works, but is very dangerous.  If stepping is turned on, pressing step will tell the
    CPU to execute the next memory location no matter what.  I need to add a few checks in to to
    prevent this.  As of right now this is also a good way to test out the error screen.
*   Right now the system call to print out a "00" delimited string pulls the string from memory
    and prints it within the one cycle of the ISR.  I'm not sure if this is "correct".
*   Also open up the JavaScript console during program execution to see the dev-log :)