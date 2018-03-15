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

    //on click add class 
    $(document).on('click', '.weather-forecast .author-wrapper', function() {
        $(".dialog-container").addClass("open-popup");
        //alert(".weather-forecast .author-wrapper");
        var loginId = $(this).parent().find(".author-loginId").html();
        //console.log(loginId);
        app.getDilogs(loginId);
    });

    //on click remove class 
    $(document).on('click', '.dialog-container #close-popup', function() {
        $(".dialog-container").removeClass("open-popup");
        //alert(".weather-forecast .author-wrapper");    
    });

    $(document).on('click', '.mdl-layout__drawer-button', function() {
        $(".main").toggleClass("open-sidebar");
        //alert(".weather-forecast .author-wrapper");    
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

            //$(".commitMessage-block p").text(function(index, currentText) {
            //   return currentText.substr(0, 100) + "...";
            //});

            $(function() {
                $(".commitMessage-block p").each(function(i) {
                    var len = $(this).text().length;
                    if (len > 310) {
                        $(this).text($(this).text().substr(0, 300) + '...');
                    }
                });
            });
        }
        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /**add by gyan */
    app.updateDilogsCard = function(data) {
        var login = data.login;
        var avatarUrl = data.avatar_url;
        var url = data.url;
        var nameAuthor = data.nameAuthor;
        var blogUrl = data.blogUrl;
        var location = data.location;
        var company = data.company;
        var $dialog = $('.dialog-body');
        $dialog.find(".login").text(login);
        $dialog.find(".url").attr("href", url);
        $dialog.find(".avatarUrl").attr("src", avatarUrl);
        $dialog.find(".nameAuthor").text(nameAuthor);
        $dialog.find(".company").text(company);
        $dialog.find(".location").text(location);
        $dialog.find("a.blogUrl").attr("href", blogUrl);
        $dialog.find("span.blogUrl").text(blogUrl);
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
    app.getForecast = function() {

        var url = app.baseUrl + "repos/vmg/redcarpet/commits";
        // TODO add cache logic here
        if ('caches' in window) {
            /*
             * Check if the service worker has already cached data. 
             * If the service worker has the data, then display the cached
             * data while the app fetches the latest data.
             */
            console.log(url);
            caches.match(url).then(function(response) {
                if (response) {
                    response.json().then(function updateFromCache(response) {
                        console.log("inside cache..");
                        console.log(response);
                        //var results = json.query.results;
                        //results.key = key;
                        //results.label = label;

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
                        //results.created = json.query.created;
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



    /***add by gyan */

    app.getDilogs = function(loginId) {

        var url = app.baseUrl + "users/" + loginId;
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
                        //var results = json.query.results;
                        //results.created = json.query.created;
                        var result = {};
                        result.login = response.login;
                        result.avatar_url = response.avatar_url;
                        result.url = response.url;
                        result.nameAuthor = response.name;
                        result.blogUrl = response.blog;
                        result.location = response.location;
                        result.company = response.company;
                        app.updateDilogsCard(result);
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
                    var result = {};
                    result.login = response.login;
                    result.avatar_url = response.avatar_url;
                    result.url = response.url;
                    result.nameAuthor = response.name;
                    result.blogUrl = response.blog;
                    result.location = response.location;
                    result.company = response.company;


                    console.log("inside onreadystatechange..");
                    app.updateDilogsCard(result);
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

    /*end by gyan*/

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





    /*****add for push notification */


    const applicationServerPublicKey = 'BM76NviimoqbR-jy0B2kxE9DfsV6WvBaOBCKDiuERKnOP4lJX0hwXSrun-_4ICvRvOD7DLhrUt_EPtVovcNVMKE';

    const pushButton = document.querySelector('.js-push-btn');

    let isSubscribed = false;
    let swRegistration = null;

    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function updateBtn() {
        if (Notification.permission === 'denied') {
            pushButton.textContent = 'Push Messaging Blocked.';
            pushButton.disabled = true;
            updateSubscriptionOnServer(null);
            return;
        }

        if (isSubscribed) {
            pushButton.textContent = 'Disable Push Message';
        } else {
            pushButton.textContent = 'Enable Push Message';
        }

        pushButton.disabled = false;
    }

    function updateSubscriptionOnServer(subscription) {
        // TODO: Send subscription to application server

        const subscriptionJson = document.querySelector('.js-subscription-json');
        const subscriptionDetails =
            document.querySelector('.js-subscription-details');

        if (subscription) {
            subscriptionJson.textContent = JSON.stringify(subscription);
            subscriptionDetails.classList.remove('is-invisible');
        } else {
            subscriptionDetails.classList.add('is-invisible');
        }
    }

    function subscribeUser() {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            })
            .then(function(subscription) {
                console.log('User is subscribed.');

                updateSubscriptionOnServer(subscription);

                isSubscribed = true;

                updateBtn();
            })
            .catch(function(err) {
                console.log('Failed to subscribe the user: ', err);
                updateBtn();
            });
    }

    function unsubscribeUser() {
        swRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            })
            .catch(function(error) {
                console.log('Error unsubscribing', error);
            })
            .then(function() {
                updateSubscriptionOnServer(null);

                console.log('User is unsubscribed.');
                isSubscribed = false;

                updateBtn();
            });
    }

    function initializeUI() {
        pushButton.addEventListener('click', function() {
            pushButton.disabled = true;
            if (isSubscribed) {
                unsubscribeUser();
            } else {
                subscribeUser();
            }
        });

        // Set the initial subscription value
        swRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                isSubscribed = !(subscription === null);

                updateSubscriptionOnServer(subscription);

                if (isSubscribed) {
                    console.log('User IS subscribed.');
                } else {
                    console.log('User is NOT subscribed.');
                }

                updateBtn();
            });
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('./service-worker.js')
            .then(function(swReg) {
                console.log('Service Worker is registered', swReg);

                swRegistration = swReg;
                initializeUI();
            })
            .catch(function(error) {
                console.error('Service Worker Error', error);
            });
    } else {
        console.warn('Push messaging is not supported');
        pushButton.textContent = 'Push Not Supported';
    }

    // TODO add service worker code here
    /*if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }*/
})();