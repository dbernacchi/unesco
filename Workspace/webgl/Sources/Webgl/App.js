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
var textRenderer = null;

var map;
var markerCluster;
var doLocationsGather = true;
var visibleClustersCount = 0;
//var visibleMarkersCount = 0;

var zoomLevel = 0.0;
var prevZoomLevel = 0.0;

var cameraTargetPoint = null;
var cameraSourcePoint = null;

var earthOrbitControls = null;

var sunLight = null;
var earth = null;

var billboardMaterial = null;
var billboardGeometry = null;
var billboardSprite = null;
var billboards = null;

// Raycaster
var g_Raycaster = null;
var g_Projector = null;

// Locations
var locationsGroup = null;
var locations = [];
var locationMeshes = [];
var locationMarkers = [];
var locationMarkerCount = 0;
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
var frameRate = 0;
var frameRateTimeCount = 0.0;
var frameCount = 0;
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


$(window).unload(function(e) 
{
});

$(window).blur(function(e) 
{
});

$(window).focus(function(e) 
{
});

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
    //renderer.gammaOutput = true;
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
        locations.push( location );
    }
}

function Setup()
{
    var aspectRatio = windowWidth / windowHeight;

    // Parse locations from json
    ParseLocationData( PX.AssetsDatabase["LocationsJson"] );

    // Initialize GLTF Loader
    InitLoaders();

    //
    ParseBitmapFont( PX.AssetsDatabase["TextAtlasXml"] );
    //ParseBitmapFont( "data/fonts/lucida.xml" );
    //ParseBitmapFont( "data/fonts/arialLarge.xml" );


    // Create main scene
    //
    scene = new THREE.Scene();
    //scene.autoUpdate = false;


    // Create camera
    //
    camera = new THREE.PerspectiveCamera( PX.kCameraFovY, aspectRatio, PX.kCameraNearPlane, PX.kCameraFarPlane );
    camera.updateProjectionMatrix();
    var camPos = PX.Utils.FromLatLon( 0.0, 0.0, Params.CameraDistance, 0.0 );
    camera.position.set( camPos.x, camPos.y, camPos.z );
    var currentCamLookAt = new THREE.Vector3(0, 0, 0);
    camera.lookAt( currentCamLookAt );
    scene.add( camera );


    // Create Globe
    //
    earth = new UG.Earth();
    earth.Init( scene );


    // Create locations
    //
    locationsGroup = new THREE.Object3D();
    locationsGroup.position.set( 0, 0, 0 );
    for( var i=0; i<locations.length; ++i )
    {
        //var mat = new THREE.MeshLambertMaterial( { color: PX.kLocationColor, emissive: 0x003333 } );
        var mat = new THREE.MeshBasicMaterial( { color: PX.kLocationColor } );
        //mat.depthWrite = false;
        var geom = new THREE.CylinderGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerDetail, 1 );
        //var geom = new THREE.CylinderGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerScale*0.33, 16, 1 );

        var matTrans = new THREE.Matrix4().makeTranslation( 0, 0, -PX.kLocationMarkerScale*0.5 );
        var matRot = new THREE.Matrix4().makeRotationX( THREE.Math.degToRad( 90.0 ) )
        var objMat = new THREE.Matrix4().multiplyMatrices( matTrans, matRot );

        geom.applyMatrix( objMat );
        var mesh = new THREE.Mesh( geom, mat );

        mesh.position.copy( locations[i].position );
        mesh.scale.set( 0.001, 0.001, 0.001 );
        mesh.lookAt( new THREE.Vector3(0, 0, 0) );

        mesh.name = locations[i].name;

        // @NOTE: Mark mesh with Index
        //mesh.meshIndex = i;

        //
        locationMeshes.push( mesh );

        //
        var lm = new UG.LocationMarker();
        lm.text = "";
        lm.position.copy( locations[i].position );
        locationMarkers.push( lm );

        locationsGroup.add( mesh );
    }
    scene.add( locationsGroup );


    // Create scene's Sun light
    //
    /*sunLight = new THREE.DirectionalLight( 0xffffff );
    sunLight.position.set( 0.7, 0.0, 1.0 );
    scene.add( sunLight );*/

