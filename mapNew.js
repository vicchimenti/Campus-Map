var optionsUsedInAllKmlsSoFar = {
  preserveViewport: true,
  suppressInfoWindows: true
};

var geoXml;

var infowindow = null;
  
var MY_MAPTYPE_ID = 'custom_style';

var campusOverlay;

var isIOS = false;

// Prevent window overscroll on mobile (iPhone)
/*
var xStart, yStart = 0;
 
document.addEventListener('touchstart',function(e) {
    xStart = e.touches[0].screenX;
    yStart = e.touches[0].screenY;
});

document.addEventListener('touchmove',function(e) {
    var xMovement = Math.abs(e.touches[0].screenX - xStart);
    var yMovement = Math.abs(e.touches[0].screenY - yStart);
    if((yMovement * 3) > xMovement) {
        e.preventDefault();
    }
});
*/

function initialize() {

  // jQuery and DOM elements
  infoWindow = $("#info_window");
  infoBar = $("#info_bar");
  infoBottom = $("#info_bottom")
  infoBottomTitle = $("#info_bottom_title");
  infoBottomContent = $("#info_bottom_content");
  infoBottomDrag = $("#info_bottom_drag");
  infoBottomCover = $("#info_bottom_cover");
  infoBottomClose = $("#info_bottom_close");
  navigationListTop = $("#navigation_list_top");
  navigationListTopWrapper = $("#navigation_list_top_wrapper");
  alphabetLayout = $(".alphabetLayout");
  searchBox = $(".searchBox");
  searchBoxDesktop = $(".searchBox.desktop");
  searchBoxMobile = $(".searchBox.mobile");
  searchList = $("#searchList");
  
  jQuery.fn.animate = jQuery.fn.velocity;
  
  window.searchString = ""; // To make sure the variable exists before the if check in displayInfo() runs
  
  var styles = [
    {
      stylers: [
        { visibility: 'simplified' }
      ]
    },
    {
      featureType: 'landscape',
      stylers: [
        { visibility: 'off' }
      ]
    }
    ]
  
  // Initialize the map
  var LocSeattleU = new google.maps.LatLng(47.60983, -122.316799);
  var mapOptions = {
    zoom: 16,
    center: LocSeattleU,
    fullscreenControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    overviewMapControl: false,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    streetViewControl: false,
    zoomControl: true,
    disableDoubleClickZoom: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.DEFAULT,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    }
  };
    
  
  // Set map_canvas dimensions to viewport
  /*
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  document.getElementById("map_canvas").style.width = x.toString() + "px";
  document.getElementById("map_canvas").style.height = y.toString() + "px";
  */
  
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  
  // Place campus overlay on map
  var overlayURL = "/map/overlay/overlay-z.png";
  var overlayBounds = new google.maps.LatLngBounds( new google.maps.LatLng(47.606157, -122.32086), new google.maps.LatLng(47.612840, -122.312817) );
  /*var*/ campusOverlay = new google.maps.GroundOverlay(overlayURL, overlayBounds);
  campusOverlay.setMap(map);
  
  // Declare map styles
  var globalStyle = [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.park",
      stylers: [{visibility: "on"}]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#55b31b" }]
    },
    /*
    {
      featureType: "landscape",
      stylers: [{ visibility: "off" }]
    },
    */
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: []
    },
    /*
    {
      featureType: "poi.school",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "poi.school",
      elementType: "geometry",
      stylers: [{ color: "#FFFFFF" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#BCDB9B" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    },
    */
    {
      featureType: "road",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: []
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: []
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ stroke: 0.5 }]
    }
  ];
  
  /*
  var postStyle = [
    {
      featureType: "road",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [{ color: "#cccccc" }]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#cccccc" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ stroke: 0.5 }]
    }
  ];
  */
  
  // Apply map styles
  map.setOptions({styles: globalStyle});



	// Universal listeners
	$(document).ready(function(){
	  
	  if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
	    isIOS = true;
	  }
	    
	  // On window resize...
	  $(window).on("resize", function() {
	    resizeInfo(); // Resize info_window
	    if ( searchBoxMobile.is(":visible") ) {
	      map.setOptions({zoomControl: false});
	    } else {
	      map.setOptions({zoomControl: true});
	    }
	    if (isIOS == true) {
	      if (window.innerWidth > window.innerHeight) {
	        $("#warning_wrapper").css('display', 'block');
	      } else {
	        $("#warning_wrapper").css('display', 'none');
	      }
	    } /*else {
	      if (oldId != null && preventResize == false) {
	        displayInfo(oldDoc, oldId, true);
	      }
	      preventResize = false;
	    }*/
	  }).trigger("resize");
	  document.getElementById("navigation_list_top_handle").addEventListener("click", closeNavigation);
	  
	});
  
  // Declare geoxml3 parser settings
  geoXml = new geoXML3.parser({
    zoom: false,
    suppressInfoWindows: true,
    createMarker: createMarker,
    afterParse: parseKML
  });
  
  // Declare and parse KML files
  var files = [
    "/map/kml/buildings-f.kml",
    "/map/kml/dining-c.kml",
    "/map/kml/parking-l.kml",
    "/map/kml/chapels-c.kml",
    "/map/kml/sustainability-d.kml",
    "/map/kml/collegia-a.kml",
    "/map/kml/galleries-a.kml"
  ];
  geoXml.parse(files);
  
  // Activate accordion
  //$(document).ready(
  //  function() {
      /*
      $(".categoryAccordion").accordion({
        heightStyle: "fill",
        collapsible: "true",
        active: "false",
        animate: {
          duration: 250 // ANIMATION NOT OCCURRING -- MAY WANT TO REMOVE
        }
      });
      */
  //  }
  //);
  
  var allowClick;
  var categoryAccordion = $(".categoryAccordion");
  $(".categoryLayout.desktop").find('ul').css('display', 'none'); // Could be replaced with CSS but refersh-level3 is conflicting
  categoryAccordion.find('h4').on('touchstart.accordion', function() {
    allowClick = true;
  }).on('click.accordion', function() {
    if (allowClick == true || $("#navigation_list").is(":visible")) {
      $(this).next().toggle();
      allowClick = false;
    }
  });
  
  // Use this to console.log lat/lng coordinates on right click -- comment out when unneeded
  /*
  google.maps.event.addListener(map, "rightclick", function(event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    // populate yor box/field with lat, lng
    //console.log(lng + "," + lat + ",0");
  });
  */
  
  
  
  /* Prevent full window bounce on iPhones, potentially other devices too */
  // Apply to all scrollable elements
  $("#searchList, #navigation_list_top, #info_bottom_content").on('touchstart.scroll', function() {
    //console.log("started");
    if ($(this).scrollTop() + $(this).innerHeight() >= $(this).get(0).scrollHeight) {
      $(this).scrollTop($(this).scrollTop() - 1);
    }
    else if ($(this).scrollTop() <= 0) {
      $(this).scrollTop($(this).scrollTop() + 1);
    }
  }).on('touchmove.scroll', function(e) {
    /*
    if ($(this).get(0).scrollHeight == $(this).innerHeight()) {
      alert("yo");
      e.preventDefault();
    }
    */
  });
  
  // Apply to all fixed elements and info_bottom_drag
  $("#map_navigation_top, .navbar-wrapper, #info_bottom_drag").on('touchmove.noscroll', function(e) {
    e.preventDefault();
  });
  
  var buttonTouch = {},
    allowClick = false
    threshold = 300;
  
  // Set up touch events for mobile menu/back button since click events aren't reliable
  $("#headerMenu")//.unbind('touchstart touchend')
  .on('touchstart', function(e){
    e.preventDefault();
    var d = new Date();
    buttonTouch.start = d.getTime();
  })
  .on('touchend', function(e){
    e.preventDefault();
    var d = new Date();
    buttonTouch.end = d.getTime();
    if (buttonTouch.end - buttonTouch.start < threshold) {
      e.target.click();
    }
  })
  .on('click', function() { 
    if ( $("#menuButton").is(":visible") ) {
      //console.log("opening nav");
      openNavigation();
    }
    else {
      //console.log("closing search");
      //console.log("culprit");
      closeSearch();
    }
  });
  
  //$(document).ready(function() {
    //console.log("ready");
    showCategory();
  //});
  
}

