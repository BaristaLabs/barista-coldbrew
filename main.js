var app = require('app');
var path = require('path');
var BrowserWindow = require('browser-window');
var bs = require("barista-server");

// Report crashes to our server.
//TODO: yeah, so I think we need an endpoint for this...

/*require('crash-reporter').start({
    productName: 'ColdBrew',
    companyName: 'BaristaLabs, LLC',
});*/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var baristaServer = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        if (baristaServer)
            baristaServer.shutdown();
        app.quit();
    }
});

var finishCreatingBaristaServer = function (webContents, loadFiddle) {

    var address = baristaServer.address();
    if (address.address === "::")
        address.address = "localhost";
    
    var url = "http://" + address.address + ":" + address.port;
    webContents.executeJavaScript("var __baristaServerUrl = '" + url + "';");

    if (!!loadFiddle)
        mainWindow.loadURL(url + "/fiddle");
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function (e) {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        center: true,
        "node-integration": false,
        //"web-security": false,
        preload: __dirname + "/preload.js"
    });

    baristaServer = new bs.BaristaServer();
    baristaServer.createBaristaServer(function (baristaServer) {
        finishCreatingBaristaServer(mainWindow.webContents, true)
    });

    //when the dom is ready, create a barista server.
    mainWindow.webContents.on('dom-ready', function (e) {
        //this was initially did-start-loading, but that event fires on iframe loads too...
        if (baristaServer)
            baristaServer.shutdown();

        baristaServer = new bs.BaristaServer();
        baristaServer.createBaristaServer(function (baristaServer) {
            finishCreatingBaristaServer(mainWindow.webContents);
        });
    });

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});