/*
    earthOrbitControls = new THREE.OrbitControls( camera, renderer.domElement );
    earthOrbitControls.enableDamping = true;
    earthOrbitControls.dampingFactor = 0.1;
    earthOrbitControls.rotateSpeed = 0.05;
    earthOrbitControls.minDistance = PX.kCameraMinDistance;
    earthOrbitControls.maxDistance = PX.kCameraMaxDistance; //Params.CameraDistance;
    earthOrbitControls.minPolarAngle = Math.PI * 0.1;
    earthOrbitControls.maxPolarAngle = Math.PI * 0.9;
    earthOrbitControls.enablePan = false;
    earthOrbitControls.enableKeys = false;
    earthOrbitControls.target.set( 0, 0, 0 );
    earthOrbitControls.position0.set( Params.CameraDistance*Math.cos(PX.ToRadians(90)), 0, Params.CameraDistance*Math.sin(PX.ToRadians(90)) );
    earthOrbitControls.reset();
    earthOrbitControls.update();*/


    // Update camera position to look at latlon: 0, 0
    //
    //var camPos = PX.Utils.FromLatLon( 0.0, 0.0, Params.CameraDistance, 0.0 );
    //camera.position.set( camPos.x, camPos.y, camPos.z );


    // Composer
    //
/*    renderMainPass = new THREE.RenderPass( scene, camera );
    effectBloomPass = new THREE.BloomPass( 1, 25, 5, 1024 );
    effectCopyPass = new THREE.ShaderPass( THREE.CopyShader );
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderMainPass );
    composer.addPass( effectBloomPass );
    composer.addPass( effectCopyPass );

    effectCopyPass.uniforms.opacity.value = 0.15;
    effectCopyPass.renderToScreen = true;*/


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

    // Text Renderer
    //
    textRenderer = new PX.TextRenderer();
    textRenderer.Init( bmFontDescriptor, 1024, PX.AssetsDatabase["TextAtlasTex"], scene );

    // Add text renderer (locations) to locationGroup
    locationsGroup.add( textRenderer.mesh );

