
//bartundee

var cid = "77c5d80362e34ae6869148deea59b1e7";

window.stalkdar = function() {

    var suggestedStalkees = [{
      username:"baratunde",
      bio:"supervising producer @thedailyshow, co-founder @cultivatedwit, co-host podcast About Race. SC: snapatunde",
      website:"http://baratunde.com",
      profile_picture:"https://scontent.cdninstagram.com/hphotos-xtf1/t51.2885-19/11236254_355239427997969_564011184_a.jpg",
      full_name:"Baratunde Thurston",
      counts:{
         media:750,
         followed_by:15416,
         follows:1214
      }
    }];

    function recommend() {
        var users = suggestedStalkees.slice(0,3);
        _.each(users, function(user){
            $(".recommended_users").append("<div class='recommend-user' data-user=" + user.username + "><img src='" + user.profile_picture + "' /><div class='username " + user.username + "'>@" + user.username + "</div><button class='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent stalk-btn'>STALK</button></div>");
        });
    }

    function init(cb) {
        var locations;
        var usersCount = 0;
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var locationCtr = 0;
            async.series([
                function(cb) {
                    $.get("https://api.instagram.com/v1/locations/search?client_id=" + cid + "&lat=" + lat + "&lng=" + lng, function(response) {
                        locations = response;
                        cb(null, response);
                    });
                },
                function(cb) {
                    async.parallel([
                        function(cb) {
                            var data = _.shuffle(locations.data);
                            var location = data[0];
                            var locationId = location.id;
                            $.get("https://api.instagram.com/v1/locations/" + locationId + "/media/recent?client_id=" + cid, function(response) {
                                var posts = _.shuffle(response.data);
                                var selectedPosts = _.slice(posts, 0, 3);
                                _.each(selectedPosts, function(selectedPost) {
                                    var user = selectedPost.user;
                                    suggestedStalkees.push(user);
                                });
                                usersCount++;
                                cb(null);
                            });
                        },
                        function(cb) {
                            var data = _.shuffle(locations.data);
                            var location = data[1];
                            var locationId = location.id;
                            $.get("https://api.instagram.com/v1/locations/" + locationId + "/media/recent?client_id=" + cid, function(response) {
                                var posts = _.shuffle(response.data);
                                var selectedPosts = _.slice(posts, 0, 3);
                                _.each(selectedPosts, function(selectedPost) {
                                    var user = selectedPost.user;
                                    suggestedStalkees.push(user);
                                });
                                usersCount++;
                                cb(null);
                            });
                        },
                        function(cb) {
                            var data = _.shuffle(locations.data);
                            var location = data[2];
                            var locationId = location.id;
                            $.get("https://api.instagram.com/v1/locations/" + locationId + "/media/recent?client_id=" + cid, function(response) {
                                var posts = _.shuffle(response.data);
                                var selectedPosts = _.slice(posts, 0, 3);
                                _.each(selectedPosts, function(selectedPost) {
                                    var user = selectedPost.user;
                                    suggestedStalkees.push(user);
                                });
                                usersCount++;
                                cb(null);
                            });
                        }],
                        cb
                    );
                },
                function(result) {
                    cb();
                    console.log(suggestedStalkees);
                }
            ]);
        }, function() {
            alert('how ya gonna stalk?');
        });
    }
    return {
        init: init,
        recommend: recommend
    };
}();