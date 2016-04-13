/* global THREE: true } */

var PX = PX || {}; 

var progressBarElement = $("#loaderBox");
var preloaderBG = $(".preloaderBG");
var preloaderFG = $(".preloaderFG");
//var progressBarTextElement = $("#progressBarText");
//var startButtonElement = $("#startButton");

var g_Stats = null;
var g_GUI = null;

var windowWidth, windowHeight;
var deviceContentScale = 1.0;

var gltfLoader = null;
var binLoader = null;

var artefactCamera = null;
var artefactScene = null;
var artefactSceneBSphere = null;
var artefactOrbitControls = null;
var tempIsLoaded = false;

var camera2d = null;
var camera = null;
var scene = null;
var renderer = null;
var element = null;
var container = null;
var canvas = null;
var context = null;
var bgCamera = null;
var bgScene = null;
var fgCamera = null;
var fgScene = null;

var composer = null;
var renderMainPass = null;
var effectBloomPass = null;
var effectCopyPass = null;

var bmFontDescriptor = null;

var map;
var markerCluster;
//var doLocationsGather = true;
//var visibleClustersCount = 0;
//var visibleMarkersCount = 0;

var zoomLevel = 0.0;
var prevZoomLevel = 0.0;

//var prevClickedLocationIndex = -1;

var cameraLookAtPoint = null;

var earthOrbitControls = null;

var sunLight = null;
var earth = null;
var locationMarkers = null;

// Raycaster
var g_Raycaster = null;
var g_Projector = null;

// Locations
var locationsDB = [];
var locationsIntroAnimDone = false;

// Earth rotation
var earthAccel = new THREE.Vector2();
var earthVel = new THREE.Vector2();
var earthVelDamp = 0.97;
var earthAngle = new THREE.Vector2();


// Timer
var startTime = 0.0;
var currentTime = 0.0;
var previousTime = 0.0;
var frameTime = 0.0;
//var frameRate = 0;
//var frameRateTimeCount = 0.0;
//var frameCount = 0;
var clock = new THREE.Clock();

// Interaction
var mouseX = 0.0;
var mouseY = 0.0;
var previousMouseX = 0.0;
var previousMouseY = 0.0;
var mouseDeltaX = 0.0;
var mouseDeltaY = 0.0;
var isMouseDown = false;
//var isMouseUp = false;
//var isMouseMoved = false;
//var isMouseClick = false;
var mouseVector = new THREE.Vector2();
var mouseVector3d = new THREE.Vector3();


$(window).unload(function(e) 
{
});

$(window).blur(function(e) 
{
});

$(window).focus(function(e) 
{
});


var ClusterOnClickCallback = function( uuid, object )
{
    //console.log( uuid, object);
};

THREE.DefaultLoadingManager.onProgress = function( item, loaded, total )
{
    var percentage = Math.round( ( loaded / total ) * 80.0 );
    //var str = parseInt( percentage ) + " %";
    //progressBarElement.text( "Loading: " + loaded + " / " + total + ". Item: " + item );
    //console.log( percentage );
    preloaderFG.css( "width", (percentage) + '%' );
};

//// KEEP PHONE AWAKE: IOS Safari
//iosSleepPreventInterval = setInterval(function () 
//{
//        window.location.href = "/new/page";
//        window.setTimeout(function () 
//        {
//                window.stop();
//        }, 0 );        
//}, 20000 );

function ParseBitmapFont( url )
{
	bmFontDescriptor = new BitmapFontDescriptor();
    bmFontDescriptor.Parse( url );
	//bmFontDescriptor.instantiate( url );
} 


function fullscreen() 
{
    //console.log( "+--+  Set fullscreen mode" );

    if (container.requestFullscreen) 
    {
        container.requestFullscreen();
    } 
    else if (container.msRequestFullscreen) 
    {
        container.msRequestFullscreen();
    } 
    else if (container.mozRequestFullScreen) 
    {
        container.mozRequestFullScreen();
    } 
    else if (container.webkitRequestFullscreen) 
    {
        container.webkitRequestFullscreen();
    }
}

function Shutdown()
{
    if (document.exitFullscreen)
    {
        document.exitFullscreen();
    }
    else if (document.msExitFullscreen)
    {
        document.msExitFullscreen();
    }
    else if (document.mozCancelFullScreen)
    {
        document.mozCancelFullScreen();
    }
    else if (document.webkitExitFullscreen)
    {
        document.webkitExitFullscreen();
    }

    //$("#main_container_id").removeClass("hidden");

    //UploadImage();
}


