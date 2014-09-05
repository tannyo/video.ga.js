/*!
 * video.ga.js | v0.1
 * derived from:
 * vimeo.ga.js | v0.2
 * Copyright (c) 2012 - 2013 Sander Heilbron (http://sanderheilbron.nl)
 * MIT licensed
 * Added Support for Detecting ga.js or analytics.js to use proper tracking code for each - 11/6/2013 - Robert Waddell (http://mrrobwad.blogspot.com)
 *
 * 2014-08-28 TKO Changed to be called passing the iframe so that it can be called for dynamically created iframes.
 *                Removed jQuery ready event.
 *                Added strict.
 *                Ran through jslint.com and corrected errors.
 * 2014-09-02 TKO Provided for future YouTube support. Turned into object. Added config object. Removed reliance on data-seek and data-progress attributes.
 * 2014-09-03 TKO Updated to v0.4 support.
 */

var videoTrack = (function () {
  'use strict';
  var gaTrack, vimeo, youtube, videoType, url, debug = false;

  // Google analytics tracking functions.
  // Classic Analytics (ga.js)
  function track_gaq(msg) {
    if (debug) {
      console.log(videoType, msg);
    }
    _gaq.push(['_trackEvent', videoType, msg, url, undefined, true]);
  }

  // Universal Analytics (universal.js)
  function track_ga(msg) {
    if (debug) {
      console.log(videoType, msg);
    }
    ga('send', 'event', videoType, msg, url);
  }

  // Google Tag Manager (dataLayer)
  function track_gtm(msg) {
    if (debug) {
      console.log(videoType, msg);
    }
    dataLayer.push({
      'event': 'Vimeo',
      'eventCategory': videoType,
      'eventAction': msg,
      'eventLabel': url,
      'eventValue': undefined,
      'eventNonInteraction': true
    });
  }

  /*
   * Vimeo tracking private object.
   */
  vimeo = (function () {
    var config,
      // iframe object.
      f,
      // Progress booleans
      progress25,
      progress50,
      progress75,
      // Self explanatory.
      timePercentComplete,
      // Booleans to allow tracking of specific events once.
      videoCompleted,
      videoPlayed,
      videoPaused,
      videoResumed,
      videoSeeking;

    /*
     * Helper function for sending a message to the player.
     */
    function post(action, value) {
      var data = {
        method: action
      };

      if (value) {
        data.value = value;
      }

      f.contentWindow.postMessage(JSON.stringify(data), url);
    }

    /*
     * Track video progress.
     */
    function onPlayProgress(data) {
      timePercentComplete = Math.round((data.percent) * 100); // Round to a whole number

      if (!config.progress) {
        return;
      }

      var progressMsg;

      if (timePercentComplete > 24 && !progress25) {
        progressMsg = 'Played video: 25%';
        progress25 = true;
      }

      if (timePercentComplete > 49 && !progress50) {
        progressMsg = 'Played video: 50%';
        progress50 = true;
      }

      if (timePercentComplete > 74 && !progress75) {
        progressMsg = 'Played video: 75%';
        progress75 = true;
      }

      if (progressMsg) {
        gaTrack(progressMsg);
      }
    }

    /*
     * Track when the video is paused once.
     */
    function onPause() {
      if (timePercentComplete < 99 && !videoPaused) {
        gaTrack('Paused video');
        videoPaused = true; // Avoid subsequent pause trackings
      }
    }

    /*
     * Called when the video is ready to play.
     */
    function onReady() {
      // Tell the Vimeo player what events you want to process.
      post('addEventListener', 'play');
      post('addEventListener', 'seek');
      post('addEventListener', 'pause');
      post('addEventListener', 'finish');
      post('addEventListener', 'playProgress');
      // Initialize progress indicators.
      timePercentComplete = 0;
      progress25 = false;
      progress50 = false;
      progress75 = false;
      // Initialize booleans to limit tracking some events more than once.
      videoPlayed = false;
      videoPaused = false;
      videoResumed = false;
      videoSeeking = false;
      videoCompleted = false;
    }

    /*
     * Process messages received from the Vimeo player.
     */
    function onMessageReceived(e) {
      // Only process messages from vimeo.
      if (!/vimeo.com/i.test(e.origin)) {
        return;
      }

      // Turn the passed data into a JSON object.
      var data = JSON.parse(e.data);

      if (debug) {
        console.log(data.event);
      }

      // Process events.
      switch (data.event) {
      case 'ready':
        onReady();
        break;

      case 'playProgress':
        onPlayProgress(data.data);
        break;

      case 'seek':
        if (config.seek && !videoSeeking) {
          gaTrack('Skipped video forward or backward');
          // Avoid subsequent seek trackings.
          videoSeeking = true;
        }
        break;

      case 'play':
        if (!videoPlayed) {
          gaTrack('Started video');
          // Avoid subsequent play trackings.
          videoPlayed = true;
        } else if (!videoResumed && videoPaused) {
          gaTrack('Resumed video');
          // Avoid subsequent resume trackings
          videoResumed = true;
        }
        break;

      case 'pause':
        onPause();
        break;

      case 'finish':
        if (!videoCompleted) {
          gaTrack('Completed video');
          // Avoid subsequent finish trackings.
          videoCompleted = true;
        }
        break;
      }
    }

    /*
     * Setup processing of events for tracking to Google Analytics.
     */
    function start(iframe, options) {
      config = {
        progress: false,  // Property to enable progress tracking
        seek: false       // Property to enable seek tracking
      };

      if (debug) {
        console.log("tracking Vimeo video");
      }

      videoType = 'Vimeo';
      f = iframe;
      url = f.src.split('?')[0];
      // Post to the iframe won't work without http*.
      if (!/^http/.test(url)) {
        url = location.protocol + url;
      }

      // Process options if passed.
      if (options) {
        // Could use jQuery extend or replacement here, but this is the only place
        // we need to extend an object and it is only two properties.
        config.progress = config.progress || options.progress;
        config.seek = config.seek || options.seek;
      }

      if (debug) {
        console.log("config", JSON.stringify(config));
      }

      // Listen for messages from the player
      if (window.addEventListener) {
        // Modern browsers.
        window.addEventListener('message', onMessageReceived, false);
      } else {
        // IE 8 and below.
        window.attachEvent('onmessage', onMessageReceived, false);
      }
    }

    /*
     * Stop processing events from the video iframe.
     */
    function stop() {
      // Remove event handlers to clean up memory.
      if (window.addEventListener) {
        window.removeEventListener('message', onMessageReceived, false);
      } else {
        window.detachEvent('message', onMessageReceived, false);
      }

      if (debug) {
        console.log("Vimeo message handler removed");
      }

      // Track close event if the user did not play the complete video.
      if (!videoCompleted) {
        gaTrack('Closed video at ' + timePercentComplete + '%');
      }
    }

    // Return vimeo start and stop methods.
    return {
      start: start,
      stop: stop
    };
  }());

  /*
   * Generic start and stop methods that call Vimeo and YouTube specific objects.
   */
  function start(videoIframe, options) {
    videoType = '';

    // Set version of analytics.
    if (typeof ga === 'function') {
      gaTrack = track_ga;
    } else if (_gaq && typeof _gaq.push === "function") {
      gaTrack = track_gaq;
    } else if (dataLayer && typeof dataLayer.push === "function") {
      gaTrack = track_gtm;
    } else {
      console.log("Unable track video events because Google analytics is not available.");
      return;
    }

    if (videoIframe) {
      // If we were passed a jQuery object, use the first iframe in the object.
      if (videoIframe.jquery) {
        videoIframe = videoIframe[0];
      }
    } else {
      console.log("No iframe to track video events.");
      return;
    }

    // It has to be a Vimeo video to track.
    if (videoIframe.src && /vimeo.com/i.test(videoIframe.src)) {
      vimeo.start(videoIframe, options);
    }
    // Add future YouTube call here.
  }

  function stop() {
    // The videoType variable will only be set if we are able to track Vimeo video events.
    // The check allows us to not call stop() unless event handlers have been added.
    if (videoType === 'Vimeo') {
      vimeo.stop();
    }
  }

  // Return generic start and stop methods as public.
  return {
    start: start,
    stop: stop
  };
}());
