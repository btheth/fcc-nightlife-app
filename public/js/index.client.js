$(document).ready(function() {
    var appUrl = window.location.origin
	var placeUrl = appUrl + '/search';
	var indicateUrl = appUrl + '/indicate';
    
    function getVenues(location) {
        $('#venue-box').hide();
        $('#location').hide();
        $('#venue-box').html('');
        $('#loader').show();
        $.cookie('search', location, { expires: 1, path: '/' });
        
        $.ajax({
	        url: placeUrl,
            type: 'POST',
            dataType: 'json',
            data: {location: location},
            success: function(data) {
                var html = '';
                //console.log(data);
                for (var i = 0; i < data.length; i++) {
                    //yelpIds.push(data[i].id);
                    var goingClass = 'going btn btn-sm btn-primary'
                    var interestedClass = 'interested btn btn-sm btn-primary'
                    
                    if (data[i].user === 'going') {
                        goingClass = 'going btn btn-sm btn-success';
                    }
                    
                    if (data[i].user === 'interested') {
                        interestedClass = 'interested btn btn-sm btn-success';
                    }
                    
                    html += '<div class=\'table-div\'><table id=\'' + data[i].id + '\'><tr><td class=\'pic\' rowspan=\'2\'><img class=\'venue-img\' src=\'';
                    html += data[i].image_url + '\' alt=\'(venue image not found)\'></td><td class=\'col-2\'><button class=\'' + goingClass + '\' value=\'' + data[i].id + '\'>going: ' + data[i].going + '</button>';
                    html += '<button class=\'' + interestedClass + '\' value=\'' + data[i].id + '\'>interested: ' + data[i].interested + '</button></td>';
                    html += '</td><td class=\'col-3\' rowspan=\'2\'><a href=\'';
                    
                    var addressLink = 'https://www.google.com/maps/search/';
                    var addressDisplay = ''
                    for (var j = 0; j < data[i].location.display_address.length; j++) {
                        addressLink  += data[i].location.display_address[j] + ' ';
                        addressDisplay += data[i].location.display_address[j] + '</br>';
                    }
                
                    html += addressLink + '\' target=\'_blank\'>' + addressDisplay + '</a>';
                    html += '</td><td class=\'col-4 venue-name\'><a target=\'_blank\' href=\'' + data[i].url + '\'>' + data[i].name;
                    html += '</tr><tr><td id=\'rating\' class=\'col-2\'>Rating: ' + data[i].rating + '</td><td id=\'review\'  class=\'col-4\'>' + data[i].review + '</td></tr></table></div>';
                }
                    html+= '<div class=\'table-div\'></div'
                    
                //console.log(yelpIds);    
                $('#location').html(location);
                $('#venue-box').html(html);
                $('#loader').hide();
                $('#location').show();
                $('#venue-box').show();
            },
            error: function(err) { 
                console.log(err);
                $.removeCookie('search', { path: '/' });
                $('#loader').hide();
                $('#venue-box').html('Location not found - try again');
                $('#venue-box').show();
            }
	    });
    }
    
    function indicate(method,id) {
        $.ajax({
	        url: indicateUrl,
            type: 'POST',
            dataType: 'json',
            data: {method: method, id: id},
            success: function(data) {
                console.log(data);
                console.log('success');
                window.location = data.redirect;
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
    
    if ($.cookie('search')) {
        getVenues($.cookie('search'));
    }
	
	$('#go-btn').on('click', function() {
	    if ($('#search-box').val() === "") {
	        alert('Must enter location!');
	    } else {
	        getVenues($('#search-box').val());
	    }
	});
	
	$("#search-box").on('keyup', function (e) {
        if (e.keyCode == 13) {
            if ($('#search-box').val() === "") {
	            alert('Must enter location!');
	        } else {
	            getVenues($('#search-box').val());
	        }
        }
    });

	$('#venue-box').on('click', '.going', function() {
	    console.log($(this).val());
		console.log('going');
		indicate('going', $(this).val());
	});
	
	$('#venue-box').on('click', '.interested', function() {
	    console.log($(this).val());
		console.log('interested');
		indicate('interested', $(this).val());
	});
	
});