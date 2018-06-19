var APIURL = 'https://comet.api.hbo.com/content';
var apiVersionString = "application/vnd.hbo.v8.full+json";
var bearerToken;
var debug = false;

var CometHelper = (function (window, document, undefined) {
    /**
     * Helper to export methods (and other things?) as globals
     */
    var _exports = {};

    function _export (namespace, fn) {
        if (!_exports[namespace]) _exports[namespace] = fn;
    }


    // _export('bind', bindFocusStateManager);
    // _export('generateClasses', generateClasses);

    return function () {
        return _exports;
    };

})(window, document);

/**
 * BEARER TOKENS
 */

// Try and get a bearer token from localStorage
function loadBearerTokenFromLocalStorage () {
    try { // We may not have localStorage access
        bearerToken = localStorage.getItem('_HBOBearerToken');
    } catch(e){}

    if (!bearerToken) bearerToken = prompt('What is your Bearer Token?');

    try { // We may not have localStorage access
        localStorage.setItem('_HBOBearerToken', bearerToken);
    } catch(e){}
}

// Set bearerToken
function setBearerToken (token) {
    bearerToken = token; // Set it so we have it later

    // Try to stash it away in localStorage for the next page load
    try { // We may not have localStorage access
        localStorage.setItem('_HBOBearerToken', bearerToken);
    } catch(e){}
}


function cometRequestRaw (data, cb) {
    return $.ajax({
        url: APIURL,
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=UTF-8',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + bearerToken);
            xhr.setRequestHeader ("Accept", apiVersionString);
        },
        success: function (response) {
            if (debug) console.log('Response from COMET:', response); // For debugging
            if (cb && typeof cb === 'function') cb(response);
        },
        error: function (xhr) { // If an error occured
            if (debug) console.warn("An error occurred.");
            if (debug) console.log(xhr, 'status:', xhr.status, 'rt:',  xhr.responseText);

            if (xhr.status == 'Unauthorized' || xhr.responseText == 'Unauthorized') {
                bearerToken = null;

                try { // We may not have localStorage access
                    localStorage.removeItem('_HBOBearerToken');
                } catch(e){}

                setTimeout(function () {
                    location.reload(); // Good idea? or no? I'll decide later..
                }, 5000);
            }
        }
    });
}

function cometRequest (urn, cb) {
    cometRequestRaw([{"id":urn}], cb);
}

// Get video DRM for playback (single call before video playback via primetime DRM)
function primetimeDRMFromExtra (urn, cb) {
    return cometRequestRaw([{
        "id": urn,
        "headers": {
            "x-hbo-desired-bitrate": 2934,
            "x-hbo-device-code-override": "DESKTOP",
            "x-hbo-video-encodes": "X264|HLS|PRM"
        }
    }], cb);
}

function getFeatureById (id, cb) {
    cometRequest(id, function (response) {

        var metadata = response[0].body;
        var video = response[1].body;

        var formatted = {
            metadata: metadata,
            video: video
        };

        if (debug) console.log('formatted response to getFeatureById:', formatted);

        if (cb && typeof cb === 'function') cb(formatted);
    });
}

// Return specific data for the player from a feature URN
function featureToExtra (urn, cb, repeat) {
    getFeatureById(urn, function (response) {

        // console.log('feature', response);

        var formatted = {
            video: response.video.references.video,
            quality: response.video.quality,
            title: response.metadata.titles.full,
            duration: response.metadata.duration,
            ratingCode: response.metadata.ratingCode,
            releaseYear: response.metadata.releaseYear,
            credits: response.metadata.credits,
            summaries: response.metadata.summaries
        };

        if (response.metadata.seriesTitles) formatted.seriesName = response.metadata.seriesTitles.full;
        if (response.metadata.numberInSeason) formatted.episodeNumber = `${response.metadata.seasonTitles.short} Ep ${response.metadata.numberInSeason}`;

        if (debug) console.log('getFeatureById r', response);

        if (debug) console.log('Formatted response to getFeatureById', formatted);

        if (cb && typeof cb === 'function') cb(formatted, repeat);
    });
}

// Semantic Wrapper for episodeToExtra
function episodeToExtra (urn, cb) {
    return featureToExtra(urn, cb);
}

function batchQueryAll (arr, cb) {
    var resultsMerged = []; // Everything ends up here
    var count = 0; // Number of open requests in promiseAll

    // Split the array into chunks of 15
    for (var i = 0, j = arr.length, tempArray, chunk = 15; i < j; i += chunk) {
        tempArray = arr.slice(i, i + chunk);

        // Do a cometRequestBatch call for each 15
        count++;
        cometRequestRaw(tempArray, function (results) {
            // Merge all of the responses
            resultsMerged = resultsMerged.concat(results);

            count--;

            // Return the response via callback if completed
            if (!count && cb && typeof cb === 'function') cb(resultsMerged);
        });
    }
}

function arrayOfIdsToObjects (arr) {
    var output = [];

    arr.forEach(function (item) {
        output.push({
            id: item
        })
    });

    return output;
}


function listAll (urn, cb) {
    cometRequest(urn, function (response) {
        var featureIds = response[0].body.references.items;
        var features = [];
        var responses = [];

        // response.forEach(function (item) {
        //     if (!item.id) return;
        //     if (item.id.indexOf(urn) === -1) responses.push(item);
        //
        //     if (item.id) var index = featureIds.indexOf(item.id);
        //     if (item.id && index > -1) featureIds.splice(index, 1);
        // });

        featureIds = arrayOfIdsToObjects(featureIds);

        batchQueryAll(featureIds, function (response) {

            responses = responses.concat(response);

            responses.forEach(function (item) {
                // console.log(item);
                // Splice out the item from our featureIds
                // var index = featureIds.indexOf(item.id);
                // if (index > -1) featureIds.splice(index, 1);

                var obj = {
                    id: item.id,
                    duration: item.body.duration,
                    images: {},
                    ratingCode: item.body.ratingCode,
                    viewable: item.body.references.viewable
                };

                if (item.body.titles && item.body.titles.full) obj.title = item.body.titles.full;

                if (item.body.images && item.body.images.tilezoom) obj.images.tilezoom = item.body.images.tilezoom.split('{{size}}')[0] + '280x158&compression=low&protection=false&scaleDownToFit=false';

                if (item.body.titles) features.push(obj);
            });

            if (cb && typeof cb === 'function') cb(features);
        });
    });
}



// Kickoff
loadBearerTokenFromLocalStorage();

// Get a list of comedies
// cometRequest("urn:hbo:query:comedies-a-z");

// primetimeDRMFromExtra("urn:hbo:video:GWqa1IgBUZYrCMgEAAARz:extra:GWqa1IgCOGYrCMgEAAAR0");

// featureToExtra('urn:hbo:feature:GVU29nAERglFvjSoJAWMz', function (response) {
//     if (debug) console.log('feature2extra', response);
// });
