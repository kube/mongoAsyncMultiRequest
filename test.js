
                                                     /*#######.
    test.js                                         ########",#:
                                                  #########',##".
    KUBE     : www.kube.io                       ##"##"##",##',##.
    Created  : May, 3rd 2014 23:38:42             ## ## ## # ##",#.
    Modified : May, 4th 2014 23:59:23              ## ## ## ## ##.
                                                    ## ## ## :##
                                                     ## ## ##*/

var asyncMultiRequest = require('./mongoAsyncMultiRequest.js');

var task = new asyncMultiRequest("mongodb://127.0.0.1:27017/test",
{
    insertUser : function(db, callback, variables) {

        var user = {
            firstName : variables.firstName,
            lastName : variables.lastName
        }
        db.collection('users').insert(user, null, callback);
    },

    insertTicket : {
        dependency : 'insertUser',
        task : function(db, callback, variables, results) {

            var ticket = {
                author: results.insertUser[0]._id,
                message: variables.message
            };
            db.collection('tickets').insert(ticket, null, callback);
        }
    },

    users : {
        dependency : 'insertUser',
        task : function(db, callback, variables) {
            db.collection('users').find().toArray(callback);
        }
    },

    tickets : {
        dependency : 'insertTicket',
        task : function(db, callback, variables) {
            db.collection('tickets').find().toArray(callback);
        }
    }

}, function(err, results) {
    if (err) throw err;

    console.log(results.users);
    console.log(results.tickets);
});

task.run({
    firstName : "John",
    lastName : "Doe",
    message : "Hello Everybody!" });
