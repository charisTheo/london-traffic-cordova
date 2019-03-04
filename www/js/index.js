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
var app = {
    map: undefined,
    mapMarker: undefined,
    trafficStatus: "examining...",
    SERVER_URL: "https://ec2-13-59-22-38.us-east-2.compute.amazonaws.com",
    KINGS_CROSS_POSITION: {lat: 51.530100, lng: -0.123980},

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.renderMaps();
        this.geolocateUser();
    },

    geolocateUser: function() {
      function onSuccess(position) {
        this.locateUser(position.coords.latitude, position.coords.longitude);
      }
      function onError(error) {
        console.log('TCL: geolocateUser -> error', error);
      }
      navigator.geolocation.getCurrentPosition(onSuccess.bind(this), onError);
    },

    locateUser: function(lat, lng) {
      // Move to the position with animation
      this.map.animateCamera({
        target: {lat, lng},
        zoom: 16,
        tilt: 60,
        bearing: 0,
        duration: 3000
      });
    },

    showPolyline: function(...positions) {
      this.map.addPolyline({
        'points': positions,
        'color' : this.trafficStatus == "Congested" ? "red" : "blue",
        'width': 10,
        'idx': 0
      });
    },

    getTrafficStatus: async function() {
      // Add a maker
      let $this = this;
      await fetch(this.SERVER_URL + "/road-information")
        .then(function(response) {
          if (response.status !== 200) return alert("There was an error while fetching the information", response.status);
          response.json().then(function(data) {
            $this.locateUser(data.position.lat, data.position.lng);
            if ($this.mapMarker) $this.mapMarker.hideInfoWindow();
            $this.trafficStatus = data.status;

            $this.mapMarker = $this.map.addMarker({
              position: data.position,
              title: `Traffic status: \n ${$this.trafficStatus}`,
              snippet: data.name,
              animation: plugin.google.maps.Animation.BOUNCE
            });
            // Show the info window
            $this.mapMarker.showInfoWindow();
            // show a polyline from KINGS_CROSS_POSITION to the position received
            $this.showPolyline($this.KINGS_CROSS_POSITION, data.position);
          });
        })
        .catch(function(error) {
          console.log("getTrafficStatus -> fetch -> Error", error);
        });
    },

    renderMaps: async function() {
        // Create a Google Maps native view under the map_canvas div.
        this.map = await plugin.google.maps.Map.getMap(document.getElementById("map_canvas"));
        // attach event listener on the button for traffic status request
        var getTrafficBtn = document.getElementById("get-traffic-btn");
        getTrafficBtn.addEventListener("click", this.getTrafficStatus.bind(this));
    }
};

app.initialize();