function CreateRenderer()
{
    var precision = "mediump";
    //var precision = "highp";

    renderer = new THREE.WebGLRenderer( { antialias: true, precision: precision, stencil: false, alpha: false } );
    renderer.setClearColor( 0x000000, 1 );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    element = renderer.domElement;
    container = document.getElementById( "glContainer" );
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.right = "0px";
    container.style.bottom = "0px";
    container.appendChild( element );

    renderer.autoClear = false;
    renderer.autoClearStencil = false;
    //renderer.sortObjects = false;
    //renderer.autoUpdateObjects = false;

    /*container.width = 1;
    container.height = 1;
    container.style.width = 1;
    container.style.height = 1;
    renderer.setSize( 1, 1 );
    windowWidth = container.width;
    windowHeight = container.height;
    deviceContentScale = renderer.devicePixelRatio;*/

    //container.width = window.innerWidth;// * window.devicePixelRatio;
    //container.height = window.innerHeight;// * window.devicePixelRatio;
    //container.style.width = window.innerWidth;
    //container.style.height = window.innerHeight;
    //renderer.setSize( container.width, container.height);
    //windowWidth = container.width;
    //windowHeight = container.height;
    //deviceContentScale = renderer.devicePixelRatio;
}

function LoadData()
{
    $.when(
        LoadTexture( "EarthDiffuseMap", "data/textures/earth_diffuse_blue.jpg" )
        //LoadTexture( "EarthDiffuseMap", "data/textures/earth_diffuse.jpg" )
        //LoadTexture( "EarthDiffuseMap", "data/textures/earth_diffuse_august.jpg" )
        , LoadTexture( "EarthNormalMap", "data/textures/earth_normals.png" )
        , LoadTexture( "EarthSpecularMap", "data/textures/earth_specular.jpg" )
        //, LoadTexture( "EarthCloudsMap", "data/textures/Clouds.png" )
        , LoadTexture( "EarthCloudsMap", "data/textures/earth_clouds.png" )
        //, LoadTexture( "EarthCloudsNormalMap", "data/textures/earth_clouds_normals.png" )
        , LoadTexture( "EarthNightLightsMap", "data/textures/earth_night_lights.jpg" )
        , LoadTexture( "Circle", "data/textures/circle_full.png" )
        , LoadShaderData("EarthVertexShader", "data/shaders/Earth.vertex")
        , LoadShaderData("EarthPixelShader", "data/shaders/Earth.fragment")
        , LoadJsonData("LocationsJson", "data/latlon.json")
        //, LoadTexture( "TextAtlasTex", "data/fonts/lucida_0.png" )
        //, LoadText( "TextAtlasXml", "data/fonts/lucida.xml" )
        , LoadTexture( "TextAtlasTex", "data/fonts/arialLargeTransparent.png" )
        , LoadText( "TextAtlasXml", "data/fonts/arialLarge.xml" )
    ).done(function ()
    {
        PostLoadData();
    } );
}

function PostLoadData()
{
    container.width = window.innerWidth;
    container.height = window.innerHeight;
    container.style.width = window.innerWidth;
    container.style.height = window.innerHeight;
    //
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.width, container.height);
    //console.log(container.width, container.height);
    //
    windowWidth = container.width;
    windowHeight = container.height;
    Params.WindowWidth = windowWidth;
    Params.WindowHeight = windowHeight;
    deviceContentScale = renderer.devicePixelRatio;

    BeginApp();
    preloaderBG.hide();
    preloaderFG.hide();
/*    preloaderBG.delay(100).fadeTo(1500, 0).delay(100);
    preloaderFG.delay(100).fadeTo(1500, 0).delay(100, function()
    {
        //
        BeginApp();

        // hide progress
        preloaderBG.hide();
        preloaderFG.hide();
    }); */
}


function InitLoaders()
{
	gltfLoader = new THREE.glTFLoader();
	binLoader = new THREE.BinaryLoader();
}

function LoadScene( url, scene )
{
    console.log( "+--  Load Scene:\t", url );

	var loadStartTime = Date.now();
	gltfLoader.load( url, function(data) 
    {
	    var root = data.scene;
     
	    scene.add( root );

        ComputeSceneBounds( scene );

        artefactSceneBSphere = ComputeWholeSceneBoundingSphere( scene );

    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--  Loaded Scene:\t  loadtime: ", loadTime );

    } );
}


function LoadBINScene( url, scene )
{
    console.log( "+--  Load BIN Scene:\t", url );

	var loadStartTime = Date.now();
	binLoader.load( url
    , function( geometry, materials ) 
    {
	    //console.log( geometry );
	    //console.log( materials );
        //for( var i=0; i<geometries.length; ++i )
        //{
            var material = materials[0];
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh( geometry, material ); 

            scene.add( mesh );
        //}

        ComputeSceneBounds( scene );

        artefactSceneBSphere = ComputeWholeSceneBoundingSphere( scene );
    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--  Loaded BIN Scene:\t  loadtime: ", loadTime );

    } 
    , function(result) 
    {
        var str = parseInt( ( result.loaded / result.total ) * 100 ) + " %";
        progressBarElement.text( "Loading: " + result.loaded + " / " + result.total );
        //console.log( "BIN on progress", result.loaded, result.total );
    }
    );
}