/**
	// set factor which bitmap font tiles shall be scaled with
    //
	var fontSizeFactor = 1 / 64;

	// set start position for first string
    //
	var xOffset = 40.0;
	var yOffset = 0.0;
    var zOffset = 30.0;

    var vertexColor = 0xffffff;

    billboardSprite = new THREE.TextureLoader().load( "data/textures/circle.png" );
    billboardMaterial = new THREE.PointsMaterial( { size: 2.5, sizeAttenuation: true, map: billboardSprite, transparent: true } );
    billboardMaterial.vertexColors = THREE.VertexColors;
    //billboardMaterial.depthTest = false;
    billboardMaterial.depthWrite = false;
    billboardGeometry = new THREE.Geometry();

    //var scaleOffset = 1.0 + 0.030;
    var scaleOffset = 1.0 + 0.0025;
    for( var i=0; i<locations.length; ++i )
    {
		var vertex = new THREE.Vector3();
        vertex.x = locations[i].position.x * scaleOffset;
        vertex.y = locations[i].position.y * scaleOffset;
        vertex.z = locations[i].position.z * scaleOffset;
		billboardGeometry.vertices.push( vertex );
		billboardGeometry.colors.push( new THREE.Color( 0xffffff ) );
	}

	billboards = new THREE.Points( billboardGeometry, billboardMaterial );
    billboards.frustumCulled = false;
	scene.add( billboards );
	//fgScene.add( billboards );
**/

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


    // @TESTBED:
    var center = new google.maps.LatLng( 0.0, 0.0 );
    map = new google.maps.Map(document.getElementById('map'), 
    {
        zoom: 0,
        center: center,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });

    /*var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) 
    {
        var latLng = new google.maps.LatLng( locations[i].latlon.x, locations[i].latlon.y );
        bounds.extend( latLng );
    }
    map.fitBounds( bounds );*/

    var markers = [];
    for (var i = 0; i < locations.length; i++) 
    {
        var latLng = new google.maps.LatLng( locations[i].latlon.x, locations[i].latlon.y );
        var marker = new google.maps.Marker(
        {
            position: latLng
        });
        markers.push(marker);
    }
    markerCluster = new MarkerClusterer( map );
    markerCluster.addMarkers( markers, true );
    markerCluster.setGridSize( Params.MapGridSize );

    // Add Camera's intro appearance
    //
    var camPosSrc = PX.Utils.FromLatLon( 0.0, -30.0, Params.CameraDistance, 0.0 );
    camera.position.copy( camPosSrc );
    var camPosDest = PX.Utils.FromLatLon( 0.0, 0.0, Params.CameraDistance, 0.0 );
    var tween = new TWEEN.Tween( camera.position ).to( camPosDest, 2000.0 );
    tween.easing( TWEEN.Easing.Sinusoidal.InOut );
    tween.delay( 2100 );
    tween.start();


    // Add Locations intro appearance
    //
    var target = { x : 1.0, y: 1.0, z: 1.0 };
    locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
    var tween = new TWEEN.Tween( locationsGroup.scale ).to( target, 2000.0 );
    tween.easing( TWEEN.Easing.Quintic.InOut );
    tween.delay( 3000 );
    tween.start();
    tween.onComplete( function()
    {
        locationsIntroAnimDone = true;
    });


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
    g_Stats.domElement.style.top = '200px';
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
    g_GUI.add( Params, "MapGridSize" ).min(0).max(100).onChange( function( newValue ) 
    {
        console.log( parseInt(newValue) );
        markerCluster.setGridSize( parseInt(newValue) );
        markerCluster.repaint();
    });
    g_GUI.add( Params, "Latitude" ).listen();
    g_GUI.add( Params, "Longitude" ).listen();
    g_GUI.add( Params, "ZoomLevel" ).listen();
    g_GUI.add( Params, "Intersects" ).listen();
    g_GUI.add( Params, "Dummy" ).min(0).max(500);
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
    //previousTime = currentTime;
    //currentTime = timeNow();
    //frameTime = currentTime - previousTime;

    //
    mouseDeltaX = mouseX - previousMouseX;
    mouseDeltaY = mouseY - previousMouseY;
    previousMouseX = mouseX;
    previousMouseY = mouseY;


    if( Params.MainScene )
    {
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
            earthOrbitControls.enablePan = false;
            earthOrbitControls.enableKeys = false;
            earthOrbitControls.target.set( 0, 0, 0 );
            earthOrbitControls.position0.set( Params.CameraDistance*Math.cos(PX.ToRadians(90)), 0, Params.CameraDistance*Math.sin(PX.ToRadians(90)) );
            earthOrbitControls.reset();
            earthOrbitControls.update();

            var camPos = PX.Utils.FromLatLon( 0.0, 0.0, Params.CameraDistance, 0.0 );
            camera.position.set( camPos.x, camPos.y, camPos.z );
        }

        // Step earth rotation
        //
        if( earthOrbitControls )
        {
            earthOrbitControls.update();

            var rotSpeed = PX.Saturate( Params.CameraDistance / PX.kCameraMaxDistance );
            earthOrbitControls.rotateSpeed = ( ( rotSpeed ) + 0.1 ) * 0.05;
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

        // Update locations
        //
        for( var i=0; i<locations.length; ++i )
        {
            // restore original color
            locationMeshes[ i ].material.color.set( PX.kLocationColor );

            //billboardGeometry.colors[i].setRGB( 255, 255, 255 );
        }
        // Rotate locations parent node
        //locationsGroup.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), PX.ToRadians( earthAngle.x * frameTime ) );


        // Use Map to get clusters
        //
        /*var distanceToCenter = ( camera.position.length() );
        var distanceToCenterNorm = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
        var camLatLon = PX.Utils.ConvertPosToLatLon( camera.position.x, camera.position.y, camera.position.z, distanceToCenter );
        camLatLon.x = ( 90.0 - camLatLon.x );
        camLatLon.y = camLatLon.y - 90.0;
        Params.Latitude = camLatLon.x;
        Params.Longitude = camLatLon.y;
        //console.log( camLatLon, camera.position );
        //prevZoomLevel = zoomLevel;
        //zoomLevel = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
        //zoomLevel = parseInt( PX.kZoomMaxLevel - PX.Clamp( ( zoomLevel * PX.kZoomMaxLevel ), 0.0, PX.kZoomMaxLevel ) );
        //Params.ZoomLevel = zoomLevel;
        //console.log( distanceToCenter, zoomLevel );
        if( !isMouseDown && locationsIntroAnimDone )
        {
            var mapCenter = new google.maps.LatLng( camLatLon.x, camLatLon.y );
            map.setCenter( mapCenter );
        }*/
        /*if( prevZoomLevel !== zoomLevel )
        {
            console.log( zoomLevel );
            map.setZoom( zoomLevel );
        }*/
        //markerCluster.setMaxZoom( 1 );
        var clusterCount = markerCluster.getTotalClusters();
        //var markersCount = markerCluster.getMarkers();
        if( doLocationsGather && clusterCount ) //&& markersCount ) //&& zoomLevel < PX.kZoomMaxLevel )
        {
            //console.log( clusterCount, markersCount.length );

            visibleClustersCount = clusterCount;
            //visibleMarkersCount = markersCount;

            locationMarkerCount = 0;

            if( zoomLevel < PX.kZoomMaxLevel )
            {
                for( var i=0; i<clusterCount; ++i )
                {
                    var c = markerCluster.clusters_[i];
                    var clusterCenter = c.getCenter();

                    //console.log( i, clusterCenter.lat(), clusterCenter.lng() );

                    locationMarkers[i].text = String( c.markers_.length );
                    locationMarkers[i].latlon.set( clusterCenter.lat(), clusterCenter.lng() );
                    locationMarkers[i].position.copy( PX.Utils.FromLatLon( clusterCenter.lat(), clusterCenter.lng(), PX.kEarthScale, 0.0 ) );
                    locationMarkerCount++;
                }
            }
            else
            {
                for( var i=0; i<clusterCount; ++i )
                {
                    var c = markerCluster.clusters_[i];
                    var clusterCenter = c.getCenter();

                    for( var k=0; k<c.markers_.length; ++k )
                    {
                        var markerPos = c.markers_[k].getPosition();
                        locationMarkers[ locationMarkerCount ].text = locations[ locationMarkerCount ].name;
                        locationMarkers[ locationMarkerCount ].latlon.set( markerPos.lat(), markerPos.lng() );
                        locationMarkers[ locationMarkerCount ].position.copy( PX.Utils.FromLatLon( markerPos.lat(), markerPos.lng(), PX.kEarthScale, 0.0 ) );
                        locationMarkerCount++;

                        //console.log( locationMarkers[idx].latlon, locationMarkers[idx].text );
                    }
                }

            }

            doLocationsGather = false;
        }

        // Avoid touching
        //
        var MinDistancesPerLevel = [ 
            230,
            185,
            130,
            105,
            70,
            35,
            20 //17.5
        ];

        var distToCamera = new THREE.Vector3();
        for( var j=0; j<locationMarkerCount; ++j )
        {
            var locj = locationMarkers[j];

            for( var i=j+1; i<locationMarkerCount; ++i )
            {
                var loci = locationMarkers[i];

                var latloni = PX.Utils.ConvertPosToLatLon( loci.position.x, loci.position.y, loci.position.z, PX.kEarthScale );
                var latlonj = PX.Utils.ConvertPosToLatLon( locj.position.x, locj.position.y, locj.position.z, PX.kEarthScale );

                var p1 = new google.maps.LatLng( latloni.x, latloni.y );
                var p2 = new google.maps.LatLng( latlonj.x, latlonj.y );
                var latLonDir = new THREE.Vector2( p1.lat(), p1.lng() ).sub( new THREE.Vector2( p2.lat(), p2.lng() ) ).normalize();

                var dist = locj.position.clone().sub( loci.position );
                var dir = dist.clone().normalize();

                var distInKm = markerCluster.distanceBetweenPoints_( p1, p2 );
                //var minDistance = Params.Dummy;
                var minDistance = MinDistancesPerLevel[ PX.Clamp( zoomLevel, 0, PX.kZoomMaxLevel ) ];
                if( distInKm <= minDistance )
                {
                    var speed = PX.Clamp( minDistance-distInKm, 0.0, minDistance );
                    //console.log( distInKm );

                    loci.position.x -= dir.x * frameTime * speed * 0.1;
                    loci.position.y -= dir.y * frameTime * speed * 0.1;
                    loci.position.z -= dir.z * frameTime * speed * 0.1;
                    //
                    locj.position.x += dir.x * frameTime * speed * 0.1;
                    locj.position.y += dir.y * frameTime * speed * 0.1;
                    locj.position.z += dir.z * frameTime * speed * 0.1;

                    loci.position.normalize();
                    loci.position.multiplyScalar( PX.kEarthScale );
                    locj.position.normalize();
                    locj.position.multiplyScalar( PX.kEarthScale );

                    var latloni = PX.Utils.ConvertPosToLatLon( loci.position.x, loci.position.y, loci.position.z, PX.kEarthScale );
                    var latlonj = PX.Utils.ConvertPosToLatLon( locj.position.x, locj.position.y, locj.position.z, PX.kEarthScale );

                    //camLatLon.x = ( 90.0 - camLatLon.x );
                    //camLatLon.y = camLatLon.y - 90.0;

                    // @FIXME: Coords dont match googles
                    // Convert
                    latloni.x = 90 - latloni.x;
                    latloni.y = latloni.y - 90.0;
                    latlonj.x = 90.0 - latlonj.x;
                    latlonj.y = latlonj.y - 90.0;

                    //console.log( "before: ", loci.latlon, locj.latlon );
                    loci.latlon.set( latloni.x, latloni.y );
                    locj.latlon.set( latlonj.x, latlonj.y );
                    //console.log( "after : ", loci.latlon, locj.latlon );
                }
/**
                // Use distance to camera for constant size
                distToCamera.subVectors( camera.position, loci.position );
                var locationScalei = distToCamera.length();
                locationScalei = ( locationScalei / PX.kCameraMaxDistance );

                var dist = locj.position.clone().sub( loci.position );
                var dir = dist.clone().normalize();
                var len = dist.length();
                console.log( locationScalei, len );
                if( len <= ( PX.kLocationMarkerScale ) )
                //if( len <= ( PX.kLocationMarkerScale * 0.5 ) / ( 1.0 - (locationScalei) ) )
                {
                    loci.position.x -= dir.x * (1.0 / 60.0) * 0.4;
                    loci.position.y -= dir.y * (1.0 / 60.0) * 0.4;
                    loci.position.z -= dir.z * (1.0 / 60.0) * 0.4;
                    //
                    locj.position.x += dir.x * (1.0 / 60.0) * 0.4;
                    locj.position.y += dir.y * (1.0 / 60.0) * 0.4;
                    locj.position.z += dir.z * (1.0 / 60.0) * 0.4;

                    loci.position.normalize();
                    loci.position.multiplyScalar( PX.kEarthScale );
                    locj.position.normalize();
                    locj.position.multiplyScalar( PX.kEarthScale );

                    var latloni = PX.Utils.ConvertPosToLatLon( loci.position.x, loci.position.y, loci.position.z, PX.kEarthScale );
                    var latlonj = PX.Utils.ConvertPosToLatLon( locj.position.x, locj.position.y, locj.position.z, PX.kEarthScale );

                    //camLatLon.x = ( 90.0 - camLatLon.x );
                    //camLatLon.y = camLatLon.y - 90.0;

                    // @FIXME: Coords dont match googles
                    // Convert
                    latloni.x = 90 - latloni.x;
                    latloni.y = latloni.y - 90.0;
                    latlonj.x = 90.0 - latlonj.x;
                    latlonj.y = latlonj.y - 90.0;

                    //console.log( "before: ", loci.latlon, locj.latlon );
                    loci.latlon.set( latloni.x, latloni.y );
                    locj.latlon.set( latlonj.x, latlonj.y );
                    //console.log( "after : ", loci.latlon, locj.latlon );
                }
***/
            }
        }

        // Default all locations to far far away
        //
        for( var i=0; i<locations.length; ++i )
        {
            //billboardGeometry.vertices[i].set( 10000, 0, 0 );
            locationMeshes[i].position.set( 10000, 0, 0 );
        }

        // Place only visible clusters/markers
        //
        var distToCamera = new THREE.Vector3();
        for( var i=0; i<locationMarkerCount; ++i )
        {
            var loc = locationMarkers[i];

            // Use distance to camera for constant size
            distToCamera.subVectors( camera.position, loc.position );
            var locationScale = distToCamera.length();
            locationScale = ( locationScale / PX.kCameraMaxDistance );

            //console.log( i, p.x, p.y, p.z );
            //billboardGeometry.vertices[i].set( p.x, p.y, p.z );
            locationMeshes[i].position.copy( loc.position );
            //locationMeshes[i].scale.set( locationScale, locationScale, locationScale ); //( ( c.markers_.length > 0 ) ? c.markers_.length : 1.0 ) );
            locationMeshes[i].scale.set( locationScale, locationScale, locationScale ); // * ( c.markers_.length > 0 ? c.markers_.length * PX.kLocationMarkerZScale : 1.0 ) );
            locationMeshes[i].lookAt( PX.ZeroVector );
	    }
        //billboardGeometry.verticesNeedUpdate = true;


        // Update text geometry
        //
        var matTrans = new THREE.Matrix4();
        var matRot = new THREE.Matrix4();
        var matScale = new THREE.Matrix4();
        var matRes = new THREE.Matrix4();

        textRenderer.Begin();
        for( var i=0; i<locationMarkerCount; ++i )
        {
            var loc = locationMarkers[i];

            // Use distance to camera for constant size
            distToCamera.subVectors( camera.position, loc.position );
            var locationScale = distToCamera.length();
            locationScale = ( locationScale / PX.kCameraMaxDistance );

            var smallOffset = 0.001;
            var p = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (locationScale * PX.kLocationMarkerScale) );

            matTrans = matTrans.makeTranslation( p.x, p.y, p.z );
            //matRot.makeRotationFromQuaternion( locationMeshes[i].quaternion );
            matRot.makeRotationFromEuler( locationMeshes[i].rotation );
            matScale.makeScale( locationScale, locationScale, locationScale );
            matRes.multiplyMatrices( matTrans, matRot );
            matRes.multiplyMatrices( matRes, matScale );
            //matRes = locationMeshes[i].matrixWorld;

            textRenderer.AppendText( loc.text, PX.ZeroVector, PX.kLocationTextSize, matRes, true );
            //textRenderer.AppendText( locMarkerCountStr, new THREE.Vector3( 0.0, 0.0, -0.2 ), PX.kLocationTextSize, locationMeshes[i].matrixWorld, true );
        }
        textRenderer.End();



        // Do picking on click
        // Check to see if any tree was hit
        //
        mouseVector.x = 2.0 * (mouseX / windowWidth) - 1.0;
        mouseVector.y = 1.0 - 2.0 * ( mouseY / windowHeight );

        g_Raycaster.setFromCamera( mouseVector, camera );

