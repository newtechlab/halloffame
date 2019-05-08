angular.module("hof", [])
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            var video_id = url.split('v=')[1].split('&')[0];
            return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + video_id);
        };
    }])
    .controller("mainCtrl", ["$scope", "$http", "$sce", function ($scope, $http, $sce) {
        let person = "Beyonce";
        $scope.tense = "is";
        $scope.person = person;
        $scope.isActive = function(name){
            console.log(name === person, name);
            return name === person;
        }
        $scope.ladies = ["Grace Hopper", "Margaret Hamilton", "Ada Lovelace", "Sally Ride","Katie Bouman", "Beyonce", "Michelle Obama"];
        $http.jsonp($sce.trustAsResourceUrl("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=" + person.replace(" ", "%20")))
            .then(function (res) {
                console.log(res);
                let pageid = res.data.query.search[0].pageid;
                let url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&rvprop=content&pageids=" + pageid;
                $http.jsonp($sce.trustAsResourceUrl(url))
                    .then(function (res) {
                        $scope.extract = $sce.trustAsHtml(res.data.query.pages[pageid].extract.split("\n")[0]);
                    });
            }, function (err) {
                console.error(err);
            });
        $http.get("person.data")
            .then(function (res) {
                let lines = res.data.split("\n");
                let list = [];
                let why = "";
                let listEnd = -1;
                let whyStart = -1;
                let mediaStart = -1;
                let media = [];
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].indexOf("#list") > -1) {
                        listStart = i + 1;
                        continue;
                    }
                    if (lines[i].indexOf("#why") > -1) {
                        listEnd = i - 1;
                        whyStart = i + 1;
                        continue;
                    }
                    if (lines[i].indexOf("#media") > -1) {
                        mediaStart = i - 1;
                        continue;
                    }
                    if (listEnd < 0) {
                        list.push(lines[i]);
                    } else if (whyStart > -1 && mediaStart < 0) {
                        if (lines[i]!== undefined) {
                            why += lines[i];
                        }
                    } else if (mediaStart > -1) {
                        media.push({ url: lines[i] });
                    }
                }
                $scope.list = list;
                $scope.why = why;
                $scope.media = media;
            },
                function (err) {
                    console.error(err);
                });

    }]);