/* Geoxml3's createMarker() is incompatible with IE so we made our own version that does practically the same thing.
For every placemark in every doc, geoxml3's parser runs this function to creates a marker if one exists.
These markers can then be displayed on the map using setMap, as seen in categoryListener(). */

function createMarker(placemark, doc) { // placemark and doc are arguments from geoxml3's parser
  
  // Grab various info from placemark -- you can add any parameter that exists in the KML
  var markerOptions = {
    optimized: false, // Apparently allows z-indexes on markers -- one "optimized: true" and no marker can have a z-index
    position: placemark.latlng, // Coordinates
    icon: placemark.style.icon, // Icon
  };
  
  var marker = new google.maps.Marker(markerOptions); // Create marker in Google Maps API using markerOptions
  
  /* OPTIMIZE */
  if (!doc.markers) { // If markers array doesn't exist in the currently selected doc...
    doc.markers = []; // ...create it
  }
  
  doc.markers.push(marker); // Push marker to array
  
  // Create listener for clicking on marker
  var id = doc.markers.length - 1;
  google.maps.event.addListener(marker, 'click', function()
    {            
         displayInfo(doc, id, true);
    });
  
}

// Now we load the map items and manipulate the menu

var descriptionItemsParsed = new Array();

// var listString;

var dummyElement;

/* MUST BE PUBLIC */
var buildingDoc;
var diningDoc;
var parkingDoc;
var spiritualDoc;
var sustainabilityDoc;
//var greenspacesDoc;
var collegiaDoc;
var galleriesDoc;

var completePlacemarks = [],
  completeIds = [],
  completeAbbreviations = [],
  completeDocs = [];

function parseKML(doc) {  // Sets doc object for each KML file

  docs = doc;

  buildingDoc = doc[0];
  diningDoc = doc[1];
  parkingDoc = doc[2];
  spiritualDoc = doc[3];
  sustainabilityDoc = doc[4];
    //greenspacesDoc = doc[5];
  collegiaDoc = doc[5];
  galleriesDoc = doc[6];
  
  var titles = [
    "buildingDoc",
    "diningDoc",
    "parkingDoc",
    "spiritualDoc",
    "sustainabilityDoc",
    /*"greenspacesDoc",*/
    "collegiaDoc",
    "galleriesDoc"
  ];
  
  // Create complete data set for all placemarks
  var completePlaceholder = [];
  for (var j = 0; j < titles.length; j++) {
    for (i = 0; i < doc[j].placemarks.length; i++) {
      
      completePlaceholder.push({
        'data': doc[j].placemarks[i],
        'id': i,
        'doc': titles[j]
      });
      /*
      completePlacemarks.push(doc[j].placemarks[i]);
      completeIds.push(i);
      completeDocs.push(titles[j]);
      */
    }
  }
  
  // Sort complete data by name
  function compare(a,b) {
    if (a.data.name < b.data.name)
      return -1;
    if (a.data.name > b.data.name)
      return 1;
    return 0;
  }
  completePlaceholder.sort(compare);
  
  // Separate complete data into three arrays
  for (i = 0; i < completePlaceholder.length; i++) {
    completePlacemarks.push(completePlaceholder[i].data);
    completeIds.push(completePlaceholder[i].id);
    completeDocs.push(completePlaceholder[i].doc);
  }
  
  dummyElement = document.createElement("div");
  
  // Run through completePlacemarks
  for (var i = 0; i < completePlacemarks.length; i++) {
    // Parse <ExtendedData> description from HTML as string (for search)
    dummyElement.innerHTML = completePlacemarks[i].description;
    descriptionItemsParsed[i] = $(".buildingDescription", dummyElement).text();
  }
  
  // Run through buildingDoc
  for (var i = 0; i < buildingDoc.placemarks.length; i++) {
  	//console.log(i);
    // Get polygon, create listener, and set style based on category
    if (buildingDoc.placemarks[i].polygon) {  // WHY THE IF STATEMENT? ALL BUILDINGDOC ITEMS SHOULD HAVE POLYGONS
      createListener(i);
      buildingDoc.placemarks[i].polygon.setOptions(mouseoutStyle[buildingDoc.placemarks[i].vars.val.style]);
      buildingDoc.placemarks[i].polygon.setOptions(normalStyle[buildingDoc.placemarks[i].vars.val.style]);
      // Render on map
      buildingDoc.gpolygons[i].setMap(map);
    }
  }
  
  //console.log(buildingDoc);
  historyHash();
  navigationFill();

  //$(document).ready(function() {
    categoryListener();
  //});
}

var normalStyle = {
  plainred: {
    strokeWeight: 0.5,
    fillColor: "#AA0000"
  },
  transparent: {
    strokeWeight: 0,
    fillOpacity: 0.0
  }
};
  
var clickStyle = {
  plainred: {
    strokeWeight: 0.5,
    fillColor: "#00A6C4"
  },
  transparent: {
    strokeWeight: 2,
    strokeColor: "#000000",
    strokeOpacity: 1.0,
    fillColor: "#FFFFFF",
    fillOpacity: 0.5
  }
};

