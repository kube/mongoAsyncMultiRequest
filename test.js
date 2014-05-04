
                                                     /*#######.
    test.js                                         ########",#:
                                                  #########',##".
    KUBE     : www.kube.io                       ##"##"##",##',##.
    Created  : May, 3rd 2014 23:38:42             ## ## ## # ##",#.
    Modified : May, 4th 2014 23:59:23              ## ## ## ## ##.
                                                    ## ## ## :##
                                                     ## ## ##*/

var mongoAsyncMultiRequest = require('./mongoAsyncMultiRequest.js');

var request = new mongoAsyncMultiRequest("mongodb://127.0.0.1:27017/test",
{
    cleanUsers : function(db, callback)
    {
        db.collection('users').remove(callback);
    },

    cleanTickets : function(db, callback)
    {
        db.collection('tickets').remove(callback);
    },

    insertUser : function(db, callback) {
        var user = {
            firstName: "Hello",
            lastName: "World"
        };
        db.collection('users').insert(user, null, callback);
    },

    insertTicket : {
        dependency : 'insertUser',
        task : function(db, callback, result) {

            console.log(result.insertUser);
            var ticket = {
                author: "Kube Khrm",
                Message: "Hello Everybody!"
            };
            db.collection('tickets').insert(ticket, null, callback);
        }
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

request.run();
