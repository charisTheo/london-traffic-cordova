/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/**
 * @constructor app - main app object
 * 
 * @method initialize - initialize app by binding a 'deviceready' listener
 * @method onMapInit - Google Maps view has been rendered and ready to use
 * @method geolocateUser - geolocate user 
 * @method locatePositionOnMap - locate a given position on the Google Maps view
 * @method showPolyline - draw a polyline on Google Maps between two points
 * @method getRoadInfo - get traffic status from server
 * @method renderMaps - render the Google Maps view on screen
 */
var app = {
    map: undefined,
    mapMarker: undefined,
    loader: undefined,
    getTrafficBtn: undefined,
    trafficStatus: "examining...",
    SERVER_URL: "https://ec2-13-59-22-38.us-east-2.compute.amazonaws.com",
    KINGS_CROSS_POSITION: {lat: 51.530100, lng: -0.123980},

    /**
     * @method initialize - attach event listener and execute another method on 'deviceready'
     * 
     * @event deviceready - on deviceready render the Google Maps View
     */
    initialize: function() {
        document.addEventListener('deviceready', function() {
          this.getTrafficBtn = document.getElementById("get-traffic-btn");
          this.loader = document.getElementById("loader");
          this.renderMaps();
        }.bind(this), false);
    },
    
    /**
     * @method onMapInit - Map is ready to use, geolocate user
     */
    onMapInit: function() {
        this.geolocateUser();
    },

    /**
     * @method geolocateUser - geolocate user and display the location on maps
     * 
     * @function onSuccess - is called upon geolocation success
     * @function onError - is called upon geolocation error
     */
    geolocateUser: function() {
      function onSuccess(position) {
        this.locatePositionOnMap(position.coords.latitude, position.coords.longitude);
      }
      function onError(error) {
        console.log('TCL: geolocateUser -> error', error);
      }
      navigator.geolocation.getCurrentPosition(onSuccess.bind(this), onError, {enableHighAccuracy: true});
    },

    /**
     * @method locatePositionOnMap - show a position on Google Map view
     * 
     * @param {Number} lat 
     * @param {Number} lng 
     */
    locatePositionOnMap: function(lat, lng) {
      // Move to the position with animation
      this.map.animateCamera({
        target: {lat, lng},
        zoom: 16,
        tilt: 60,
        bearing: 0,
        duration: 3000
      });
    },

    /**
     * @method showPolyline - draw a polyline on Google Maps view between a given set of points coordinates
     * 
     * @param  {Array} positions 
     */
    showPolyline: function(...positions) {
      this.map.addPolyline({
        'points': positions,
        'color' : this.trafficStatus == "Congested" ? "red" : "blue",
        'width': 10,
        'idx': 0
      });
    },

    /**
     * @method getRoadInfo - function which requests the information about a specific road
     * 
     * Adds a marker on the road position which displays a message about the traffic congestion level
     * then draws a polyline between two points on the road
     */
    getRoadInfo: function() {
      let $this = this;
      $this.toggleLoader();
      fetch(this.SERVER_URL + "/road-information")
        .then(function(response) {
          if (response.status !== 200) return alert("There was an error while fetching the information", response.status);
          
          response.json().then(function(data) {
            // show the received position on the map view
            $this.locatePositionOnMap(data.position.lat, data.position.lng);
            // hide previous marker info window if in place
            if ($this.mapMarker) $this.mapMarker.hideInfoWindow();
            // save traffic status
            $this.trafficStatus = data.status;
            // add a new marker and save it
            $this.mapMarker = $this.map.addMarker({
              position: data.position,
              title: `Traffic status: \n ${$this.trafficStatus}`,
              snippet: data.name,
              animation: plugin.google.maps.Animation.BOUNCE
            });
            // Show the marker info window
            $this.mapMarker.showInfoWindow();
            // show a polyline from KINGS_CROSS_POSITION to the position received
            $this.showPolyline($this.KINGS_CROSS_POSITION, data.position);
            $this.toggleLoader();
          });
        })
        .catch(function(error) {
          console.log("getRoadInfo -> fetch -> Error", error);
        });
    },

    /**
     * @method toggleLoader - toggle page loader 
     */
    toggleLoader: function() {
      this.loader.classList.toggle("show");
    },

    /**
     * @method renderMaps - initialized and renders the Google Maps view on the screen
     * 
     * @event click - attaches a click event listener on the get-traffic-btn element
     */
    renderMaps: function() {
      // Create a Google Maps native view under the map_canvas div.
      this.map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas"));
      // The MAP_READY event notifies the native map view is fully ready to use.
      this.map.one(plugin.google.maps.event.MAP_READY, this.onMapInit.bind(this));
      // attach event listener on the button for traffic status request
      this.getTrafficBtn.addEventListener("click", this.getRoadInfo.bind(this));
    }
};

app.initialize();