//        var meshIndex = -1;

/**
        // Intersection test on all meshes
        var intersects = g_Raycaster.intersectObjects( locationMeshes, false );
        Params.Intersects = intersects.length;
        // Pick only one, the closest one
        //for( var i=0; i<intersects.length; ++i )
        for( var i=0; i<Math.min(intersects.length, 1); i++ )
        {
            intersects[ i ].object.material.color.set( PX.kLocationMouseOverColor );
            //meshIndex = intersects[ i ].object.meshIndex;
            if( isMouseDown ) 
            {
                cameraSourcePoint = camera.position.clone();
                cameraTargetPoint = intersects[ i ].object.position.clone().normalize();

                Params.CameraDistance *= 0.95; //PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, tt );
                Params.CameraDistance = PX.Clamp( Params.CameraDistance, PX.kCameraMinDistance, PX.kCameraMaxDistance );

                var position = { x : cameraSourcePoint.x, y: cameraSourcePoint.y, z: cameraSourcePoint.z };
                var target = { x : cameraTargetPoint.x*Params.CameraDistance, y: cameraTargetPoint.y*Params.CameraDistance, z: cameraTargetPoint.z*Params.CameraDistance };
                var tween = new TWEEN.Tween( position ).to( target, 1000 );
                tween.easing( TWEEN.Easing.Quadratic.InOut );
                //tween.delay( 50 );
                tween.start();
                tween.onStart(function()
                {
                });
                tween.onUpdate(function()
                {
                    camera.position.x = position.x;
                    camera.position.y = position.y;
                    camera.position.z = position.z;
                });
                tween.onComplete(function()
                {
                    var distanceToCenter = ( camera.position.length() );
                    zoomLevel = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
                    zoomLevel = parseInt( PX.kZoomMaxLevel - PX.Clamp( ( zoomLevel * PX.kZoomMaxLevel ), 0.0, PX.kZoomMaxLevel ) );
                    console.log( zoomLevel );

                    //if( prevZoomLevel !== zoomLevel )
                    {
                        console.log( zoomLevel );
                        map.setZoom( zoomLevel );
                    }
                });
            }
        }
**/

        // Intersection test per mesh
        for( var i=0; i<locationMarkerCount; i++ )
        {
            var intersects = g_Raycaster.intersectObject( locationMeshes[i], false );
            if( intersects.length > 0 )
            {
                intersects[ 0 ].object.material.color.set( PX.kLocationMouseOverColor );
                /**
                //meshIndex = intersects[ 0 ].object.meshIndex;
                if( isMouseDown ) 
                {
                    cameraSourcePoint = camera.position.clone();
                    cameraTargetPoint = intersects[ 0 ].object.position.clone().normalize();

                    Params.CameraDistance *= 0.95; //PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, tt );
                    Params.CameraDistance = PX.Clamp( Params.CameraDistance, PX.kCameraMinDistance, PX.kCameraMaxDistance );

                    var position = { x : cameraSourcePoint.x, y: cameraSourcePoint.y, z: cameraSourcePoint.z };
                    var target = { x : cameraTargetPoint.x*Params.CameraDistance, y: cameraTargetPoint.y*Params.CameraDistance, z: cameraTargetPoint.z*Params.CameraDistance };
                    var tween = new TWEEN.Tween( position ).to( target, 1000 );
                    tween.easing( TWEEN.Easing.Quadratic.InOut );
                    //tween.delay( 50 );
                    tween.start();
                    tween.onStart(function()
                    {
                    });
                    tween.onUpdate(function()
                    {
                        camera.position.x = position.x;
                        camera.position.y = position.y;
                        camera.position.z = position.z;
                    });
                    tween.onComplete(function()
                    {
                        var distanceToCenter = ( camera.position.length() );
                        zoomLevel = PX.Saturate( (distanceToCenter-PX.kCameraMinDistance) / ( PX.kCameraMaxDistance - PX.kCameraMinDistance ) );
                        //zoomLevel = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
                        zoomLevel = Math.round( PX.kZoomMaxLevel - PX.Clamp( ( zoomLevel * PX.kZoomMaxLevel ), 0.0, PX.kZoomMaxLevel ) );
                        console.log( "zoomLevel: " + zoomLevel );

                        Params.MapGridSize = PX.Clamp( (PX.kZoomMaxLevel*1.5 - zoomLevel), 1.0, 20.0 );
                        //Params.MapGridSize = PX.Clamp( PX.kZoomMaxLevel - zoomLevel, 1.0, 20.0 );
                        markerCluster.setGridSize( Params.MapGridSize );
                        console.log( "Params.MapGridSize: " + Params.MapGridSize );

                        //if( prevZoomLevel !== zoomLevel )
                        {
                            map.setZoom( zoomLevel );
                        }
                    });
                }***/
                break;
            }
        }

        // Make sure camera is always looking at origin
        camera.lookAt( PX.ZeroVector );

        // Billboards
        //
        /*if( meshIndex !== -1 )
        {
            billboardGeometry.colors[meshIndex].setRGB( 255, 0, 255 );
        }*/


        //billboardGeometry.colorsNeedUpdate = true;