var searchOpacity = {
  full: {
    fillOpacity: 1.0,
    strokeOpacity: 1.0
  },
  transparent: {
    fillOpacity: 0.25,
    strokeOpacity: 0.25
  }
};

var mouseoverStyle = {
  /*
  academic: {
    fillColor: "#EF4136",
    fillOpacity: 0.5
  },
  residential: {
    fillColor: "#FDB917",
    fillOpacity: 0.5
  },
  administrative: {
    fillColor: "#818181",
    fillOpacity: 0.5
  },
  recreational: {
    fillColor: "#49C4D3",
    fillOpacity: 0.5
  },
  greenspace: {
    fillColor: "#D0D0D0",
    fillOpacity: 0.5
  },
  other: {
    fillColor: "#807B75",
    fillOpacity: 0.5
  },
  */
  plainred: {
    fillColor: "#fab82f"
  },
  transparent: {
    fillColor: "#FFFFFF",
    fillOpacity: 0.5
  }
};

var mouseoutStyle = {
  /*
  academic: {
    fillColor: "#EF4136",
    fillOpacity: 1.0,
    strokeColor: "#000000"
  },
  residential: {
    fillColor: "#FDB917",
    fillOpacity: 1.0,
    strokeColor: "#000000"
  },
  administrative: {
    fillColor: "#818181",
    fillOpacity: 1.0,
    strokeColor: "#000000"
  },
  recreational: {
    fillColor: "#49C4D3",
    fillOpacity: 1.0,
    strokeColor: "#000000"
  },
  greenspace: {
    fillColor: "#D0D0D0",
    fillOpacity: 0.0,
    strokeColor: "#000000"
  },
  other: {
    fillColor: "#807B75",
    fillOpacity: 1.0,
    strokeColor: "#000000"
  },
  */
  plainred: {
    fillColor: "#AA0000",
    strokeColor: "#333333"
  },
  transparent: {
    fillColor: "#FFFFFF",
    fillOpacity: 0.0
  }
};

var selectedBuilding;

var dontHash = false;
  

function createListener(i) {
  
  //console.log("creating listeners");
  
  google.maps.event.addListener(buildingDoc.placemarks[i].polygon, 'mouseover', function(event) {
    if (selectedBuilding != i/* || buildingDoc.placemarks[i].vars.val.style == "transparent"*/) {
      buildingDoc.placemarks[i].polygon.setOptions(mouseoverStyle[buildingDoc.placemarks[i].vars.val.style]);
    }
  });
  
  google.maps.event.addListener(buildingDoc.placemarks[i].polygon, 'mouseout', function(event) {
    if (selectedBuilding != i/* || buildingDoc.placemarks[i].vars.val.style == "transparent"*/) {
      buildingDoc.placemarks[i].polygon.setOptions(mouseoutStyle[buildingDoc.placemarks[i].vars.val.style]);
    }
  });
  
  google.maps.event.addListener(buildingDoc.placemarks[i].polygon, 'click', function(event) {
    dontHash = true;
    displayInfo(buildingDoc, i, true);
  });
}

var diningActive = false,
  parkingActive = false,
  spiritualActive = false,
  sustainabilityActive = false,
  greenspacesActive = false,
  collegiaActive = false,
  galleriesActive = false;
  
function activateCategory(index) {
  
  var categories = [
      "dining",
      "parking",
      "spiritual",
      "sustainability",
      /* "greenspaces",*/
      "collegia",
      "galleries"
    ],
    iconColor = [
      "https://static.seattleu.edu/map/images/icons/icon-food-and-drink.png",
      "https://static.seattleu.edu/map/images/icons/icon-parking.png",
      "https://static.seattleu.edu/map/images/icons/icon-sacred-spaces.png",
      "https://static.seattleu.edu/map/images/icons/icon-sustainability.png",
      /*"https://static.seattleu.edu/map/images/icons/icon-sustainability2.png",*/
      "https://static.seattleu.edu/map/images/icons/icon-collegia.png",
      "https://static.seattleu.edu/map/images/icons/icon-galleries.png"
    ],
    iconGrey = [
      "https://static.seattleu.edu/map/images/icons/icon-food-and-drink-grey.png",
      "https://static.seattleu.edu/map/images/icons/icon-parking-grey.png",
      "https://static.seattleu.edu/map/images/icons/icon-sacred-spaces-grey.png",
      "https://static.seattleu.edu/map/images/icons/icon-sustainability-grey.png",
      /*"https://static.seattleu.edu/map/images/icons/icon-sustainability2-grey.png",*/
      "https://static.seattleu.edu/map/images/icons/icon-collegia-grey.png",
      "https://static.seattleu.edu/map/images/icons/icon-galleries-grey.png"
    ];
    
  var elem = "." + categories[index] + "Title";
  var icon = "." + categories[index] + "Icon";
  var KML = categories[index] + "Doc";
  var status = categories[index] + "Active";
  
  if (allowClick == true || $("#navigation_list").is(":visible")) {
  //console.log("wrapper click");
    if (window[status] == false) {
      for (var i = 0; i < window[KML].markers.length; i++) {
        window[KML].markers[i].setMap(map);
      }
      $(icon+".active").show();
      $(icon+".inactive").hide();
      window[status] = true;
    }
    else {
      for (var i = 0; i < window[KML].markers.length; i++) {
        window[KML].markers[i].setMap(null);
      }
      $(icon+".active").hide();
      $(icon+".inactive").show();
      window[status] = false;
      if (oldDoc == window[KML]) {
        closeInfo();
      }
    }
    allowClick = false;
    setTimeout(closeNavigation, 250);
  }
}

function categoryListener() { // For label-based categories

  $(".diningWrapper").on('click', function() {
    activateCategory(0);
  });

  $(".parkingWrapper").on('click', function() {
    activateCategory(1);
  });

  $(".spiritualWrapper").on('click', function() {
    activateCategory(2);
  });

  $(".sustainabilityWrapper").on('click', function() {
    activateCategory(3);
  });

  $(".collegiaWrapper").on('click', function() {
    activateCategory(4);
  });

  $(".galleriesWrapper").on('click', function() {
    activateCategory(5);
  });

  var overlayBounds = new google.maps.LatLngBounds( new google.maps.LatLng(47.606334, -122.32066), new google.maps.LatLng(47.612780, -122.313137) );
  wheelchairOverlay = new google.maps.GroundOverlay("overlay/wheelchair-overlay-a.png", overlayBounds);
  var wheelchairActive = false;
  $(".wheelchairWrapper").on('click', function() {
    if (allowClick == true) {
      if (wheelchairActive == false) {
        wheelchairOverlay.setMap(map);
        $(".wheelchairIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-wheelchair.png");
        wheelchairActive = true;
      }
      else {
        wheelchairOverlay.setMap(null);
        $(".wheelchairIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-wheelchair-grey.png");
        wheelchairActive = false;
      }
      allowClick = false;
      setTimeout(closeNavigation, 250);
    }
  });
  
  // Disable hash check when category is clicked -- normal method doesn't work due to 250ms delay on closeNavigation()
  $(".categoryWrapper").on('click', function() {
    allowHashCheck = false;
  });
  
}

