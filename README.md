Mongo Asynchronous Multiple Requests
====================================

This class will permit you to get the result of multiple MongoDB requests in one callback function, very easily.

```js
    var mongoAsyncMultiRequest = require('./mongoAsyncMultiRequest.js');

    var request = new mongoAsyncMultiRequest("mongodb://127.0.0.1:27017/test",
    {
        insertUser : function(db, callback) {
            var a = {
                firstName: "Hello",
                lastName: "World"
            };
            db.collection('users').insert(a, null, callback);
        },

        insertTicket : function(db, callback) {
            var a = {
                author: "Kube Khrm",
                Message: "Hello Everybody!"
            };
            db.collection('users').insert(a, null, callback);
        },

        users : function(db, callback) {
            db.collection('users').find().toArray(callback);
        },

        tickets : function(db, callback) {
            db.collection('tickets').find().toArray(callback);
        }

    }, function(err, results) {
        if (err) throw err;

        console.log(results.users);
        console.log(results.tickets);
    });

```