function ComputeSceneBounds( scene )
{
    scene.traverse( function (object) 
    {
        if( object instanceof THREE.Mesh )
        {
            //console.log( "compute bsphere 0", object );
            //object.geometry.computeBoundingSphere();
            object.needsUpdate = true;
            object.geometry.computeBoundingBox();
        }
        if( object instanceof THREE.Scene )
        {
            //console.log( "scene" );
            object.traverse( function (object2) 
            {
                if( object2 instanceof THREE.Mesh )
                {
                    //console.log( "compute bsphere 1", object );
                    //object2.geometry.computeBoundingSphere();
                    object2.geometry.computeBoundingBox();
                }
            });
        }
    } );
}


function ComputeWholeSceneBoundingSphere( scene )
{
    var sceneMin = new THREE.Vector3( 99999, 99999, 99999 );
    var sceneMax = new THREE.Vector3( -99999, -99999, -99999 );
    var sceneCenter = new THREE.Vector3();
    var radius = 0.0;

    scene.traverse( function (object) 
    {
        if( object instanceof THREE.Mesh )
        {
            var minOS = object.geometry.boundingBox.min.clone();
            var maxOS = object.geometry.boundingBox.max.clone();
            minOS = minOS.applyMatrix4( object.matrixWorld );
            maxOS = maxOS.applyMatrix4( object.matrixWorld );

            if( minOS.x < sceneMin.x ) sceneMin.x = minOS.x;
            if( minOS.y < sceneMin.y ) sceneMin.y = minOS.y;
            if( minOS.z < sceneMin.z ) sceneMin.z = minOS.z;
            if( maxOS.x > sceneMax.x ) sceneMax.x = maxOS.x;
            if( maxOS.y > sceneMax.y ) sceneMax.y = maxOS.y;
            if( maxOS.z > sceneMax.z ) sceneMax.z = maxOS.z;
        }
    });

    sceneCenter = sceneCenter.addVectors( sceneMin, sceneMax );
    radius = sceneCenter.length();
    sceneCenter = sceneCenter.divideScalar( 2.0 );
    //console.log( sceneCenter, sceneMin, sceneMax, radius );

    //var len = Math.max( sceneMin.x, sceneMax.x );
    var minLength = sceneMin.length();
    var maxLength = sceneMax.length();
    var len = Math.max( minLength, maxLength );

    // Reposition camera based on scene bounds
    //
    var distForCam = ( len * 1.0 ) / ( Math.tan( PX.ToRadians( PX.kCameraFovY ) * 0.5 ) );
    //console.log( "+--+  DistForCam", distForCam );

    artefactCamera.position.x = sceneCenter.x;
    artefactCamera.position.y = sceneCenter.y;
    artefactCamera.position.z = distForCam;

    //
    artefactOrbitControls.minDistance = distForCam * 0.2;
    artefactOrbitControls.maxDistance = distForCam * 2.0;
    artefactOrbitControls.target.set( sceneCenter.x, sceneCenter.y, sceneCenter.z );
    artefactOrbitControls.update();

    return new THREE.Vector4( sceneCenter.x, sceneCenter.y, sceneCenter.z, radius );
}


function BeginApp()
{
    //console.log( "DoIt" );

    container.width = window.innerWidth;
    container.height = window.innerHeight;
    container.style.width = window.innerWidth;
    container.style.height = window.innerHeight;
    renderer.setSize( container.width, container.height );
    windowWidth = container.width;
    windowHeight = container.height;
    deviceContentScale = renderer.devicePixelRatio;

    
    Setup();
    OnResize();
}


function ParseLocationData( locationsJson )
{
    // Parse Location Json
    for( var i=0; i<locationsJson.length; ++i )
    {
        var location = new Location();

        location.name = locationsJson[i]["marker_title"];
        location.latlon = new THREE.Vector2( locationsJson[i]["lat"], locationsJson[i]["lng"] );
        location.position = PX.Utils.FromLatLon( location.latlon.x, location.latlon.y, PX.kEarthScale, PX.kLocationMarkerScale * PX.kLocationMarkerZScale * 0.5 );
        locationsDB.push( location );
    }
}

function InitMarkerCluster()
{
    // @TESTBED:
    var center = new google.maps.LatLng( 0.0, 0.0 );
    map = new google.maps.Map(document.getElementById('map'), 
    {
        zoom: 0,
        center: center,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
        //mapTypeId: google.maps.MapTypeId.HYBRID
    });
    map.mapTypeControl = false;

    /*var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) 
    {
        var latLng = new google.maps.LatLng( locations[i].latlon.x, locations[i].latlon.y );
        bounds.extend( latLng );
    }
    map.fitBounds( bounds );*/

    var markers = [];
    for (var i = 0; i < locationsDB.length; i++) 
    {
        var latLng = new google.maps.LatLng( locationsDB[i].latlon.x, locationsDB[i].latlon.y );
        var marker = new google.maps.Marker(
        {
            position: latLng
        });
        markers.push(marker);
    }
    markerCluster = new MarkerClusterer( map );
    markerCluster.addMarkers( markers, true );
    markerCluster.setGridSize( Params.MapGridSize );
}


