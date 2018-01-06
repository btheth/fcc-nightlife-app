'use strict';

var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var yelp = require('yelp-fusion');

function getReview(req, client, id, obj) {
    return new Promise((resolve) => {
            client.reviews(id).then(reviewResponse => {
                
                if (reviewResponse.jsonBody.reviews[0]) {
                    obj.review = reviewResponse.jsonBody.reviews[0].text;
                } 
                
                var d = new Date();
                //console.log(d);
                d.setHours(0,0,0,0);
                //console.log(d);
                d.setDate(d.getDate()-1);
                //console.log(d);
                
                Users.aggregate([
                    {$match: {'history.yelpId' : id}}
                    ,{$unwind:'$history'}
                    ,{$match: {'history.yelpId' : id, 'history.statusTs': { $gt: d}}}
                    ,{$group: {_id: '$history.status', count: {$sum: 1}}   }
                ], function(err, results) {
                    if (err) throw err;
                    //console.log(id);
                    //console.log(results);
                    
                    for (var i = 0; i < results.length; i++) {
                        if (results[i]._id === 'going') {
                            obj.going = results[i].count;
                        } else if (results[i]._id === 'interested') {
                            obj.interested = results[i].count;
                        } else {
                            console.log('invalid status encountered');
                        }
                    }
                    
                    if (req.isAuthenticated()) {
                        var userId = req.session.passport.user;
                        
                        Users.findOne({'_id':userId, 'history.yelpId': id}).exec(function(err,res) {
                            if (err) throw err;
                            if (res) {
                                var hist = res.history;
                                //console.log(hist)
                                
                                for (var j = 0; j < hist.length; j++) {
                                    if (hist[j].yelpId === id && hist[j].statusTs > d) {
                                        obj.user = hist[j].status;
                                        break;
                                    }
                                }
                                
                                resolve(obj);
                            } else {
                                resolve(obj);
                            }
                        });
                        
                    } else {
                        resolve(obj);
                    }
                });
                    
                //resolve(obj);    
            }).catch(e => {
                console.log(e);
            });
    });
}

router.post('/search', function(req,res) {
    var client = yelp.client(process.env.API_KEY);
    //console.log(req.body.location);
    
    var location = req.body.location;
    //console.log(req.body);
    client.search({
        categories:'nightlife',
        location: location,
        limit: '25'
    }).then(response => {
        var promises = [];
        var businesses = response.jsonBody.businesses;
        
        for (var i = 0; i < businesses.length; i++) {
            var tempObj = {
                image_url: businesses[i].image_url,
                url: businesses[i].url,
                name: businesses[i].name,
                id: businesses[i].id,
                location: businesses[i].location,
                rating: businesses[i].rating,
                user: 'none',
                going: 0,
                interested: 0,
                review: '(no review found)'
            };
            
            var id = businesses[i].id;
            promises.push(getReview(req, client, id, tempObj));
        }
        
        Promise.all(promises)
          .then((results) => {
              //console.log(results);
              res.status(200).json(results);
          })
          .catch((e) => {
              res.status(400).json({error: 'yelp search failed'});
          });
        
    }).catch(e => {
        console.log(e);
        res.status(400).json({error: 'yelp search failed'});
    });
    
});

router.use('/search', function(req,res) {
   res.status(404).json({error: 'search not succesful'}) ;
});

module.exports = router;