
                                                     /*#######.
    mongoAsyncMultiRequest.js                       ########.,#:
                                                  ######### ,##'.
    KUBE     : www.kube.io                       ## ## ## .##'.##.
    Created  : May, 3rd 2014 23:35:25             ## ## ## # ##".#.
    Modified : May, 4th 2014 03:27:12              ## ## ## ## ##.
                                                    ## ## ## :##
                                                     ## ## #*/

var MongoClient = require('mongodb').MongoClient;

function mongoAsyncMultiRequest(credentials, requests, callback) {
    var self = this;

    var _results = new Array();
    var _requests = new Array();

    if (typeof callback != 'function') {
        console.error('Invalid callback function');
        return 1;
    }

    for (var i in requests) {
        if (typeof requests[i] == 'function') {
            _requests[i] = requests[i];
            _requests[i].finished = 0;
        }
        else {
            console.error('Request at index `' + i + '` is not valid request');
            return 1;
        }
    }

    function isCompleted(db) {
        for (var i in _requests)
        {
            if (!_requests[i].finished)
                return 0;
        }
        db.close();
        return 1;
    }

    this.runRequests = function() {
        MongoClient.connect(credentials, function(err, db) {
            if (err) throw err;

            for (var i in _requests)
                _requests[i].finished = 0;

            for (var i in _requests) {
                _requests[i](db, (function (i) {
                    return function(err, results) {
                        if (err)
                           callback(err);
                        else {
                            _results[i] = results;
                            _requests[i].finished = 1;
                            if (isCompleted(db))
                                callback(null, _results);
                        }
                    }
                })(i));
            }
        });
    }
    this.runRequests();
    return 0;
}

module.exports = mongoAsyncMultiRequest;