function Setup()
{
    // Parse locations from json
    ParseLocationData( PX.AssetsDatabase["LocationsJson"] );

    // Setup google maps API
    InitMarkerCluster();

    //
    InitLoaders();

    //
    ParseBitmapFont( PX.AssetsDatabase["TextAtlasXml"] );


    // Create main scene
    //
    scene = new THREE.Scene();


    //var minDim = Math.min( windowWidth, windowHeight );
    //var maxDim = Math.max( windowWidth, windowHeight );
    //var aspectRatio = maxDim / minDim;
    var aspectRatio = windowWidth / windowHeight;
    console.log( "+--+  Aspect Ratio:", aspectRatio );

    // Create camera
    //
    camera = new THREE.PerspectiveCamera( PX.kCameraFovY, aspectRatio, PX.kCameraNearPlane, PX.kCameraFarPlane );
    camera.updateProjectionMatrix();
    //var camPos = new THREE.Vector3( 0.0, 0.0, Params.CameraDistance );
    var camPos = PX.Utils.FromLatLon( PX.StartLatLon.x, PX.StartLatLon.y, Params.CameraDistance, 0.0 );
    camera.position.set( camPos.x, camPos.y, camPos.z );
    cameraLookAtPoint = PX.ZeroVector.clone();
    camera.lookAt( cameraLookAtPoint );
    scene.add( camera );

    // Create Globe
    //
    earth = new UG.Earth();
    earth.Init( scene );

    // Create locations
    //
    locationMarkers = new UG.LocationMarkers();
    locationMarkers.Init( locationsDB, markerCluster, bmFontDescriptor, scene );

    // Create scene's Sun light
    //
    sunLight = new THREE.DirectionalLight( 0xffffff );
    sunLight.position.set( 0.7, 0.0, 1.0 );
    scene.add( sunLight );


    // Update camera position to look at latlon: 0, 0
    //
    //var camPos = PX.Utils.FromLatLon( 0.0, 0.0, Params.CameraDistance, 0.0 );
    //camera.position.set( camPos.x, camPos.y, camPos.z );


    // Composer
    //
    renderMainPass = new THREE.RenderPass( scene, camera );
    effectBloomPass = new THREE.BloomPass( 1, 25, 5, 1024 );
    effectCopyPass = new THREE.ShaderPass( THREE.CopyShader );
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderMainPass );
    composer.addPass( effectBloomPass );
    composer.addPass( effectCopyPass );

    effectCopyPass.uniforms.opacity.value = 0.15;
    effectCopyPass.renderToScreen = true;


    // Artefact Scene
    //
    {
        artefactScene = new THREE.Scene();

        // Create Artefact camera
        //
        artefactCamera = new THREE.PerspectiveCamera( PX.kCameraFovY, aspectRatio, 0.01, 100.0 );
        artefactCamera.updateProjectionMatrix();
        artefactCamera.position = new THREE.Vector3( 0, 0, Params.Art_CameraDistance );
        var currentCamLookAt0 = new THREE.Vector3( 0, 0, 0 );
        artefactCamera.lookAt( currentCamLookAt0 );
        artefactScene.add( artefactCamera );

        // Create Artefact sun light
        //
        var artSunLight = new THREE.DirectionalLight( 0xffffff );
        artSunLight.position.set( 0.7, 0.0, 1.0 );
        artefactScene.add( artSunLight );
        var artAmbLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        artefactScene.add( artAmbLight );

        //
        //LoadBINScene( "data/models/06_Mihrab_of_the_Mosque_Al_Hasan/mesh.js", artefactScene );
        //LoadScene( "data/models/duck/glTF/duck.gltf", artefactScene );
        //LoadScene( "data/models/07_Sculpture_from_Hatra/sculpture.gltf", artefactScene );
        //LoadScene( "data/models/06_Mihrab_of_the_Mosque_Al_Hasan/Mihrab of the mosque al Hasan.gltf", artefactScene );

	    artefactOrbitControls = new THREE.OrbitControls( artefactCamera, renderer.domElement );
        artefactOrbitControls.enableDamping = true;
        artefactOrbitControls.dampingFactor = 0.05;
        artefactOrbitControls.rotateSpeed = 0.1;
        artefactOrbitControls.minDistance = 1.0;
        artefactOrbitControls.maxDistance = 5.0;
        artefactOrbitControls.target.set( 0, 0, 0 );
        artefactOrbitControls.update();
    }

