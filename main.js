var requireUncached = require('require-uncached');
var app = require('app');
var path = require('path');
var BrowserWindow = require('browser-window');
var BaristaServer = requireUncached("../barista-core/server.js");

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var baristaServer = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        BaristaServer.shutdown();
        app.quit();
    }
});

var finishCreatingBaristaServer = function (webContents, server) {
    baristaServer = server;

    var address = baristaServer.address();
    if (address.address === "::")
        address.address = "localhost";

    webContents.executeJavaScript("var __baristaServerUrl = 'http://" + address.address + ":" + address.port + "'");
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
   
    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + path.join(__dirname, 'node_modules/barista-fiddle/fiddle/index.html'));
    
    //when the dom is ready, create a barista server.
    mainWindow.webContents.on('dom-ready', function (e) {
        //this was initially did-start-loading, but that event fires on iframe loads too...

        BaristaServer.createBaristaServer(function (baristaServer) {
            finishCreatingBaristaServer(mainWindow.webContents, baristaServer);
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