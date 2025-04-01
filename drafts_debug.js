/***
Drafts debug function library
***/

function debug_new_log()
{
    /*
    Create a new log
    returns a reference to the Draft object representing the log
    */

    const today = new Date();
    let debug_title = "Debug Log " + strftime(today,
        "%F %T");
    let d = new Draft();

    d.append(debug_title, "");
    d.update();
    return d;
}