/**
    // Background scene
    //
    bgScene = new THREE.Scene();
    bgCamera = new THREE.Camera();
    bgScene.add( bgCamera );
**/

    // Foreground scene
    //
    fgScene = new THREE.Scene();
    fgCamera = new THREE.Camera();
    fgScene.add( fgCamera );
    fgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 1.0, transparent: true, vertexColors: THREE.VertexColors, map: PX.AssetsDatabase["EarthDiffuseMap"] });
    fgMaterial.depthTest = false;
    fgMaterial.depthWrite = false;
    //fgMaterial.map = PX.AssetsDatabase["TextAtlasTex"];
    fgMesh = new THREE.Mesh( new THREE.PlaneGeometry(2, 2, 0), fgMaterial );
    fgScene.add( fgMesh );

    // Raycaster
    //
    g_Raycaster = new THREE.Raycaster();
    g_Projector = new THREE.Projector();


    // Events
    //
    renderer.domElement.addEventListener('resize', OnResize, false);
    renderer.domElement.addEventListener('mousemove', OnMouseMove, false);
    renderer.domElement.addEventListener('mouseout', OnMouseOut, false);
    renderer.domElement.addEventListener('mousedown', OnMouseDown, false);
    renderer.domElement.addEventListener('mouseup', OnMouseUp, false);
    renderer.domElement.addEventListener('mousewheel', OnMouseWheel, false);

    //
    InitStats();
    InitGUI();



    // Setup scene for intro
    //

    /*var camDest = PX.Utils.FromLatLon( PX.StartLatLon.x, PX.StartLatLon.y, Params.CameraDistance, 0.0 );
    camera.position.add( new THREE.Vector3(30, 0, 0) );
    //camera.position.set( 0, 0, Params.CameraDistance );
    var tween2 = new TWEEN.Tween( camera.position ).to( camDest, 2000.0 );
    tween2.easing( TWEEN.Easing.Quintic.InOut );
    tween2.delay( 3000 );
    tween2.start();*/

/*    var target = { x : 1.0, y: 1.0, z: 1.0 };
    locationMarkers.locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
    var tween = new TWEEN.Tween( locationMarkers.locationsGroup.scale ).to( target, 2000.0 );
    tween.easing( TWEEN.Easing.Quintic.InOut );
    tween.delay( 3000 );
    tween.start();
    tween.onComplete( function()
    {
        //locationsIntroAnimDone = true;
    });*/

    // Add a callback that reports when a state change happens
    appStateMan.AddStateChangeCallback( function( state )
    {
        console.log( "+--+  Changing State:\t", PX.AppStatesString[state], state );
    });

    // Set App state
    appStateMan.SetState( PX.AppStates.AppStateEntry );


    //
    startTime = timeNow();

    // Now move on to mainloop
    MainLoop();
}


function InitStats()
{
    g_Stats = new Stats();
    g_Stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    // align top-left
    g_Stats.domElement.style.position = 'absolute';
    g_Stats.domElement.style.left = '0px';
    g_Stats.domElement.style.top = '30%';
    document.body.appendChild( g_Stats.domElement );
}


