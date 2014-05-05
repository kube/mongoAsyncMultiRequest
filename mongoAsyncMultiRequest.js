
                                                     /*#######.
    mongoAsyncMultiRequest.js                       ########",#:
                                                  #########',##".
    KUBE     : www.kube.io                       ##'##'##".##',##.
    Created  : May, 3rd 2014 23:35:25             ## ## ## # ##",#.
    Modified : May, 4th 2014 23:55:57              ## ## ## ## ##'
                                                    ## ## ## :##
                                                     ## ## ##*/

var MongoClient = require('mongodb').MongoClient;

function mongoAsyncMultiRequest(url, requests, callback) {
    var self = this;

    var _results = new Array();
    var _requests = new Array();
    var _errors = null;

    if (typeof callback != 'function')
        throw new Error('Invalid callback function');

    function addPromise(request, promise)
    {
        if (!request.promises)
            request.promises = new Array();
        request.promises.push(promise);
    }

    this.addRequest = function(name, request)
    {
        if (typeof request == 'function' ||
            typeof request.task == 'function') {

            _requests[name] = request.task ? request.task : request;
            if (request.dependency) {
                if (_requests[request.dependency]) {
                    addPromise(_requests[request.dependency], name);
                    _requests[name].dependency = request.dependency;
                }
                else
                    throw new Error('Could not add request `' + name
                        + '`:\n       Dependency `' + request.dependency
                        + '` doesn\'t exist!');
            }
            _requests[name].finished = 0;
        }
        else
            throw new Error('Request `' + name + '` is not valid request');
    }

    function isCompleted(db) {
        for (var i in _requests) {
            if (!_requests[i].finished)
                return 0;
        }
        db.close();
        return 1;
    }

    function addError(requestName, err) {
        if (_errors === null)
            _errors = new Array();
        _errors[requestName] = err;
    }

    function cancelRequest(request)
    {
        request.finished = 1;
        if (request.promises)
            for (var i in request.promises)
                cancelRequest(_requests[request.promises[i]]);
    }

    function runRequest(db, name, variables) {
        _requests[name](db, (function (name) {
            return function(err, results) {
                if (err) {
                    cancelRequest(_requests[name]);
                    addError(name, err);
                }
                else {
                    _requests[name].finished = 1;
                    _results[name] = results;
                    for (var i in _requests[name].promises)
                        runRequest(db, _requests[name].promises[i], variables);
                }
                if (isCompleted(db))
                    callback(_errors, _results);
            }
        })(name), variables, _results);
    }

    this.run = function(variables) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            for (var i in _requests)
                _requests[i].finished = 0;

            for (var i in _requests)
                if (!_requests[i].dependency)
                    runRequest(db, i, variables);
        });
    }

    for (var i in requests)
        this.addRequest(i, requests[i]);
}

module.exports = mongoAsyncMultiRequest;
