/***
Present Prompt to access week draft
***/

// ** constants
const week_title = "Week of ";

// ** markdown constants
const md_todo = "-[ ]";
const md_h1 = "# ";
const md_bullet = "* ";

// ** special activities for each day - array with 0 as Sunday
const day_activities = [
    "", // Sunday
    "", // Monday
    "", // Tuesday
    "Shopping - NatGroc, Hy-Vee", // Wednesday
    "CrossFit", // Thursday
    "Shopping - NewPi\nLunch @ Lu's", // Friday
    "", // Saturday
];


// get Sunday of this week
let d = get_sunday(new Date());

// set up Prompt to choose which week to look at
let p = new Prompt();
p.title = "Week Forecast";

p.addDatePicker("selDate", "Date Selection", new Date(), {"mode" : "date"});

p.addButton("Last Week " + strftime(adjustDate(d, "-7 day"), "%F"));
p.addButton("This Week " + strftime(d, "%F"));
p.addButton("Next Week " + strftime(adjustDate(d, "+7 day"), "%F"));
p.addButton("Following Week " + strftime(adjustDate(d, "+14 day"), "%F"));
p.addButton("Selected Date");

// if `show` returns false, user hit cancel button
if (p.show()) {
    let textFieldContents = p.fieldValues["textFieldName"];
    let startDate = p.fieldValues["myDate"];

    if (p.buttonPressed.startsWith("Last")) {
        // last week - update d
        d = adjustDate(d, "-7 day");
    }
    else if (p.buttonPressed.startsWith("This")) {
        // this week - no need to modify date d
    }
    else if (p.buttonPressed.startsWith("Next")) {
        // next week - update d
        d = adjustDate(d, "+7 day");
    }
    else if (p.buttonPressed.startsWith("Foll")) {
        // next week - update d
        d = adjustDate(d, "+14 day");
    }
    else if (p.buttonPressed == "Selected Date") {
        // user selected date - determine Sunday of the week of the selected dat
        d = get_sunday(p.fieldValues.selDate);
    }

	let draft = find_or_create_week_draft(d);

	editor.draft = draft; // show the draft in the Drafts editor
	app.applyWorkspace(Workspace.find("Week")); // set the Week Workspace
	
}


// ** Functions

function get_sunday(d) {
    /*
    returns Date corresponding to Sunday of passed Date, d
    argument
        d : Date
    returns computed Date
    */

    let dow = d.getDay(); // day of week

    if (dow != 0) {
        // today is not Sunday
        d = adjustDate(d, "-" + dow + " day");
    }

    return d;
}


function find_or_create_week_draft(d) {
    /*
    locate or create the week draft
    arguments
		d : Date of draft to find
	returns Draft created or found
	*/

    let drafts = Draft.queryByTitle(week_title + strftime(d, "%F"));
        // query a list of drafts with the specified title
    let draft = (drafts.length > 0) ? drafts[0] : null;
        // set to first draft found or null if none were found
 
    if (draft == null) {
        // no Draft found - create one
        draft = create_week_draft(d);
    }

    return draft;
}


function create_week_draft(d) {
    /*
    Create the draft for that week_title
    arguments
        d : Date of draft to create
    returns created Draft
    */

    let draft = new Draft();
    const draft_title = week_title + strftime(d, "%F");

    // tag and header
    draft.addTag("week");
    draft.content = draft_title + "\n";

    // links to previous and next week
    draft.append(md_h1 + "Links", "\n\n");
    draft.append("[[" + week_title + strftime(adjustDate(d, "-7 days"), "%F") + "]]"); 
    draft.append("[[" + week_title + strftime(adjustDate(d, "+7 days"), "%F") + "]]"); 

    // general to-dos
    draft.append(md_h1 + "To do\n" + md_todo, "\n\n");

    // loop for each day of the upcoming week
    for (i = 0; i < 7; ++i) {
        append_for_day(draft, d, day_activities[i]);
        d = adjustDate(d, "+1 day");
    }

    // footer
    draft.append(md_h1 + "Next Week", "\n\n");

    // update the draft
    draft.update();

    // return the draft
    return draft;
}


function append_for_day(draft, d, s) {
    /*
    Append content for specified day
    arguments
        draft : Draft to append text
        d : Date
        s : string of regular activities
    */

    const date_string = strftime(d, "%F %a");

    draft.append(md_h1 + date_string, "\n\n"); // header

    // check calendar dates
    let d1 = new Date(d);
    let d2 = new Date(d);

    d1.setHours(0, 0, 0); // from midnight
    d2.setHours(23, 59, 0) // to end of day

    const cal = Calendar.find("Family"); // family Calendar

	let events = cal.events(d1, d2);

	for (let event of events) {
		let event_string = strftime(event.startDate, "%H:%M ") + event.title;

		draft.append(md_bullet + event_string);
	}

    // append regular activities if any
    if (s != "") {
        draft.append(s);
    }
}