function InitGUI()
{
    g_GUI = new dat.gui.GUI( { width: 300 } );
    g_GUI.close();

    g_GUI.add( Params, 'MainScene' ).onChange( function( newValue ) 
    {
        if( newValue )
        {
            progressBarElement.text( "" );
        }

        if( !tempIsLoaded && !newValue )
        {
            LoadBINScene( "data/models/06_Mihrab_of_the_Mosque_Al_Hasan/mesh.js", artefactScene );
            //LoadScene( "data/models/06_Mihrab_of_the_Mosque_Al_Hasan/Mihrab of the mosque al Hasan.gltf", artefactScene );
            tempIsLoaded = true;
        }
    });
    g_GUI.add( Params, 'ShowMaps' ).onChange( function( newValue ) 
    {
        var maps = $("#map");
        maps.css( "z-index", newValue?1000:-1000 );
    });
    g_GUI.addFolder( "Earth Shading" );
    g_GUI.add( Params, "AmbientIntensity" ).min(0.0);
    g_GUI.add( Params, "DiffuseIntensity" ).min(0.0);
    g_GUI.add( Params, "SpecularIntensity" ).min(0.0);
    g_GUI.add( Params, "NormalMapIntensity" ).min(0.0).max(1.0).step(0.001);
    g_GUI.add( Params, "EarthRoughness" ).min(0.0).max(1.0).step(0.001);
    //g_GUI.add( Params, "HalfLambertPower" ).min(0.0);
    g_GUI.add( Params, "RimAngle" ).min(0.0);
    g_GUI.add( Params, "DiffuseRimIntensity" ).min(0.0);
    g_GUI.add( Params, "NightDayMixFactor" ).min(0.0).max(1.0).step(0.001);
    g_GUI.addFolder( "Clouds Shading" );
    g_GUI.add( Params, "CloudsIntensity" ).min(0.0).max(1.0).step(0.01);
    g_GUI.add( Params, "CloudsShadowIntensity" ).min(0.0).max(1.0).step(0.01);
    g_GUI.add( Params, "CloudsShadowOffset" ).min(0.0).max(20.0).step(0.01);
    g_GUI.addFolder( "Light Direction" );
    g_GUI.add( Params, "LightDirX" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.add( Params, "LightDirY" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.add( Params, "LightDirZ" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.addFolder( "Camera" );
    g_GUI.add( Params, "CameraDistance" ).min( PX.kEarthScale*1.333 ).max( 300.0 );
    g_GUI.addFolder( "Interaction" );
    g_GUI.add( Params, "EarthRotationSpeed" ).min(1.0).max(20.0).step(1.0);
    g_GUI.add( Params, "MapGridSize" ).min(0).max(20).step(1).onChange( function( newValue ) 
    {
        console.log( parseInt(newValue) );
        markerCluster.setGridSize( parseInt(newValue) );
        markerCluster.repaint();
        locationMarkers.doPopulation = true;
    });
    g_GUI.add( Params, "Latitude" ).listen();
    g_GUI.add( Params, "Longitude" ).listen();
    g_GUI.add( Params, "ZoomLevel" ).listen();
    g_GUI.add( Params, "Intersects" ).listen();
    g_GUI.add( Params, "Dummy" ).min(0).max(10).onChange( function( newValue ) 
    {
        tval = { x: 0.0 };
        var tweenw = new TWEEN.Tween( tval ).to( {x: 1.0}, 3000 );
        tweenw.easing( TWEEN.Easing.Quadratic.InOut );
        tweenw.start();
        tweenw.onUpdate(function()
        {
            var ttt = tval.x;
            var start = earth.mesh.quaternion.clone();
            //var end = new THREE.Quaternion().setFromAxisAngle( PX.YAxis, PX.ToRadians(90) );
            //THREE.Quaternion.slerp( start, end, earth.mesh.quaternion, ttt );
            //THREE.Quaternion.slerp( start, end, locationMarkers.locationsGroup.quaternion, ttt );

            var v1 = camera.getWorldDirection().clone().multiplyScalar(-1);
            var v2 = locationMarkers.markers[parseInt(Params.Dummy)].position.clone().normalize();
            var cc = new THREE.Vector3().crossVectors( v2, v1 );
            var dd = v1.clone().dot( v2 );
            var end = new THREE.Quaternion();
            end.x = cc.x;
            end.y = cc.y;
            end.z = cc.z;
            end.w = Math.sqrt( v1.lengthSq() * v2.lengthSq() ) + dd;
            end.normalize();
            THREE.Quaternion.slerp( start, end, earth.mesh.quaternion, ttt );
            THREE.Quaternion.slerp( start, end, locationMarkers.locationsGroup.quaternion, ttt );
        });
    });
    /*g_GUI.add( Params, 'Art_CameraDistance' ).onChange( function( newValue ) 
    {
        artefactCamera.position.z = newValue;
    });*/

    //g_GUI.remember( Params );
}


function Update( time, frameTime )
{
    // Use timestep
    clockTime = timeNow() - startTime;
    var timeDiff = clockTime - previousTime;
    var delta = Math.min( 1.0 / 60.0, timeDiff );
    previousTime = currentTime;
    currentTime += delta;
    frameTime = delta;

    //
    mouseDeltaX = mouseX - previousMouseX;
    mouseDeltaY = mouseY - previousMouseY;
    previousMouseX = mouseX;
    previousMouseY = mouseY;


    if( Params.MainScene )
    {
        mouseVector3d.set( mouseX, Params.WindowHeight-mouseY, 0.0 );

        // Update raycaster
        mouseVector.x = 2.0 * (mouseX / windowWidth) - 1.0;
        mouseVector.y = 1.0 - 2.0 * ( mouseY / windowHeight );
        g_Raycaster.setFromCamera( mouseVector, camera );

        //
        if( !earthOrbitControls && locationsIntroAnimDone )
        {
            earthOrbitControls = new THREE.OrbitControls( camera, renderer.domElement );
            earthOrbitControls.enableDamping = true;
            earthOrbitControls.dampingFactor = 0.1;
            earthOrbitControls.rotateSpeed = 0.05;
            earthOrbitControls.minDistance = PX.kCameraMinDistance;
            earthOrbitControls.maxDistance = PX.kCameraMaxDistance; //Params.CameraDistance;
            earthOrbitControls.minPolarAngle = Math.PI * 0.1;
            earthOrbitControls.maxPolarAngle = Math.PI * 0.9;
            earthOrbitControls.enableZoom = false;
            earthOrbitControls.enablePan = false;
            earthOrbitControls.enableKeys = false;
            earthOrbitControls.target.set( 0, 0, 0 );
            earthOrbitControls.position0.set( Params.CameraDistance*Math.cos(PX.ToRadians(90)), 0, Params.CameraDistance*Math.sin(PX.ToRadians(90)) );
            earthOrbitControls.reset();
            earthOrbitControls.update();

            var camPos = PX.Utils.FromLatLon( PX.StartLatLon.x, PX.StartLatLon.y, Params.CameraDistance, 0.0 );
            camera.position.set( camPos.x, camPos.y, camPos.z );
            camera.lookAt( PX.ZeroVector );
        }

        // Step earth rotation
        //
        if( earthOrbitControls 
            && ( appStateMan.IsState( PX.AppStates.AppStateLevel0 ) 
              || appStateMan.IsState( PX.AppStates.AppStateLevel1 ) ) 
            )
        {
            if( earthOrbitControls.enabled )
            {
                var rotSpeed = PX.Saturate( Params.CameraDistance / PX.kCameraMaxDistance );
                earthOrbitControls.rotateSpeed = ( ( rotSpeed ) + 0.1 ) * 0.05;

                //earthOrbitControls.update();
            }
        }


        if( currentTime >= 5.0 )
        {
            if( appStateMan.IsState( PX.AppStates.AppStateEntry ) )
            {
                appStateMan.ChangeState( PX.AppStates.AppStateIntroToLevel0 );
                earth.ResetTransform( function()
                {
                    locationMarkers.TweenLevel0( 1, 1.0 * 1000.0, 0.0
                    //locationMarkers.TweenLevel0( 1, 1.0 * 1000.0, 3.5 * 1000.0
                    , function()
                    {
                    }
                    , function()
                    {
                        appStateMan.ChangeState( PX.AppStates.AppStateLevel0 );
                    });
                });
            }
        }

/**        if( isMouseDown )
        {
            var maxSpeed = 100.0 * 360.0;
            earthAccel.x = PX.Clamp( mouseDeltaX * 60.0, -maxSpeed, maxSpeed ) * Params.EarthRotationSpeed;
            earthAccel.y = PX.Clamp( mouseDeltaY * 30.0, -maxSpeed, maxSpeed ) * Params.EarthRotationSpeed;
        }
        earthVel.x += earthAccel.x * frameTime;
        earthVel.y += earthAccel.y * frameTime;
        earthAngle.x += earthVel.x * frameTime;
        earthAngle.y += earthVel.y * frameTime;
        earthVel.x *= earthVelDamp;
        earthVel.y *= earthVelDamp;
        earthAccel.set( 0.0, 0.0 );
*/
        // Update Earth
        //
        if( earth )
        {
            earth.Update( currentTime, frameTime, camera );
            //earth.UpdateRotation( earthAngle.x * frameTime, earthAngle.y * frameTime );
        }


        if( locationMarkers.doPopulation )
        {
            locationMarkers.PopulateMarkers( markerCluster, locationsDB, camera );
        }

        // Avoidance
        locationMarkers.MarkerAvoidance( markerCluster, frameTime );

        //
        locationMarkers.Update( currentTime, frameTime, camera );


        // Do picking on click
        // Check to see if any tree was hit
        //

        //var markerIndex = locationMarkers.IntersectsLevel1( g_Raycaster );
        //var markerIndex = locationMarkers.IntersectsLevel0( mouseVector3d );
        /*if( markerIndex >= 0 )
        {
            locationMarkers.meshes[ markerIndex ].material.color.set( PX.kLocationMouseOverColor );
        }*/

/*


        // Intersection test per mesh
        for( var i=0; i<locationMarkerCount; i++ )
        {
            var intersects = g_Raycaster.intersectObject( locationMeshes[i], false );
            if( intersects.length > 0 )
            {
                intersects[ 0 ].object.material.color.set( PX.kLocationMouseOverColor );
                break;
            }
        }
*/

        // Make sure camera is always looking at origin
        //camera.lookAt( PX.ZeroVector );


        // Change latitude min/max
        /*if( earthOrbitControls )
        {
            var t = PX.Pow4( distanceToCenterNorm );
            earthOrbitControls.minPolarAngle = PX.Lerp( Math.PI * 0.3, Math.PI * 0.5, t );
            earthOrbitControls.maxPolarAngle = PX.Lerp( Math.PI * 0.7, Math.PI * 0.5, t );
        }*/


        // Update Tween
        TWEEN.update();

        //
        appStateMan.Update();
    }


    //
    /*if( ! Params.MainScene )
    {
        if( artefactSceneBSphere )
        {
            //console.log( artefactSceneBSphere );
            artefactOrbitControls.target.set( artefactSceneBSphere.x, artefactSceneBSphere.y, artefactSceneBSphere.z );
            artefactOrbitControls.update();
        }
    }*/


    // Get Sun position and map it to our light
    //
    //var nowDate = new Date();
    //var sunLatLon = SunCalc.getPositionLatLon( nowDate, 0, 0 );
    //var ppp = PX.Utils.FromLatLon( PX.ToDegrees(sunLatLon.lat), PX.ToDegrees(sunLatLon.lon), PX.kEarthScale, 0.0 );
    var ppp = new THREE.Vector3( Params.LightDirX, Params.LightDirY, Params.LightDirZ );
    /*var ppp = new THREE.Vector3( 0.5, 1.0, -0.2 );
    ppp = ppp.normalize();
    Params.LightDirX = ppp.x;
    Params.LightDirY = ppp.y;
    Params.LightDirZ = ppp.z;*/
    if( sunLight ) sunLight.position.set( ppp.x, ppp.y, ppp.z );


    // Fade in
    //
    if( currentTime < 4.0 )
        fgMaterial.opacity = 1.0 - PX.Saturate( currentTime * 0.5 );
}


function Render()
{
    renderer.clear();

    if( Params.MainScene )
    {
        renderer.setViewport( 0, 0, windowWidth, windowHeight );
        renderer.render( scene, camera );

        renderer.render( locationMarkers.markerScene, locationMarkers.camera2d );
        //renderer.render( locationMarkers.markerScene, fgCamera );

        //composer.render();
    }
    else
    {
        /*artefactScene.traverse(function (object)
        {
            if( object instanceof THREE.Mesh )
            {
                object.material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
                object.material.side = THREE.DoubleSide;
                //console.log( object.name );
            }
        });*/

	    //THREE.glTFShaders.update( artefactScene, artefactCamera );

        renderer.setViewport( 0, 0, windowWidth, windowHeight );
        renderer.render( artefactScene, artefactCamera );
    }

    renderer.setViewport( 0, 0, windowWidth, windowHeight );
    renderer.render( fgScene, fgCamera );
}


function MainLoop() 
{
    requestAnimationFrame(MainLoop);

    g_Stats.begin();
    Update(currentTime, frameTime);
    Render();
    g_Stats.end();
}


function ComputeZoomLevel( distanceToCenter )
{
    var level = PX.Saturate( (distanceToCenter - PX.kCameraMinDistance) / ( PX.kCameraMaxDistance - PX.kCameraMinDistance ) );
    //var level = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );

    level = Math.floor( PX.kZoomMaxLevel - PX.Clamp( ( level * PX.kZoomMaxLevel ), 0.0, PX.kZoomMaxLevel ) );

    console.log( "zoomLevel: " + level );

    //return level;

    return PX.kZoomMaxLevel;
}


function ComputeMapGridSizeFromZoomLevel( zoomLevel )
{
    var maxZoomScale = 2.0;

    var zoomNorm = zoomLevel / PX.kZoomMaxLevel;
    var zoomT = ( zoomNorm );
    var gridSize = Math.ceil( PX.Lerp( PX.kMaxGridSize, 1, zoomT ) );
    //var gridSize = Math.floor( PX.Clamp( (PX.kZoomMaxLevel*maxZoomScale) - zoomLevel, 1.0, 20.0 ) );
    //var gridSize = Math.floor( PX.Clamp( (PX.kZoomMaxLevel*maxZoomScale) - zoomLevel, 1.0, 20.0 ) );
    //var gridSize = PX.Clamp( PX.kZoomMaxLevel - zoomLevel, 1.0, 20.0 );

    console.log( "gridSize: " + gridSize );

    return gridSize;
}


function OnResize()
{
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function OnMouseDown(event)
{
    isMouseDown = true;
    //isMouseMoved = false;
    //isMouseUp = false;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function OnMouseUp(event)
{
    //isMouseUp = true;
    isMouseDown = false;
    //if( isMouseMoved ) isMouseClick = false;
    //else isMouseClick = true;
    mouseX = event.clientX;
    mouseY = event.clientY;

    //
    locationMarkers.OnMouseUp( mouseVector3d, camera );
}

function OnMouseMove(event)
{
    //isMouseMoved = true;
    mouseX = event.clientX;
    mouseY = event.clientY;

    switch( appStateMan.GetCurrentState() )
    {
        case PX.AppStates.AppStateLevel0:
        {
            var markerIndex = locationMarkers.IntersectsLevel0( mouseVector3d );
            break;
        }
        case PX.AppStates.AppStateLevel1:
        {
            var markerIndex = locationMarkers.IntersectsLevel1( g_Raycaster );
            break;
        }
        default:
            break;
    }
}

function OnMouseWheel( event )
{
}

function OnMouseOut()
{
    isMouseDown = false;
    previousMouseX = 0.0;
    previousMouseY = 0.0;
    mouseX = 0.0;
    mouseY = 0.0;
}