var theScroll;

function navigationFill() { // Fills the navigation menu with all buildings
  
  // Empty category layout
  $(".academicList").empty();
  $(".residentialList").empty();
  $(".administrativeList").empty();
  $(".recreationalList").empty();
  /*$(".greenspaceList").empty();*/
  
  // Empty alphabet layout
  alphabetLayout.empty();
  
  // Append buildings to categoryLayout
  for (i = 0; i < buildingDoc.placemarks.length; i++) {
    
    // Create HTML string for building
    var listString = "<li class=\"buildingList\"><a href=\"#" + buildingDoc.placemarks[i].vars.val.abbreviation + "\" onclick=\"displayInfo(buildingDoc, " + i + ", false)\">" + buildingDoc.placemarks[i].name + "</a></li>";
    
    // Append to category layout in proper category
    var divID = "." + buildingDoc.placemarks[i].vars.val.category + "List";
    $(divID).append(listString);
    
    // Set style
    if (buildingDoc.placemarks[i].vars.val.style != "transparent") {
      buildingDoc.placemarks[i].polygon.setOptions(searchOpacity["full"]);
    }
    
  }
  
  // Append all placemarks to alphabetLayout
  for (i = 0; i < completePlacemarks.length; i++) {
    
    // Create HTML string for placemark
    var listString = "<li class=\"buildingList\"><a href=\"#" + completePlacemarks[i].vars.val.abbreviation + "\" onclick=\"displayInfo(" + completeDocs[i] + ", " + completeIds[i] + ", false)\">" + completePlacemarks[i].name + "</a></li>";
    
    // Append to alphabetLayout
    alphabetLayout.append(listString);
    
  }
  
  /*
  // Sort alphabetLayout on desktop
  var mylist = $('.alphabetLayout.desktop');
  var listitems = mylist.children('li').get();
  listitems.sort(function(a, b) {
     return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
  })
  $.each(listitems, function(idx, itm) { mylist.append(itm); });
  
  // Sort alphabetLayout on mobile
  var mylist = $('.alphabetLayout.mobile');
  var listitems = mylist.children('li').get();
  listitems.sort(function(a, b) {
     return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
  })
  $.each(listitems, function(idx, itm) { mylist.append(itm); });
  */
  
  // Animate glyphicons on category click
  /*
  $(".categoryLayout.mobile em").on("click", function() {
    //console.log("menu item clicked");
    //console.log(this);
    if ($(this).css("transform") == "none") {
      $(this).animate({
        transform: 'rotate(90deg)',
        MozTransform: 'rotate(90deg)',
        WebkitTransform: 'rotate(90deg)',
        msTransform: 'rotate(90deg)'
      }, 250);
    }
    else {
      // Undo
    }
  });
  */
  
}

var isCategoryView = true;
var currentView = "category";

function showCategory(clicked) { // Category view
  $(".categoryButton").addClass("active");
  $(".alphabetButton").removeClass("active");
  $(".categoryLayout").css({"display": "block"});
  $(".markerLayout").css({"display": "block"});
  alphabetLayout.css({"display": "none"});
  if (clicked == true) {
    isCategoryView = true;
  }
  currentView = "category";
}

function showAlphabet(clicked) { // Alphabetic view
  $(".categoryButton").removeClass("active");
  $(".alphabetButton").addClass("active");
  $(".categoryLayout").css({"display": "none"});
  $(".markerLayout").css({"display": "none"});
  alphabetLayout.css({"display": "block"});
  if (clicked == true) {
    isCategoryView = false;
  }
  currentView = "alphabet";
}

var k;

var searchOpen = false,
  searchTimeout;

