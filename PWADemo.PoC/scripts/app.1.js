// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
    'use strict';

    var app = {
        isLoading: true,
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        baseUrl: 'https://api.github.com/'
    };


    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/


    $(document).on("click", "#butRefresh", function() {
        location.reload(true);
    });




    // Updates a weather card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateForecastCard = function(data) {

        for (var i = 0; i < data.length; i++) {
            var authorLogin = data[i].authorLogin;
            var authorAvatar_url = data[i].authorAvatar_url;
            //var authorUrl = data[i].authorUrl;
            var commitAuthorName = data[i].commitAuthorName;
            var commitAuthorEmail = data[i].commitAuthorEmail;
            var commitDate = data[i].commitDate;
            var commitMessage = data[i].commitMessage;

            var $card = $('.cardTemplate').clone();
            $card.removeClass('cardTemplate')
                .removeAttr('hidden');

            $card.find(".author-loginId").html(authorLogin);
            //$card.find(".authorUrl").attr("href", authorUrl);
            $card.find(".authorAvatar_url").attr("src", authorAvatar_url);
            $card.find(".commitAuthorName").text(commitAuthorName);
            $card.find(".commitAuthorEmail").text(commitAuthorEmail);
            $card.find(".commitDate").text(commitDate);
            $card.find(".commitMessage").text(commitMessage);
            $('.mdl-grid').append($card);

            $(".commitMessage-block p").text(function(index, currentText) {
                return currentText.substr(0, 300) + "...";
            });
        }
        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };


    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    /*
     * Gets a forecast for a specific city and updates the card with the data.
     * getForecast() first checks if the weather data is in the cache. If so,
     * then it gets that data and populates the card with the cached data.
     * Then, getForecast() goes to the network for fresh data. If the network
     * request goes through, then the card gets updated a second time with the
     * freshest data.
     */
    app.getForecast = function(key, label) {

        var url = app.baseUrl + "repos/vmg/redcarpet/commits";
        // TODO add cache logic here
        if ('caches' in window) {
            /*
             * Check if the service worker has already cached this city's weather
             * data. If the service worker has the data, then display the cached
             * data while the app fetches the latest data.
             */
            console.log(url);
            caches.match(url).then(function(response) {
                if (response) {
                    response.json().then(function updateFromCache(json) {
                        console.log("inside cache..");
                        console.log(json);
                        var results = json.query.results;
                        results.key = key;
                        results.label = label;
                        results.created = json.query.created;
                        app.updateForecastCard(results);
                    });
                }
            });
        }
        // Fetch the latest data.
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    var results = [];
                    for (var i = 0; i < response.length; i++) {
                        var result = {};
                        result.authorLogin = response[i].author.login;
                        result.authorAvatar_url = response[i].author.avatar_url;
                        result.authorUrl = response[i].author.url;
                        result.commitAuthorName = response[i].commit.author.name;
                        result.commitAuthorEmail = response[i].commit.author.email;
                        result.commitDate = response[i].commit.author.date;
                        result.commitMessage = response[i].commit.message;
                        results.push(result);
                    }
                    console.log("inside onreadystatechange..");
                    app.updateForecastCard(results);
                }
            } else {
                // Return the initial weather forecast since no data is available.
                console.log("inside else..");
                //app.updateForecastCard(initialWeatherForecast);
            }
        };
        request.open('GET', url);
        request.send();
    };

    // Iterate all of the cards and attempt to get the latest forecast data
    /*app.updateForecasts = function() {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function(key) {
            app.getForecast(key);
        });
    };*/

    // TODO add saveauthor function here
    // Save list of author to localStorage.
    app.saveSelectedCities = function() {
        var selectedCities = JSON.stringify(app.selectedCities);
        localStorage.selectedCities = selectedCities;
    };


    /*
     * Fake weather data that is presented when the user first uses the app,
     * or when the user has not saved any cities. See startup code for more
     * discussion.
     */
    // var initialWeatherForecast = [{
    //     authorAvatar_url: "https://avatars2.githubusercontent.com/u/77174?v=4",
    //     authorUrl: "https://api.github.com/users/mattr-",
    //     commitAuthorName: "Test",
    //     commitAuthorEmail: "mattr-@github.com",
    //     commitDate: "2018-02-06T16:02:16Z",
    //     commitMessage: "Merge pull request #647 from Davidslv/patch-1\n\nUpdate README.markdown"
    // }];
    // TODO uncomment line below to test app with fake data
    //app.updateForecastCard(initialWeatherForecast);
    app.getForecast(null, null);

    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/


    // TODO add service worker code here
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
})();



/*****add for push notification */

if ('Notification' in window && navigator.serviceWorker) {
    // Display the UI to let the user toggle notifications
}

if (Notification.permission === "granted") {
    /* do our magic */
} else if (Notification.permission === "blocked") {
    /* the user has previously denied push. Can't reprompt. */
} else {
    /* show a prompt to the user */
}

self.addEventListener('push', function(event) {
    debugger;
    console.log('Received a push message', event);

    var title = 'Notification';
    var body = 'There is newly updated content available on the site. Click to see more.';
    var icon = 'https://raw.githubusercontent.com/deanhume/typography/gh-pages/icons/typography.png';
    var tag = 'simple-push-demo-notification-tag';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            tag: tag
        })
    );
});


//on click add class 
$(document).on('click', '.weather-forecast .author-wrapper', function() {
    $(".dialog-container").addClass("open-popup");
    //alert(".weather-forecast .author-wrapper");
    var loginId = $(this).parent().find(".author-loginId").html();
    console.log(loginId);
});

//on click remove class 
/*$(document).on('click', '.dialog-container #close-popup', function() {
    $(".dialog-container").removeClass("open-popup");
    //alert(".weather-forecast .author-wrapper");    
});*/

/*$(document).ready(function() {
    $("..author-wrapper").click(function() {
        $(".dialog-container").css("opacity", 1);
    });
    $("#close-popup").click(function() {
        $(this).parent().parent().parent().css("opacity", 0);
    });
});*/