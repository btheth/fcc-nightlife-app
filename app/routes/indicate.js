'use strict';

var express = require('express');
var router = express.Router();
var Users = require('../models/users');

router.post('/indicate', function(req,res) {
    //console.log(req.body);
    //console.log(req.session);
    var userId = req.session.passport.user;
    var businessId = req.body.id;
    var method = req.body.method;
    //console.log(userId, businessId, method);
    
    Users.findOne({'_id':userId}).exec(function(err,results) {
       if (err) throw err;
       //console.log(results.history);
       var history = results.history;
       
       var obj = {
           yelpId: businessId,
           status: method,
           statusTs: new Date()
       };
       
       var curObj = {};
       
       var found = false;
       for (var i = 0; i < history.length; i++) {
           if (history[i].yelpId === businessId) {
               curObj = history[i];
               found = true;
           }
       }
       
       if (!found) {
           //console.log('not found');
           var conditionsNew = { '_id': userId }, updateNew = { $push: {'history': obj}};
            
            Users.update(conditionsNew,updateNew,function(err, num) {
                if (err) throw err;
                res.status(200).send({redirect: '/'});
            });
       } else {
           //console.log('found');
           var conditions = {};
           var update = {};
           if (curObj.status === obj.status) {
               conditions = { '_id': userId }, update = { $pull: {'history': {'yelpId': businessId} }};
            
    	        Users.update(conditions,update,function(err, num) {
    		        if (err) throw err;
    		        //console.log(num);
    		        res.status(200).send({redirect: '/'});
    	        });
           } else {
               conditions = { '_id': userId, 'history.yelpId': businessId }
               , update = { $set: {'history.$.status': method, 'history.$.statusTs': new Date()}};
               
               Users.update(conditions,update,function(err, num) {
                   if (err) throw err;
                   //console.log(num);
    		       res.status(200).send({redirect: '/'});
               });   
           }
       }
    });
});

module.exports = router;