function navigationSearch() { // Limits navigation menu to buildings that match search

  //console.log("navigationSearch");

  clearTimeout(searchTimeout);

  //preventResize = true;
  
  if( searchBoxDesktop.is(":visible") ) {
    searchString = searchBoxDesktop.val();
  }
  else {
    searchString = searchBoxMobile.val();
    if (searchOpen == false) {
      //document.getElementById("searchList").setAttribute("style", "display: block !important");
      //searchList.addClass("displayHack");
      document.getElementById("searchList").className += " displayHack";
      $("#map_navigation_top").stop().animate({backgroundColorAlpha: 1});
      searchList.stop().animate({"opacity": 1});
      //console.log("white background");
      $("#menuButton").stop().animate({opacity: 0}, function(){$(this).hide()});
      $("#backButton").stop().show().animate({opacity: 1});
      //searchList.css("height", window.innerHeight-100);
      searchOpen = true;
    }
  }
  
  /*
  $(".searchBox").unbind('focus blur touchstart')
  .on('focus blur', function() {
    alert(window.innerHeight, window.outerHeight);
    searchList.css("height", window.innerHeight-100);
  });
  */
  
  searchList.off('touchstart.blur')
  .on('touchstart.blur', function() {
    searchBox.trigger('blur');
  });
  
  // Hide mobile keyboard on enter
  searchBoxMobile.off('keypress.enter')
  .on('keypress.enter', function(e) {
    if ( (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13) ) {
      $(this).blur();
    }
  });
  
  var hits = 0;
  
  if (searchString.length == 0) {
    //console.log("nothing");
    $("body").unhighlight();
    navigationFill();
    $(".btn-group").removeAttr("style");
    $("#navigation_list").css("top", "170px");
    if(isCategoryView == true) {
      showCategory(false);
    }
    else {
      showAlphabet(false);
    }
    //searchList.empty().append("<p style=\"text-align: center;\">Search by title, description, or abbreviation</p>");
    document.getElementById("searchList").innerHTML = "<p style=\"text-align: center;\">Search by title, description, or abbreviation</p>";
  }
  
  else {
    
    searchTimeout = window.setTimeout(function() {
    
      // Empty alphabet layout, reset variable
      //console.log("opening list");
      $(".alphabetLayout.desktop, #searchList").empty().append("<ul></ul>");
      var listString = "";
      
      for (i = 0; i < completePlacemarks.length; i++) {
        
        // Search by name
        var nameHits = completePlacemarks[i].name.search(new RegExp(searchString, "i"));
        
        // Search by description (if it exists)
        var descHits = descriptionItemsParsed[i].search(new RegExp(searchString, "i"));
        
        // Search by abbreviation
        //if (completePlacemarks[i].vars.val.abbreviation) {
          var abbrHits = completePlacemarks[i].vars.val.abbreviation.search(new RegExp(searchString, "i"));
        //}
  
        // If any of the categories got a hit...
        if (nameHits >= 0 || descHits >= 0 || abbrHits >= 0) {
          
          // Open list item
          listString += "<li><a onclick=\"displayInfo(" + completeDocs[i] + ", " + completeIds[i] + ", false); closeSearch()\">" + completePlacemarks[i].name + "</a>";
          
          // Get matching portion of description
          //if (descHits >= 0) {
            
            listString += "<p class=\"descriptionSearch\">";
            
            var start = descHits - 50;
            if (start <= 0) {
              start = 0;
              listString += "...";
            }
            
            var length = searchString.length + 100;
            //console.log(length);
            var end = start + length;
            if (end > descriptionItemsParsed[i].length) {
              length = length - (end - descriptionItemsParsed[i].length);
            }
            
            var descDisplay = descriptionItemsParsed[i].substr(start, length);
            
            listString += descDisplay + "...</p>";
            
          //}
  
          // Close list item
          listString += "</li>";
          
          if (completeDocs[i] == "buildingDoc" && buildingDoc.placemarks[completeIds[i]].vars.val.style != "transparent") {
            buildingDoc.placemarks[completeIds[i]].polygon.setOptions(searchOpacity["full"]);
          }
          
          hits++;
          var theOne = i;
        }
        else {
          if (completeDocs[i] == "buildingDoc" && buildingDoc.placemarks[completeIds[i]].vars.val.style != "transparent") {
            buildingDoc.placemarks[completeIds[i]].polygon.setOptions(searchOpacity["transparent"]);
          }
        }
        
      }
      
      // Append to alphabet layout
      //console.log("adding list item");
      $(".alphabetLayout.desktop, #searchList ul").append(listString);
      
      /*
      // Sort mobile list
      var mylist = $('#searchList ul');
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
         return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
      })
      $.each(listitems, function(idx, itm) { mylist.append(itm); });
      
      // Sort desktop list
      var mylist = $('.alphabetLayout.desktop');
      var listitems = mylist.children('li').get();
      listitems.sort(function(a, b) {
         return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
      })
      $.each(listitems, function(idx, itm) { mylist.append(itm); });
      */
      
      // If no hits
      if (hits == 0) {
        // Empty lists and append "no results" message
        var noResults = "<p style=\"text-align: center;\">No results found</p>";
        $(".alphabetLayout.desktop, #searchList").empty().append(noResults);
      }
      
      $("body").unhighlight();
      $(".alphabetLayout, #searchList").highlight(searchString);
      $("#navigation_list").css("top", "130px");
      //document.getElementById("navigation_list").style.top = "130px";
      
      if( searchBoxDesktop.is(":visible") ) {
        $(".btn-group").css("display", "none");
        showAlphabet(false);
      }
      //console.log("closing list");
    
    }, 500);
  }
    
  /* Mobile stuff */
  //document.getElementById("searchList").setAttribute("style", "display: block !important");
  /*
  $("#searchList a").on('click', function(){
    //console.log("closing search");
    //console.log("culprit");
    closeSearch();
  });
  */
  //searchBoxMobile.blur(function(){closeSearch()});
  
  if (window.location.hash != "#SEARCH") {
    hashMemory = window.location.hash;
    window.location.hash = "#SEARCH";
  }
}

function closeSearch() {
  
  $("#menuButton").stop().show().animate({opacity: 1});
  $("#map_navigation_top").stop().animate({backgroundColorAlpha: 0});
  $("#backButton").stop().animate({ opacity: 0 }, function(){$(this).hide()});
  searchList.stop().animate({
    opacity: 0
  }, function() {
    //searchList.removeClass("displayHack");
    var d = document.getElementById("searchList");
    d.className = d.className.replace( /(?:^|\s)displayHack(?!\S)/ , '' );
  });
  searchOpen = false;
  for (i = 0; i < buildingDoc.placemarks.length; i++) {
    if (buildingDoc.placemarks[i].vars.val.style != "transparent") {
      buildingDoc.placemarks[i].polygon.setOptions(searchOpacity["full"]);
    }
  }
  searchBoxMobile.blur();
  if (window.location.hash != "") {
    window.location.hash = hashMemory;
  }
  
}

var oldId,
  oldDoc;

var originalHeight;

var maxWidth, maxHeight = 0,
  orientation;
  
var preventResize = false;

var bound = false;

var marker; // This is the blue pin

var infoOpen = false; // Keeps track of info_bottom being open or closed for window resize

