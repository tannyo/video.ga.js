# Google Analytics Vimeo Video Tracking

A Google Analytics module for measuring Vimeo Player Events. The module supports Universal Analytics, Classic Google Analytics, and Google Tag Manager. Derived from: http://www.sanderheilbron.nl/vimeo.ga.js/

I created this version because a site I was working used code to create the iframe for the video dynamically so that the video was not loaded until the reader actually wanted to play the video. The code as it was written requires that the video iframe is already on the page and uses a jQuery ready function to get the video iframe.

This code has been changed to allow you to call start and stop methods to track a video and does not require jQuery. If you happen to pass the start method a jQuery iframe element, the code will convert it to native javascript.

This code will only track one video at a time. The stop method must be called for the "Closed video at %" action to be tracked. The way I use the code is that I have a click event on the Play Video button which creates a modal dialog with the iframe. When the iframe is created the start method is called. When the modal dialog is closed, destroying the iframe, the stop method is called.

The code has been run through [JSLint](http://jslint.com/) and [JSHint](http://www.jshint.com/). All global variables have been defined and the code follows Douglas Crockford's [code convensions](http://javascript.crockford.com/code.html).

## Usage

    <script src="path/to/video.ga.min.js"></script>

To start tracking in your javascript call:

    videoTrack.start(iframe element);

To stop tracking in your javascript call:

    videoTrack.stop();

## Options
    config {
      progress: false,  // Property to enable progress tracking
      seek: false       // Property to enable seek tracking
    };

To call with one or more options set, use as the second start parameter and object.

    videoTrack.start(iframe,{seek: true});

## Basic event trackers

* Category: Vimeo
* Action:
  * **Started video**: when the video starts playing.
  * **Paused video**: when the video is paused.
  * **Resumed video**: when the video starts playing when it was paused.
  * **Completed video**: when the video reaches 100% completion.
  * **Skipped video**: when the video is skipped forward or backward.
  * **Closed video at %**: when the video is closed without playing to the end.
* Label: URL of embedded video on Vimeo.

## Progress event trackers

* Category: Vimeo
* Action:
  * **25% Progress**: when the video reaches 25% of the total video time.
  * **50% Progress**: when the video reaches 50% of the total video time.
  * **75% Progress**: when the video reaches 75% of the total video time.
* Label: URL of embedded video on Vimeo.

## Bounce rate

The event trackers do not impact bounce rate of the page which embeds the video. The value of the opt_noninteraction parameter is set to true or 1.

## Browser Support

Tested in the latest versions of Chrome, Firefox, Safari, and IE. Also tested on iOS.

## Requirements

Classic Google Analytics Tracking Code (asynchronous), Universal Analytics Tracking Code or Google Tag Manager container code
The end user must be using a browser that supports the HTML5 postMessage feature. Most modern browsers support postMessage, though Internet Explorer 7 does not support it.

## Future Enhancements

In the future I intend to add support for YouTube videos. If you want to add that feature, please feel free to fork this repository and code to your hearts intent. I'm just not available for side projects like this, so it may take a while.

## Issues

Have a bug? Please create an [issue](https://github.com/tannyo/video.ga.js/issues) here on GitHub!

## Contributing

Want to contribute? Great! Just fork the project, make your changes and open a [pull request](https://github.com/tannyo/video.ga.js/pulls).

## Changelog
0.1 (September 4, 2014):

* Initial release.

## License

The MIT License (MIT)

Copyright (c) 2014 [Tanny O'Haley](http://tanny.ica.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
