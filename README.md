# london-traffic-cordova

## A simple Cordova mobile app requesting and showing the traffic congestion level on the roads of London. 
* Every ~4 minutes a new image is published on the [TFL API](https://api.tfl.gov.uk) and a Lambda AWS function is checking on 3 minutes intervals for a new picture and sents the URL to an AWS EC2 Instance.
* The EC2 Instance receives the TFL image URL and downloads the image. Then sents it to IBM Watson for classification.
* The model on IBM Watson is trained so that it returns a **Congested** class if there is enough traffic shown in the picture with a specific degree of certainty. The model was negatively trained as well, where picture of light traffic have been used to train it.
* The EC2 Instance then receives the amount of traffic and is stored on the server.
* The Cordova app can request the traffic status anytime, however with an around ±3 minutes of accuracy due to the TFL API update intervals.


### Android [APK file](https://github.com/charisTheo/london-traffic-cordova/blob/master/platforms/android/app/build/outputs/apk/debug/app-debug.apk)

<p align="center">
  <img src="https://github.com/charisTheo/london-traffic-cordova/blob/master/requesting-traffic-status.gif?raw=true" alt="Demo showing how requesting traffic status works"/>
</p>

#### Built by:
* [Cordova](https://cordova.apache.org/)
* [cordova-plugin-googlemaps](https://github.com/mapsplugin/cordova-plugin-googlemaps)
* [TFL API](https://api.tfl.gov.uk)