function displayInfo(doc, id, clicked) { // Display information about building using <description> from KML

  //console.log("displaying");

  //if (doc.placemarks[id].vars.val.abbreviation) { // REMOVE IF STATEMENT WHEN ALL KML ITEMS HAVE ABBREVIATION
    window.location.hash = doc.placemarks[id].vars.val.abbreviation;
  //}

  document.getElementById("info_window").removeAttribute("style"); // Reset info_window scaling

  // If something was previously selected...
  if (oldId != null) {
    if (oldDoc == buildingDoc) { // If it was a building...
      // ...reset its style
      buildingDoc.placemarks[oldId].polygon.setOptions(normalStyle[buildingDoc.placemarks[oldId].vars.val.style]);
    }
    else { // If it was a marker...
      marker.setMap(null); // Remove it from the map
    }
  }
  
  var newCenter;
  
  // If we're dealing with a building (i.e. a polygon)...
  if (doc == buildingDoc) {
    selectedBuilding = id;
    buildingDoc.placemarks[id].polygon.setOptions(clickStyle[buildingDoc.placemarks[id].vars.val.style]);
    // Move polygon to center so it's visible
    newCenter = buildingDoc.placemarks[id].polygon.bounds.getCenter();
  }
  // If we're dealing with a category (i.e. markers)...
  else {
    doc.markers[id].setZIndex(998);
    var location = new google.maps.LatLng(doc.placemarks[id].Point.coordinates[0].lat, doc.placemarks[id].Point.coordinates[0].lng);
    marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: "https://static.seattleu.edu/map/images/icons/pin.png",
      zIndex: 999,
      optimized: false
    });
    if (doc == diningDoc) {
      if (diningActive == false) {
        for (var i = 0; i < diningDoc.markers.length; i++) {
          diningDoc.markers[i].setMap(map);
        }
        $(".diningIcon.active").show();
        $(".diningIcon.inactive").hide();
        //$(".diningIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-food-and-drink.png");
        diningActive = true;
      }
    }
    else if (doc == parkingDoc) {
      if (parkingActive == false) {
        for (var i = 0; i < parkingDoc.markers.length; i++) {
          parkingDoc.markers[i].setMap(map);
        }
        $(".parkingIcon.active").show();
        $(".parkingIcon.inactive").hide();
        //$(".parkingIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-parking.png");
        parkingActive = true;
      }
    }
    else if (doc == spiritualDoc) {
      if (spiritualActive == false) {
        for (var i = 0; i < spiritualDoc.markers.length; i++) {
          spiritualDoc.markers[i].setMap(map);
        }
        $(".spiritualIcon.active").show();
        $(".spiritualIcon.inactive").hide();
        //$(".spiritualIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-sacred-spaces.png");
        spiritualActive = true;
      }
    }
    else if (doc == sustainabilityDoc) {
      if (sustainabilityActive == false) {
        for (var i = 0; i < sustainabilityDoc.markers.length; i++) {
          sustainabilityDoc.markers[i].setMap(map);
        }
        $(".sustainabilityIcon.active").show();
        $(".sustainabilityIcon.inactive").hide();
        //$(".sustainabilityIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-sustainability.png");
        sustainabilityActive = true;
      }
    }
    else if (doc == collegiaDoc) {
      if (collegiaActive == false) {
        for (var i = 0; i < collegiaDoc.markers.length; i++) {
          collegiaDoc.markers[i].setMap(map);
        }
        $(".collegiaIcon.active").show();
        $(".collegiaIcon.inactive").hide();
        //$(".collegiaIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-collegia.png");
        collegiaActive = true;
      }
    }
    else if (doc == galleriesDoc) {
      if (galleriesActive == false) {
        for (var i = 0; i < galleriesDoc.markers.length; i++) {
          galleriesDoc.markers[i].setMap(map);
        }
        $(".galleriesIcon.active").show();
        $(".galleriesIcon.inactive").hide();
        //$(".galleriesIcon").attr("src", "https://static.seattleu.edu/map/images/icons/icon-galleries.png");
        galleriesActive = true;
      }
    }
    newCenter = doc.placemarks[id].latlng;
  }
  
  setTimeout(function() {
    map.panTo(newCenter);
  }, 200);
  
  if (clicked == false || map.getZoom() < 16) { // If placemark was selected from a menu and not from the map...
    // Set reasonable zoom level
    //if (map.getZoom() < 16) {
      map.setZoom(16);
    //}
  }
  
  oldId = id; // This is now the oldId
  oldDoc = doc; // This is now the oldDoc
  
  var infoContent; // Placeholder for info content
  
  // Clear old content
  $("#info_window .content, #info_bar .content").empty();
  document.getElementById("info_bottom_title").innerHTML = "";
  document.getElementById("info_bottom_content").innerHTML = "";
  
  // Add building name
  infoContent = "<h2>" + doc.placemarks[id].name + "</h2>";
  if (doc.placemarks[id].vars.val.category) {
    infoContent += "<h4>" + doc.placemarks[id].vars.val.category.charAt(0).toUpperCase() + doc.placemarks[id].vars.val.category.slice(1) + "</h4>";
  }
  if (doc.placemarks[id].vars.val.secondary) {
    infoContent += "<h4>" + doc.placemarks[id].vars.val.secondary.charAt(0).toUpperCase() + doc.placemarks[id].vars.val.secondary.slice(1) + "</h4>";
  }
  
  // Append top content to info_bottom_title and other info divs
  $("#info_window .content, #info_bar .content").append(infoContent);
  //document.getElementById("info_bar").innerHTML += infoContent;
  document.getElementById("info_bottom_title").innerHTML += infoContent;
  
  // Add and append KML description (already in HTML format)
  if (doc.placemarks[id].description) {
    infoContent = doc.placemarks[id].description;
    $("#info_window .content, #info_bar .content").append(infoContent);
    //document.getElementById("info_bar").innerHTML += infoContent;
    document.getElementById("info_bottom_content").innerHTML += infoContent;
  }
  
  if (searchString.length != 0) { 
    $(".alphabetLayout, #searchList, .buildingDescription").highlight(searchString); // In case the info_window was switched, highlight content that matches searchString again
  }
  
  // Display various infos
  //makeInfoVisible = function() {
    resizeInfo();
    document.getElementById("info_window").style.visibility = "visible";
    document.getElementById("info_window").style.opacity = "1";
    document.getElementById("info_bar").removeAttribute("style");;
    document.getElementById("info_bottom").removeAttribute("style");
  //}
  /*
  if ($(".slider").length != 0) {
    $(".slider img").load(function() { // <-- THIS PORTION IS ONLY NECESSARY IF SLICK SLIDER HEIGHT ISN'T DEFINED (I THINK)
      makeInfoVisible();
    });
  } else {
    makeInfoVisible();
  }
  */
  
  // Close mobile navigation
  hashMemory = window.location.hash;
  closeNavigation();
  
  $('.slider').slick({
    autoplay: true,
    autoplaySpeed: 10000,
    infinite: true,
    dots: true
  });
  
  // Slide in info_bar
  infoBar.stop().animate({
    right: "0px"
  }, 400);
  
  // Slide up info_bottom
  var topHack = $("#map_canvas").height().toString() + "px";
  infoBottom.css({
    "top": topHack,
    "bottom": "0px"
  });
  //if (infoBottom.find('h4').length) {
  //  var handleHeight = infoBottom.find('h4').last().position().top + infoBottom.find('h4').last().height() + 19;
  //}
  //else {
    var handleHeight = infoBottomTitle.position().top + infoBottomTitle.height() + 19;
  //}
  infoBottomContent.css({top: handleHeight.toString() + "px"});
  
  // Vertically center info_bottom close button
  var closeTop = ((handleHeight / 2) - 10).toString() + "px";
  infoBottom.find("#info_close").css({"top": closeTop});
  
  
  var position = parseInt(topHack) - handleHeight,
    positionString = position.toString() + "px";
  if (infoOpen == false) {
    var topString = positionString;
  }
  else {
    var topString = "0px";
  }
  infoBottom.stop().animate({
    top: topString,
    //bottom: "0px"
  }, 400);
  
  // Set draggable handle height
  /* MERGE INTO ONE COMMAND */
  infoBottomDrag.css({height: handleHeight.toString() + "px"});
  infoBottomClose.css({height: handleHeight.toString() + "px"});
  infoBottomCover.css({height: handleHeight.toString() + "px"});
  
  // Make info_bottom draggable
  var ySnap = position - 50,
    touch = {},
    //originalTop = positionString,
    sliderClosed = true,
    dragCheck = false,
    wasSlidingUp = false;
  
  infoBottom.draggable({
    axis: "y",
    handle: "#info_bottom_drag",
    containment: [0, $("#wrapTheMap").offset().top],
    start: function (event, ui) {
      //console.log("start");
      originalTop = infoBottom.css("top");
      touch.startPos = $(this).offset().top;
      touch.oldPos = $(this).offset().top;
      //console.log("initial:" + touch.oldPos);
      touch.direction = null;
      var d = new Date();
      touch.startTime = d.getTime();
      dragCheck = true;
    },
    drag: function (event, ui) {
      if (touch.direction == null || touch.direction == 0) {
        touch.direction = touch.oldPos - $(this).offset().top;
        //console.log("touch.direction"+touch.direction);
      } else {
        if ( (touch.direction > 0 && (touch.oldPos - $(this).offset().top) < 0) || (touch.direction < 0 && (touch.oldPos - $(this).offset().top) > 0) ) {
          touch.direction = touch.oldPos - $(this).offset().top;
          touch.startPos = $(this).offset().top;
          var d = new Date();
          touch.startTime = d.getTime();
        }
        if (touch.direction > 0) {
          wasSlidingUp = true;
        }
      }
      touch.oldPos = $(this).offset().top;
    },
    stop: function (event, ui) {
      //console.log("stop");
      touch.endPos = $(this).offset().top;
      var d = new Date();
      touch.endTime = d.getTime();
      touch.time = touch.endTime - touch.startTime; // in milliseconds
      touch.velocity = (touch.startPos - touch.endPos) / touch.time;
      //console.log(originalTop);
      //console.log(touch.velocity);
      if (sliderClosed == true) {
        if (touch.velocity > 0.3) {
          //console.log("opening");
          searchBoxMobile.prop('disabled', true);
          infoBottom.stop().animate({top: "0px"}, 200, "easeOutSine").css({
            //bottom: "0px",
            //height: "auto"
          });
          sliderClosed = false;
        }
        else if (touch.velocity < -0.15 && wasSlidingUp == false) {
          closeInfo(100);
        }
        else {
          infoBottom.stop().animate({top: positionString}, 200, "easeOutSine");
        }
      }
      else {
        if (touch.velocity < -0.3) {
          //console.log("closing");
          infoBottom.stop().animate({top: positionString}, 200, "easeOutSine", function() {
            //console.log("working");
            searchBoxMobile.prop('disabled', false);
          });
          sliderClosed = true;
        }
        else {
          infoBottom.stop().animate({top: "0px"}, 200, "easeOutSine");
        }
      }
      dragCheck = false;
      wasSlidingUp = false;
    }
  });
  
  var touchClick = {};
    
  infoBottomDrag.off('touchstart touchend')
  /*.on('touchstart touchmove', function(e) {
    e.preventDefault();
  })*/
  .on('touchstart', function() {
    var d = new Date();
    touchClick.start = d.getTime();
  }).on('touchend', function() {
    //console.log("clicked");
    if (dragCheck == false) {
      //console.log("no drag");
      var d = new Date();
      touchClick.end = d.getTime();
      touchClick.time = touchClick.end - touchClick.start;
      if (touchClick.time < 300) {
        if (sliderClosed == true) {
          //console.log("opening");
          searchBoxMobile.prop('disabled', true);
          infoBottom.stop().animate({top: "0px"}, 300, "easeOutSine");
          sliderClosed = false;
        }
        else {
          //console.log("closing");
          infoBottom.stop().animate({top: positionString}, 300, "easeOutSine", function() {
            //console.log("working");
            searchBoxMobile.prop('disabled', false);
          });
          sliderClosed = true;
        }
      }
    }
  });
  
}

