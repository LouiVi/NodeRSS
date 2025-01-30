function createDatabase() {
    var db = app.CreateSQLite("/storage/emulated/0/Download/rssImages/rssFeeds.db");
    db.Execute("CREATE TABLE IF NOT EXISTS feeds (id INTEGER PRIMARY KEY AUTOINCREMENT, sitename TEXT UNIQUE, feedUrl TEXT)");
    return db;
}

function addFeed(db, sitename, feedUrl) {
    try {
        db.Execute("INSERT INTO feeds (sitename, feedUrl) VALUES (?, ?)", [sitename, feedUrl]);
        saveFeedsToJson(db);
    } catch (e) {
        app.ShowPopup("Error: " + e.message);
    }
}

function saveFeedsToJson(db) {
    var feeds = db.Query("SELECT * FROM feeds");
    var json = JSON.stringify(feeds);
    app.WriteFile("feeds.json", json);
}

function createUI() {
    var tabGroup = app.CreateTabGroup("RSS Reader");
    
    // Example of adding tabs
    var tab1 = app.CreateTab("Feed 1", "icon1.png");
    var tab2 = app.CreateTab("Feed 2", "icon2.png");
    var tabPlus = app.CreateTab("+", "iconPlus.png");
    
    tabGroup.AddTab(tab1);
    tabGroup.AddTab(tab2);
    tabGroup.AddTab(tabPlus);
    
    tabPlus.SetOnTouch(function() {
        showFeedDialog();
    });
    
    app.AddLayout(tabGroup);
}


function showFeedDialog() {
    var db = createDatabase();
    var feeds = db.Query("SELECT * FROM feeds");
    var feedList = feeds.map(feed => feed.sitename).join("\n");
    
    app.Alert("Saved Feeds:\n" + feedList, "Add Feed", ["Cancel", "Add New"], function(result) {
        if (result === "Add New") {
            // Prompt for new feed details
            app.Prompt("Enter Feed Site Name:", "", function(sitename) {
                app.Prompt("Enter Feed URL:", "", function(feedUrl) {
                    addFeed(db, sitename, feedUrl);
                });
            });
        }
    });
}

function OnStart() {
    var db = createDatabase();
    createUI();
}
OnStart()