/*        for( var i=0; i<locations.length; ++i )
        {
            var pWS = locationMeshes[i].position.clone();
            pWS = pWS.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), PX.ToRadians( earthAngle.x * frameTime ) );
            var p = pWS.project( camera );
            billboardGeometry.vertices[i].set( p.x, p.y, 0 );
            //billboardGeometry.colors[i].setRGB( 255, 0, 0 );
	    }
        billboardGeometry.verticesNeedUpdate = true;
        billboardGeometry.colorsNeedUpdate = true;
*/
        // Billboards in 3D Scene
        //billboards.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), PX.ToRadians( earthAngle.x * frameTime ) );


        // Change latitude min/max
        /*if( earthOrbitControls )
        {
            var t = PX.Pow4( distanceToCenterNorm );
            earthOrbitControls.minPolarAngle = PX.Lerp( Math.PI * 0.3, Math.PI * 0.5, t );
            earthOrbitControls.maxPolarAngle = PX.Lerp( Math.PI * 0.7, Math.PI * 0.5, t );
        }*/


        // Update Tween
        TWEEN.update();


        // Camera
        //
        //if( !earthOrbitControls )
            //camera.position.z = Params.CameraDistance;
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
    var ppp = new THREE.Vector3( 0.5, 1.0, -0.2 );
    ppp = ppp.normalize();
    Params.LightDirX = ppp.x;
    Params.LightDirY = ppp.y;
    Params.LightDirZ = ppp.z;
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

    // Move map Center
    //
    var distanceToCenter = ( camera.position.length() );
    var distanceToCenterNorm = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
    var camLatLon = PX.Utils.ConvertPosToLatLon( camera.position.x, camera.position.y, camera.position.z, distanceToCenter );
    camLatLon.x = ( 90.0 - camLatLon.x );
    camLatLon.y = camLatLon.y - 90.0;
    Params.Latitude = camLatLon.x;
    Params.Longitude = camLatLon.y;
    //
    var mapCenter = new google.maps.LatLng( camLatLon.x, camLatLon.y );
    map.setCenter( mapCenter );

    // Intersection test per mesh
    //
    for( var i=0; i<locations.length; i++ )
    {
        var intersects = g_Raycaster.intersectObject( locationMeshes[i], false );
        if( intersects.length > 0 )
        {
            cameraSourcePoint = camera.position.clone();
            cameraTargetPoint = intersects[ 0 ].object.position.clone().normalize();

            Params.CameraDistance *= 1.0 - ( 1.0 / PX.kZoomMaxLevel );
            Params.CameraDistance = PX.Clamp( Params.CameraDistance, PX.kCameraMinDistance, PX.kCameraMaxDistance );

            var position = { x : cameraSourcePoint.x, y: cameraSourcePoint.y, z: cameraSourcePoint.z };
            var target = { x : cameraTargetPoint.x*Params.CameraDistance, y: cameraTargetPoint.y*Params.CameraDistance, z: cameraTargetPoint.z*Params.CameraDistance };
            var tween = new TWEEN.Tween( position ).to( target, 1000 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            //tween.delay( 50 );
            tween.start();
            tween.onStart(function()
            {
            });
            tween.onUpdate(function()
            {
                camera.position.x = position.x;
                camera.position.y = position.y;
                camera.position.z = position.z;
            });
            tween.onComplete(function()
            {
                if( zoomLevel < PX.kZoomMaxLevel )
                {
                    var distanceToCenter = Math.ceil( camera.position.length() );

                    prevZoomLevel = zoomLevel;
                    zoomLevel = ComputeZoomLevel( distanceToCenter );

                    if( prevZoomLevel !== zoomLevel )
                    {
                        //
                        Params.MapGridSize = ComputeMapGridSizeFromZoomLevel( zoomLevel );
                        markerCluster.setGridSize( Params.MapGridSize );

                        map.setZoom( zoomLevel );
                        doLocationsGather = true;
                        visibleClustersCount = 0;

                    }
                }
            });
            break;
        }
    }

    doLocationsGather = true;
    visibleClustersCount = 0;
    //visibleMarkersCount = 0;
}

function OnMouseMove(event)
{
    //isMouseMoved = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function OnMouseWheel( event )
{
    var distanceToCenter = ( camera.position.length() );

    //
    prevZoomLevel = zoomLevel;
    zoomLevel = ComputeZoomLevel( distanceToCenter );

    if( prevZoomLevel !== zoomLevel )
    {
        //
        Params.MapGridSize = ComputeMapGridSizeFromZoomLevel( zoomLevel );
        markerCluster.setGridSize( Params.MapGridSize );

        map.setZoom( zoomLevel );
        doLocationsGather = true;
        visibleClustersCount = 0;
        //visibleMarkersCount = 0;
    }

    Params.CameraDistance = PX.Clamp( distanceToCenter, PX.kCameraMinDistance, PX.kCameraMaxDistance );
}

function OnMouseOut()
{
    isMouseDown = false;
    previousMouseX = 0.0;
    previousMouseY = 0.0;
    mouseX = 0.0;
    mouseY = 0.0;
}