function resizeInfo() {
  
  // Desktop
  var fixedHeight = $("#wrapTheMap").height() - 74;

   // Make sure info_window's originalHeight doesn't extend past browser window AND RESIZE MAP ELEMENTS
  if ( document.getElementById("info_window").scrollHeight > fixedHeight ) { // If it does...
    document.getElementById("info_window").style.height = fixedHeight + "px"; // ...set height to fit window
  }
  else { // If it doesn't...
    document.getElementById("info_window").style.height = "auto"; // ...leave it be
  }

  // Set map elements top to height of header
  $("#wrapTheMap, #warning_message").css("top", $(".navbar-wrapper").height() + "px");
  
  
}

function closeInfo(ms) { // Self-explanatory

  searchBoxMobile.prop('disabled', false);

  //console.log("closeInfo");

  // Hide info_window
  document.getElementById("info_window").style.visibility = "hidden";
  document.getElementById("info_window").style.opacity = "0";
  
  //console.log(ms);
  
  // Slide out info_bar then set display:none
  infoBar.stop().animate({
    right: "-400px"
  }, ms, function() {
        document.getElementById("info_bar").setAttribute('style', 'display:none !important');
    });
  
  // Slide down info_bottom then set display:none
  var topHack = $("#map_canvas").height().toString() + "px";
  infoBottom.stop().animate({
    top: topHack
  }, ms, function() {
        document.getElementById("info_bottom").removeAttribute("style");
    });
    
  if (oldId || oldId == 0) {
    buildingDoc.placemarks[oldId].polygon.setOptions(normalStyle[buildingDoc.placemarks[oldId].vars.val.style]);
    buildingDoc.placemarks[oldId].polygon.setOptions(mouseoutStyle[buildingDoc.placemarks[oldId].vars.val.style]);
  }
  
  if (marker) {
    marker.setMap(null);
  }
  
  oldId = null;
  oldDoc = null;
  selectedBuilding = null;
  
  if (window.location.hash != "") {
    window.location.hash = "";
  }
  
}

var firstRun = true;

function checkHash() {
  
  //$(document).ready(function() {
    //console.log("hashing");
    if (window.location.hash /*&& firstRun == true*/) {
      //console.log("hashed");
      var hash = window.location.hash.substring(1);
      for (var i = 0; i < completePlacemarks.length; i++) {
        if (completePlacemarks[i].vars.val.abbreviation == hash) {
          displayInfo(window[completeDocs[i]], completeIds[i], false);
        }
      }
      firstRun = false;
    }
  //});
  
}

var navigationOpen = false;

function expandNavigation() { 
    
    if (navigationOpen == false) {
        openNavigation();
    }

    else {
        closeNavigation();
    }
    
}

var clickHasRun = false,
  allowClick = true;

