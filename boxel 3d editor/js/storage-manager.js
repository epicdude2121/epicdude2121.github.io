class StorageManager {
    constructor() {
        this.levelPrefix = 'level_';
    }

    getAllLocalStorage() {
        var a = {};
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            var v = localStorage.getItem(k);
            a[k] = v;
        }
        return a;
    }

    setAllLocalStorage(data) {
        localStorage.clear(); // Empty out old data
        Object.keys(data).forEach(function(key) { localStorage.setItem(key, data[key])})
    }

    getListOfLevels() {
        var levels = [];
        var length = localStorage.length;
        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(this.levelPrefix) >= 0) {
                levels.push({ key: key, level: JSON.parse(localStorage.getItem(key)) });
            }
        }
        levels.sort((a,b) => (a.level.name > b.level.name) ? 1 : ((b.level.name > a.level.name) ? -1 : 0));
        return levels;
    }

    getLevelData(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    setLevelData(key, level) {
        var index = 1;
        if (key == null) {
            while (localStorage.getItem(this.levelPrefix + index) != null) index++;
            key = 'level_' + index;
        }
        localStorage.setItem(key, JSON.stringify(level));
        return key; // Useful for sharing newly generated level key
    }

    removeLevelData(key) {
        localStorage.removeItem(key);
    }

    updateLevelDataName(key, name) {
        var levelData = this.getLevelData(key);
        levelData.name = name;
        this.setLevelData(key, levelData);
    }

    saveScore(levelName, score) {
        var scores = this.getScores();
        var oldScore = 999999; // Default bad score
        var newScore = parseInt(score.replace(/[^\d]/g, ''));
        var hasNewScore = false;
        var data = scores[levelName];

        // Update old score if it exists
        if (data != null) {
            if (data.indexOf(':') >= 0) data += '0'; // Resolve deprecated ##:##
            oldScore = parseInt(data.replace(/[^\d]/g, ''));
        }

        // Check high score
        if (newScore < oldScore) {
            hasNewScore = true;
            scores[levelName] = score;
            localStorage.setItem('scores', JSON.stringify(scores));
        }
        return hasNewScore;
    }

    getScores() {
        var scores = localStorage.getItem('scores');
        if (scores == null) {
            scores = '{}';
            localStorage.setItem('scores', scores);
        }
        return JSON.parse(scores); // Return player scores
    }

    setSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    getSettings(a = app) {
        var storageSettings = localStorage.getItem('settings');
        var defaultSettings = { 
            'volume': 0,
            'quality': 6,
            'theme': 0,
            'snap': 8,
            'skin': a.skins.default,
            'motion': 1,
            'progress': 1
        };
        var settings = defaultSettings; // Use default

        // Replace with local storage settings
        if (storageSettings != null) {
            settings = JSON.parse(storageSettings);
        }
        
        // Check if new child settings are null by looping through default
        for (var key in defaultSettings) {
            if (settings[key] == null) {
                settings[key] = defaultSettings[key];
            }
        }
        return settings;
    }

    saveLevelToFile() {
        app.resetScene(app);
        app.level.deselectLevel(app);
        app.level.saveLevelData(app);
        var levelData = app.level.exportToJSON(app);
        var blob = new Blob([JSON.stringify(levelData)], { type: "application/json" });
        saveAs(blob, levelData.name);
    }

    loadLevelFromFile() {
        var input = document.createElement("input");
        input.setAttribute('type', 'file');
        input.setAttribute('id', 'theFile');
        input.addEventListener('change', handleFileSelect, false);
        function performClick() {
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, false);
            input.dispatchEvent(evt);
        }
        function handleFileSelect(evt) {
            var files = evt.target.files;
            var f = files[0];
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var name = theFile.name.split('.').slice(0, -1).join('.');
                    var levelData = JSON.parse(e.target.result);
                    levelData.name = name; // Rename level name to file name
                    app.level.clearLevel(app);
                    app.level.importFromJSON(levelData, app);
                };
            })(f);
            reader.readAsText(f);
        }
        performClick();
    }

    loadSkinFromFile(callback = function(e) { console.log(e); }) {
        var input = $('<input>', { type: 'file', accept: '.jpg,.png,.webp,.gif', multiple: true });
        input.on('change', function(evt) {
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.onload = function(e) { callback(e.target.result); };
            reader.readAsDataURL(file);
        });
        input.click();
    }

    backupToFile() {
        var local = app.storage.getAllLocalStorage();
        var blob = new Blob([JSON.stringify(local)], { type: "application/json" });
        saveAs(blob, 'boxel_3d_backup');
    }

    restoreFromFile() {
        var input = document.createElement("input");
        input.setAttribute('type', 'file');
        input.setAttribute('id', 'theFile');
        input.addEventListener('change', handleFileSelect, false);
        function performClick() {
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, false);
            input.dispatchEvent(evt);
        }
        function handleFileSelect(evt) {
            var files = evt.target.files;
            var f = files[0];
            var reader = new FileReader();
            reader.onload = (function() {
                return function(e) {
                    var data = JSON.parse(e.target.result);
                    app.storage.setAllLocalStorage(data);
                };
            })(f);
            reader.readAsText(f);
        }
        performClick();
    }

    backupToChrome(clearChromeStorage = false) {
        app.ui.dialog.add({
            text: 'Save all data to the cloud?<br><em>(scores, levels, etc.)</em>',
            inputs: [
                {
                    attributes: { value: 'Backup', type: 'button' },
                    function: function() {
                        var index = 0;
                        if (clearChromeStorage == true) chrome.storage.sync.clear(); //initially clear online storage
                        for (var i = 0; i < localStorage.length; i++){
                            var key = localStorage.key(i);
                            var value = localStorage.getItem(key);
                            var obj = {};
                            obj[key] = value;
                            chrome.storage.sync.set(obj, function(){
                                index++; // Show message on last item
                                if (index == localStorage.length) {
                                    app.ui.dialog.add({
                                        text: 'Success! Your data was backed up to your account.',
                                        inputs: [{ attributes: { value: 'Continue', type: 'button' }}]
                                    });
                                }
                            });
                        }
                    }
                },
                { attributes: { value: 'Cancel', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }

    restoreFromChrome(clearLocalStorage = false) {
        app.ui.dialog.add({
            text: 'Download all data from the cloud? This will override your local data (scores, levels etc.)<br><br><em>If you have not backed up your data, please cancel and backup your data first.</em>',
            inputs: [
                {
                    attributes: { value: 'Restore', type: 'button' }, 
                    function: function() {
                        // Restore
                        chrome.storage.sync.get(null, function(items) {
                            if (clearLocalStorage == true) localStorage.clear(); // Empty out old data
                            var keys = Object.keys(items);
                            for (var i = 0; i < keys.length; i++){
                                var key = keys[i];
                                var value = items[key];
                                localStorage.setItem(key, value);
                            }
                            app.ui.dialog.add({
                                text: 'Success! Your data was restored from your account.',
                                inputs: [{ attributes: { value: 'Continue', type: 'button' }}]
                            });
                        });
                    }
                },
                { attributes: { value: 'Cancel', type: 'button' }, function: app.ui.showAccountOptions }
            ]
        });
    }

    encodeImageFile() {
        // TODO, use dialog input ID
        // https://stackoverflow.com/a/23669825
        // <input id="inputFileToLoad" type="file" onchange="encodeImageFileAsURL();" />
        // <div id="imgTest"></div>

        var filesSelected = document.getElementById("inputFileToLoad").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            var fileReader = new FileReader();

            // Add listener for file when loaded
            fileReader.onload = function (fileLoadedEvent) {
                var srcData = fileLoadedEvent.target.result; // data: base64
                var newImage = document.createElement('img');
                newImage.src = srcData;
                document.getElementById("imgTest").innerHTML = newImage.outerHTML;
                console.log("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
            }
            fileReader.readAsDataURL(fileToLoad);
        }
    }

    decodeImage(data) {
        // TODO: test
        var image = new Image();
        image.src = data; // data: base64
        return image;
    }
}