function openNavigation() {
  navigationOpen = true;
  //$("#map_navigation_top").css("height", "100%");
  navigationListTopWrapper.css("display", "block")
  .animate({left: "0%", right: "0%"}, 350, "easeOutSine");
  $("#map_overlay").css("display", "block").animate({opacity: 0.75}, 350, "easeOutSine");
  
  // Make info_bottom draggable
  var originalLeft,
    pixels = 0,
    touch = {},
    sliderClosed = true,
    dragCheck = false,
    ranDrag = false,
    width = navigationListTop.outerWidth();
    
  navigationListTopWrapper.draggable({
    axis: "x",
    containment: [-width, 0, 0, 0],
    delay: 60,
    start: function (event, ui) {
      //console.log("start");
      originalLeft = ui.position.left;
      touch.startPosX = event.pageX;
      //touch.startPosY = event.pageY;
      var d = new Date();
      touch.startTime = d.getTime();
      dragCheck = true;
    },
    drag: function(event, ui) {
      //console.log("drag");
      //if (ranDrag == false) {
        if (disabler == true) {
          //console.log("aborting");
          return false;
        }
      //}
      ranDrag = true;
      $("#map_overlay").css("opacity", Math.abs((ui.position.left + width) / width) * 0.75);
    },
    stop: function (event, ui) {
      if (disabler != true) {
        //console.log("stop");
        touch.endPosX = event.pageX;
        //touch.endPosY = event.pageY;
        var d = new Date();
        touch.endTime = d.getTime();
        touch.time = touch.endTime - touch.startTime; // in milliseconds
        //console.log(touch.time);
        touch.velocityX = (touch.startPosX - touch.endPosX) / touch.time;
        //console.log(touch.velocityX);
        // When quickly tapping between Category and Alphabet buttons, navigation can unexpectedly close due to a false drag. However, these drags are never more than 50ms, hence the if statement.
        if (touch.velocityX > 0.15) {
          closeNavigation();
        }
        else {
          openNavigation();
        }
        //navigationListTopWrapper.draggable( "option", "disabled", false);
        //pixels = 0;
        navigationListTop.css("overflow", "auto");
        dragCheck = false;
        ranDrag = false;
      }
    }
    
  });
  
  // Disable dragging navigation if vertical scroll occurs
  var disabler = false,
    disableScroll = false,
    ranCheck = false;
  navigationListTopWrapper//.off('touchstart touchmove touchend')
  .on('touchstart.navDrag', function(event){
    //console.log("start");
    touch.startPosX = event.originalEvent.touches[0].screenX;
    touch.startPosY = event.originalEvent.touches[0].screenY;
  })
  .on('touchmove.navDrag', function(event){
    //console.log("move");
    if (ranCheck == false) {
      //console.log("ranCheck");
      touch.distanceX = Math.abs(touch.startPosX - event.originalEvent.touches[0].screenX);
      touch.distanceY = Math.abs(touch.startPosY - event.originalEvent.touches[0].screenY);
      //console.log(touch.distanceX, touch.distanceY);
      if (!isNaN(touch.distanceX)) {
        if (touch.distanceX <= touch.distanceY) {
          disabler = true;
        }
        else {
          disableScroll = true;
        }
      }
    }
    ranCheck = true;
    if (disableScroll == true) {
      event.preventDefault();
    }
  })
  .on('touchend.navDrag', function(){
    //console.log("end");
    disabler = false;
    disableScroll = false;
    ranCheck = false;
  });
  
  // If an item is tapped in the navigation, preventDefault() and let touch-punch take care of it
  navigationListTop.find(".categoryWrapper")//.unbind('touchstart touchend click')
  .on('touchstart.navClick', function(){
    allowClick = true;
  });
  
  if (window.location.hash != "#NAV") {
    hashMemory = window.location.hash;
    window.location.hash = "#NAV";
  }
  //console.log(hashMemory);
}

function closeNavigation() {
  
  navigationOpen = false;
  $("#map_overlay").animate({opacity: 0}, 350, function() {
    $(this).css("display", "none");
  });
  navigationListTopWrapper.stop().animate({left: "-250px", right: "250px"}, 350, function() {
    $(this).css("display", "none");
  });
  if (window.location.hash != "") {
    window.location.hash = hashMemory;
  }
  navigationListTopWrapper.off('touchstart.navDrag touchmove.navDrag touchend.navDrag');
  navigationListTop.find(".categoryWrapper").off('touchstart.navClick touchend.navClick click.navClick');
  //console.log("listener reset");
}

google.maps.event.addDomListener(window, 'load', initialize);



/* Debug functions */

function hideOverlay() {
  campusOverlay.setMap(null);
}

function showOverlay() {
  campusOverlay.setMap(map);
}

function hidePolygons() {
  for (i = 0; i < buildingDoc.placemarks.length; i++) {
    buildingDoc.gpolygons[i].setMap(null);
  }
}

function showPolygons() {
  for (i = 0; i < buildingDoc.placemarks.length; i++) {
    buildingDoc.gpolygons[i].setMap(map);
  }
}

/* The complex process of checking hashes */

var hashMemory = "",
  allowHashCheck = true,
  ranOnce = false,
  oldHash = window.location.hash;

$("#wrapTheMap").on("click touchend", function() { // Seems to occur before hashchange
  if (oldHash != window.location.hash) {
    allowHashCheck = false;
    //console.log("disallowed");
  }
  oldHash = window.location.hash;
});

$(window).on("hashchange", function() {
  //console.log("hashchange");
  //alert(allowHashCheck);
  if (allowHashCheck == true /*&& ranOnce == false*/) {
    //console.log("allowed");
    historyHash();
    ranOnce = true;
  }
  /*
  else if (ranOnce == true) {
    ranOnce = false;
  }
  */
  allowHashCheck = true;
  //console.log(window.location.hash);
});

var lastHash;

function historyHash() {
  //console.log("checking");
  //console.log(window.location.hash);
  if (window.location.hash == "") {
    //console.log("empty hash");
    closeNavigation();
    //console.log("culprit");
    closeSearch();
    closeInfo(350);
  }
  else if (window.location.hash == "#NAV") {
    //console.log("opening navigation");
    openNavigation();
  }
  else if (window.location.hash == "#SEARCH") {
    navigationSearch();
  }
  else {
    //console.log("last hash: " + lastHash);
    //console.log("new hash: " + window.location.hash);
    if (lastHash == "#NAV") {
      //console.log("closing navigation");
      closeNavigation();
    }
    else if (lastHash == "#SEARCH") {
      //console.log("culprit");
      closeSearch();
    }
    else {
      checkHash();
    }
  }
  lastHash = window.location.hash;
  //console.log(lastHash)
}







