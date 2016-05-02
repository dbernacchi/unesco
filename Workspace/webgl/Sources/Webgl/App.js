/* global THREE: true } */

var PX = PX || {}; 


var g_Stats = null;
var g_GUI = null;

var windowWidth, windowHeight;
var deviceContentScale = 1.0;

var modelRenderer = null;

var aspectRatio = 1.0;
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
var bgQuad = null;
var fgCamera = null;
var fgScene = null;

var trackball = null;

var postFXScene = null;
var postFXQuad = null;
var postFXScene2 = null;
var postFXQuad2 = null; 

var composer = null;
var renderMainPass = null;
var effectBloomPass = null;
var effectTiltShiftHBlur = null;
var effectTiltShiftVBlur = null;
var effectFXAAPass = null;
var effectCopyPass = null;

var bmFontDescriptor = null;

var map;
var markerCluster;
//var doLocationsGather = true;
//var visibleClustersCount = 0;
//var visibleMarkersCount = 0;

var clickedMarkerID = -1;

var zoomLevel = 0.0;
var prevZoomLevel = 0.0;

var cameraLookAtPoint = null;

var sunLight = null;
var earth = null;
var locationMarkers = null;

// Raycaster
var g_Raycaster = null;

// Locations
var locationsDB = [];
var locationsDBMap = new Map();

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
var clock = new THREE.Clock();

// Interaction
var mouseX = 0.0;
var mouseY = 0.0;
var previousMouseX = 0.0;
var previousMouseY = 0.0;
var mouseDeltaX = 0.0;
var mouseDeltaY = 0.0;
var isMouseDown = false;
var isMouseMoved = false;
var isMouseClick = false;
var mouseVector3d = new THREE.Vector3();



/*$(window).unload(function(e) 
{
});

$(window).blur(function(e) 
{
});

$(window).focus(function(e) 
{
    OnResize();
});*/
/*
THREE.DefaultLoadingManager.onProgress = function( item, loaded, total )
{
    var percentage = Math.round( ( loaded / total ) * 80.0 );
    //var str = parseInt( percentage ) + " %";
    //progressBarElement.text( "Loading: " + loaded + " / " + total + ". Item: " + item );
    //console.log( percentage );
    //preloaderFG.css( "width", (percentage) + '%' );
    
    //UNESCO.bottomStatusBar(percentage);
};
*/


function ParseBitmapFont( data )
{
	bmFontDescriptor = new BitmapFontDescriptor();
    bmFontDescriptor.Parse( data );
	//bmFontDescriptor.instantiate( url );
} 


function CreateRenderer()
{
    renderer = new THREE.WebGLRenderer( { antialias: true, precision: PX.ShaderPrecision, stencil: false, alpha: true } );
    renderer.setClearColor( 0x000000, 0 );
    //renderer.gammaInput = true;
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
    renderer.sortObjects = false;
    //renderer.autoUpdateObjects = false;
}


function LoadData()
{
    var globeDiffuseTex = "webgl/data/textures/earth_diffuse_blue_4k.jpg";
    //var globeDiffuseTex = "webgl/data/textures/earth_diffuse_blue.jpg";
    var globeNightLightsTex = "webgl/data/textures/earth_night_lights_2k.jpg";  // Default night lights to 2k
    //var globeNightLightsTex = "webgl/data/textures/earth_night_lights.jpg";

    if( PX.IsMobile )
    {
        globeDiffuseTex = "webgl/data/textures/earth_diffuse_blue_4k.jpg";
        globeNightLightsTex = "webgl/data/textures/earth_night_lights_2k.jpg";
    }

    $.when(
        LoadTexture( "EarthDiffuseMap", globeDiffuseTex )
        , LoadTexture( "EarthNormalMap", "webgl/data/textures/earth_normals.png" )
        , LoadTexture( "EarthSpecularMap", "webgl/data/textures/earth_specular.jpg" )
        , LoadTexture( "EarthNightLightsMap", globeNightLightsTex )
        , LoadTexture( "Circle", "webgl/data/textures/circle_full.png" )
        , LoadTexture( "EarthShadow", "webgl/data/textures/blobshadow.png" )
        , LoadTexture( "TooltipLine", "webgl/data/textures/line2.png" )
        , LoadShaderData("EarthVertexShader", "webgl/data/shaders/Earth.vertex")
        , LoadShaderData("EarthPixelShader", "webgl/data/shaders/Earth.fragment")
        , LoadShaderData("ModelVertexShader", "webgl/data/shaders/Model.vertex")
        , LoadShaderData("ModelPixelShader", "webgl/data/shaders/Model.fragment")
        , LoadText( "TextAtlasXml", "webgl/data/fonts/font_bold.xml" )
        , LoadTexture( "TextAtlasTex", "webgl/data/fonts/font_bold_0.png" )
        //, LoadText( "TextAtlasXml", "webgl/data/fonts/font.xml" )
        //, LoadTexture( "TextAtlasTex", "webgl/data/fonts/font_0.png" )
        //, LoadText( "TextAtlasXml", "webgl/data/fonts/arialLarge.xml" )
        //, LoadTexture( "TextAtlasTex", "webgl/data/fonts/arialLargeTransparent.png" )
        , LoadJsonData("LocationsJson", "webgl/data/latlon.json")
    ).done(function ()
    {
        container.width = window.innerWidth;
        container.height = window.innerHeight;
        container.style.width = window.innerWidth;
        container.style.height = window.innerHeight;
        //
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( container.width, container.height );
        //
        windowWidth = container.width;
        windowHeight = container.height;
        Params.WindowWidth = windowWidth;
        Params.WindowHeight = windowHeight;
        deviceContentScale = window.devicePixelRatio || 1;

        BeginApp();
    } );
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
    deviceContentScale = window.devicePixelRatio;

    
    Setup();
    OnResize();
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
    //InitLoaders();

    //
    ParseBitmapFont( PX.AssetsDatabase["TextAtlasXml"] );


    // Webpage states
    WebpageStates.FilterSwitches = [ 0, 0, 0 ];


    // Create main scene
    //
    scene = new THREE.Scene();

    aspectRatio = windowWidth / windowHeight;
    console.log( "+--+  Dims: ", container.width, container.height );
    console.log( "+--+  Device Content Scale: ", window.devicePixelRatio );
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
    /*if( PX.IsMobile )
    {
        var artAmbLight = new THREE.HemisphereLight( 0x3a3a55, 0x020205, 0.5 );
        scene.add( artAmbLight );
    }*/

    // Composer
    //
	var parameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		stencilBuffer: false
	};
    var renderTarget = null;
    if( PX.IsMobile ) 
        renderTarget = new THREE.WebGLRenderTarget( windowWidth, windowHeight, parameters );
    else
        renderTarget = new THREE.WebGLRenderTarget( windowWidth * deviceContentScale, windowHeight * deviceContentScale, parameters );
    renderTarget.texture.generateMipmaps = false;
    composer = new THREE.EffectComposer( renderer, renderTarget );
    //
    var renderEarthShadowPass = new THREE.RenderPass( earth.sceneShadow, camera );
    renderEarthShadowPass.clear = true;
    composer.addPass( renderEarthShadowPass );
    renderMainPass = new THREE.RenderPass( scene, camera );
    renderMainPass.clear = false;
    composer.addPass( renderMainPass );

    if( !PX.IsMobile )
    {
        // Bloom
        effectBloomPass = new THREE.BloomPass( 0.85, 15, 4, 512 );
        composer.addPass( effectBloomPass );
    }

    if( !PX.IsMobile )
    {
	    // tilt shift
	    effectTiltShiftHBlur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
	    effectTiltShiftVBlur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
	    effectTiltShiftHBlur.uniforms[ 'r' ].value = Params.TiltShiftPosition;
	    effectTiltShiftVBlur.uniforms[ 'r' ].value = Params.TiltShiftPosition;
	    effectTiltShiftHBlur.uniforms[ 'h' ].value = Params.TiltShiftStrength / (windowWidth*deviceContentScale);
	    effectTiltShiftVBlur.uniforms[ 'v' ].value = Params.TiltShiftStrength / (windowHeight*deviceContentScale);
        composer.addPass( effectTiltShiftHBlur );
        composer.addPass( effectTiltShiftVBlur );
    }

    if( !PX.IsMobile )
    {
    	effectFXAAPass = new THREE.ShaderPass( THREE.FXAAShader );
    	effectFXAAPass.uniforms[ 'resolution' ].value.set( 1.0 / (windowWidth*deviceContentScale), 1.0 / (windowHeight*deviceContentScale) );
        composer.addPass( effectFXAAPass );
    }

    //effectCopyPass = new THREE.ShaderPass( THREE.CopyShader );
    //composer.addPass( effectCopyPass );
    //effectCopyPass.uniforms.opacity.value = 1.0;
    //effectCopyPass.renderToScreen = true;

    // PostFX Layer
    postFXScene = new THREE.Scene();
    var postFXMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1.0, transparent: true });//, vertexColors: THREE.VertexColors });
    postFXMat.blending = THREE.AdditiveBlending;
    postFXMat.depthTest = false;
    postFXMat.depthWrite = false;
    postFXQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry(2, 2, 0), postFXMat );
    postFXScene.add( postFXQuad );

    // PostFX Layer
    postFXScene2 = new THREE.Scene();
    var postFXMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1.0, transparent: true}); //, vertexColors: THREE.VertexColors });
    postFXMat2.depthTest = false;
    postFXMat2.depthWrite = false;
    postFXQuad2 = new THREE.Mesh( new THREE.PlaneBufferGeometry(2, 2, 0), postFXMat2 );
    postFXScene2.add( postFXQuad2 );

    //
    fgCamera = new THREE.Camera();

    // Raycaster
    //
    g_Raycaster = new THREE.Raycaster();

    // Events
    //
    window.addEventListener( 'resize', OnResize, false );
    renderer.domElement.addEventListener( 'mousemove', OnMouseMove, false );
    renderer.domElement.addEventListener( 'mouseout', OnMouseOut, false );
    renderer.domElement.addEventListener( 'mousedown', OnMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', OnMouseUp, false );
    renderer.domElement.addEventListener( 'mousewheel', OnMouseWheel, false );
	renderer.domElement.addEventListener( 'touchstart', onTouchStart, false );
	renderer.domElement.addEventListener( 'touchend', onTouchEnd, false );
	renderer.domElement.addEventListener( 'touchmove', onTouchMove, false );

    //
    if( PX.kEnableStats ) InitStats();
    if( PX.kEnableGUI ) InitGUI();

    // Init Trackball
    //
    trackball = new PX.CameraTrackball();
    trackball.Init( camera );
    trackball.rotateFactor = 0.5;
    trackball.damping = 0.1;

    // Add a callback that reports when a state change happens
    //
    appStateMan.AddStateChangeCallback( function( state )
    {
        //console.log( "+--+  Changing State:\t", PX.AppStatesString[ state ] );
		switch(state)
        {
			case PX.AppStates.AppStateEntry:
                // Reset time and show explore button
                startTime = timeNow();
                currentTime = 0.0;

                var target = { x : 0.0, y: 1.0 };
                var tween = new TWEEN.Tween( earth.posY ).to( target, 1000 );
                tween.easing( TWEEN.Easing.Sinusoidal.InOut );
                tween.delay( 1000 );
                tween.start();
                tween.onComplete( function()
                {
                    earth.isPosAnimDone = true;
                    //appStateMan.SetState( PX.AppStates.AppStateEntry );
                });

				
				UNESCO.buildBrowse(
					function(){
						
                        PopulateLocationsWithModelInfo( UNESCO.reconstructions() );
                        locationMarkers.FillLocationTypes( locationsDB );
					
						UNESCO.showExploreButton();	
					}
				);
				
				break;
			case PX.AppStates.AppStateLevel0:	
				UNESCO.hideLegend();
				UNESCO.showZoomIn();
	            UNESCO.hideZoomOut();
				break;

            case PX.AppStates.AppStateLevel1ToLevel0:
                break;

			case PX.AppStates.AppStateLevel0ToLevel1:
                // Default: Reconstructed are filtered
                
                UNESCO.legendClickable();
                
                if( WebpageStates.IsFirstTimeRun )
                {
			        UpdateFilterSwitches( PX.ModelTypeReconstructed );
                    WebpageStates.IsFirstTimeRun = false;
                }
                break;

			case PX.AppStates.AppStateLevel1:
                // Default: Color markers with the filter applied
                locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );
				UNESCO.showLegend();
	            UNESCO.showZoomOut();
	            UNESCO.hideZoomIn();
				break;
					
			case PX.AppStates.AppStateLevel2:
                // Only show browse when hitting Level 2
                //if( clickedMarkerID !== -1 )
                    //UNESCO.showBrowse( clickedMarkerID );
				UNESCO.hideZoomIn();
	            UNESCO.hideZoomOut();
				break;

			case PX.AppStates.AppStateLevel2ToLevel1:
				UNESCO.hideBrowse();
				UNESCO.legendClickable();
				
				break;

            default:
                break;
		}

    });

	/*if( !modelRenderer )
    {
        console.log( "+--+  Create Model Renderer (on Setup)" );
		var modelContainer = $(".UNESCO#slide-9 #glModelContainer");
		modelRenderer = new PX.ModelRenderer();
		modelRenderer.Init( modelContainer[0], windowWidth, windowHeight );
	}*/


    // Click callbacks on HTML filter buttons
    $(document).on( 'click', "#legend a.clickable", function()
    {
   
   	
        if( appStateMan.IsState( PX.AppStates.AppStateLevel1 ) || appStateMan.IsState( PX.AppStates.AppStateLevel2 ) )
        {
        	
        	if($(this).hasClass('disabled')){
	        	
	        	$("#legend > .clr > li > a" ).removeClass('disabled');
	        	
	        	var cls = $(this).attr('class');
	        	
	        	var status = $(this).attr('status');
	        	
	        	$("#browse").attr('status', status);
	        	
	        	var location_id = $("#browse").attr('location-id');
	        	
	        	if(appStateMan.IsState( PX.AppStates.AppStateLevel2 )){
	        		UNESCO.showBrowse( location_id );
	        	}
	        	
	        	$("#legend > .clr > li > a" ).each(function(){
	        		
	        		if(cls != $(this).attr('class')){
	        			$(this).addClass('disabled');
	        		}
	        	});	
	        	
	            var index = $(this).parent().index();
	            
				UpdateFilterSwitches( index );
	            locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );	
	            
	        } else {
				
				UNESCO.filtersOff($(this));
	
	        }
	        
        
        }
    });


    // TEMP:
    /*var modelFastLane = true;
    if( modelFastLane )
    {
		UNESCO.hideSplash();
		$(".UNESCO#browse").hide();
	    $(".UNESCO#slide-5").hide();
	    $(".UNESCO#slide-9").show();
	    Params.MainScene = false;

	    var modelContainer = $(".UNESCO#slide-9 #glModelContainer");
	    if (!modelRenderer) {
		    modelRenderer = new PX.ModelRenderer();
		    modelRenderer.Init(modelContainer[0], windowWidth, windowHeight);
	    }
	    // @NOTE: We do not pass filename extension. That's added internally in the Loaders
        var modelIndex = 10;
        if( PX.ModelNames[ modelIndex ].length > 0 )
        {
                modelRenderer.Load( PX.ModelRootPath + PX.ModelPaths[ modelIndex ], PX.ModelNames[ modelIndex ], function( per ) {
		        //console.log("+---+  Loading: " + parseInt(per * 100.0) + "%" );
	        });
        }
        else
        {
            console.log( "****  3d Model not available. Index: ", (modelIndex+1) );
        }
    }*/

    appStateMan.ChangeState( PX.AppStates.AppStateEntry );

    //
    startTime = timeNow();

    // Move to mainloop
    MainLoop();
}


function InitStats()
{
    g_Stats = new Stats();
    g_Stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    // align top-left
    g_Stats.domElement.style.position = 'absolute';
    g_Stats.domElement.style.left = '0px';
    g_Stats.domElement.style.top = '50%';
    if( Params.ShowStats ) g_Stats.domElement.style.visibility = 'visible';
    else g_Stats.domElement.style.visibility = 'hidden';
    document.body.appendChild( g_Stats.domElement );
}


function InitGUI()
{
    g_GUI = new dat.gui.GUI( { width: 300 } );
    g_GUI.close();

/*    g_GUI.add( Params, 'MainScene' ).onChange( function( newValue ) 
    {
        if( newValue )
        {
            progressBarElement.text( "" );
        }

        if( modelRenderer )
        {
            modelRenderer.Clear();
        }

        if( !modelRenderer )
        {
            var modelContainer = document.getElementById( "glModelContainerTEST" );
            modelContainer.style.top = "0px";
            modelContainer.style.left = "0px";
            modelContainer.style.right = "0px";
            modelContainer.style.bottom = "0px";

            modelRenderer = new PX.ModelRenderer();
            modelRenderer.Init( modelContainer, windowWidth, windowHeight );
        }

        if( !newValue )
        {
            modelRenderer.Load( "webgl/data/models/06_Mihrab_of_the_Mosque_Al_Hasan/mesh.js",
            //modelRenderer.Load( "webgl/data/models/01_Nimrud_Relief/mesh.js", 
            function( per )
            {
                console.log( "+---+  Loading: ", per );
            });
        }
    });*/

    /*g_GUI.add( Params, "EarthShadowScaleX" ).min(-400.0).max(400.0).step(0.001);
    g_GUI.add( Params, "EarthShadowScaleY" ).min(-400.0).max(400.0).step(0.001);
    g_GUI.add( Params, "EarthShadowScaleZ" ).min(-400.0).max(400.0).step(0.001);
    g_GUI.add( Params, "EarthShadowPosX" ).min(-100.0).max(100.0).step(0.001);
    g_GUI.add( Params, "EarthShadowPosY" ).min(-100.0).max(100.0).step(0.001);
    g_GUI.add( Params, "EarthShadowPosZ" ).min(-100.0).max(100.0).step(0.001);*/

    /*g_GUI.add( Params, 'ShowMaps' ).onChange( function( newValue ) 
    {
        var maps = $("#map");
        maps.css( "z-index", newValue ? 1000 : -1000 );
    });*/
    
    /*g_GUI.add( Params, 'ShowStats' ).onChange( function( newValue ) 
    {
        if( g_Stats )
            g_Stats.domElement.style.visibility = newValue ? 'visible' : 'hidden';
    });*/
	
    //g_GUI.add( Params, "EnableSunLight" );
    //g_GUI.addFolder( "BLOOM" );
    //g_GUI.add( Params, "EnableBloom" );
    //g_GUI.add( Params, "BloomOpacity" ).min(0.0).max(1.0).step(0.001);
/*    g_GUI.addFolder( "MODEL SHADING" );
    g_GUI.add( Params, "ModelAmbientIntensity" ).min(0.0);
    g_GUI.add( Params, "ModelDiffuseIntensity" ).min(0.0);
    g_GUI.add( Params, "ModelSpecularIntensity" ).min(0.0);
    //g_GUI.add( Params, "NormalMapIntensity" ).min(0.0).max(1.0).step(0.001);
    g_GUI.add( Params, "ModelRoughness" ).min(0.0).max(1.0).step(0.001);*/

    g_GUI.addFolder( "EARTH SHADING" );
    g_GUI.add( Params, "AmbientIntensity" ).min(0.0);
    g_GUI.add( Params, "DiffuseIntensity" ).min(0.0);
    g_GUI.add( Params, "SpecularIntensity" ).min(0.0);
    g_GUI.add( Params, "NormalMapIntensity" ).min(0.0).max(1.0).step(0.001);
    g_GUI.add( Params, "EarthRoughness" ).min(0.0).max(1.0).step(0.001);
    //g_GUI.add( Params, "HalfLambertPower" ).min(0.0);
    g_GUI.add( Params, "RimAngle" ).min(0.0);
    g_GUI.add( Params, "DiffuseRimIntensity" ).min(0.0);
    g_GUI.add( Params, "NightDayMixFactor" ).min(0.0).max(1.0).step(0.001);
    //g_GUI.addFolder( "CLOUDS SHADING" );
    //g_GUI.add( Params, "CloudsIntensity" ).min(0.0).max(1.0).step(0.01);
    //g_GUI.add( Params, "CloudsShadowIntensity" ).min(0.0).max(1.0).step(0.01);
    //g_GUI.add( Params, "CloudsShadowOffset" ).min(0.0).max(20.0).step(0.01);
    g_GUI.addFolder( "GLOBE LIGHT DIRECTION" );
    g_GUI.add( Params, "LightDirX" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.add( Params, "LightDirY" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.add( Params, "LightDirZ" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.addFolder( "GLOBE CAMERA" );
    //g_GUI.add( Params, "CameraDistance" ).min( PX.kEarthScale*1.333 ).max( 300.0 );
    g_GUI.add( Params, 'CameraNearPlane' ).onChange( function( newValue ) 
    {
        PX.kCameraNearPlane = newValue;
        camera.near = newValue;
        camera.updateProjectionMatrix();
    } );
    g_GUI.addFolder( "INTERACTION" );
    g_GUI.add( Params, "EarthRotationSpeed" ).min(0.0).max(1.0).step(0.001);
    /*g_GUI.add( Params, "MapGridSize" ).min(0).max(20).step(1).onChange( function( newValue ) 
    {
        console.log( parseInt(newValue) );
        markerCluster.setGridSize( parseInt(newValue) );
        markerCluster.repaint();
        locationMarkers.doPopulation = true;
    });*/
    //g_GUI.add( Params, "Latitude" ).listen();
    //g_GUI.add( Params, "Longitude" ).listen();
    //g_GUI.add( Params, "ZoomLevel" ).listen();
    //g_GUI.add( Params, "Intersects" ).listen();
    g_GUI.add( Params, "OutlineThickness" ).min(0.0).max(1000.0)
    g_GUI.add( Params, "OutlineDist" ).min(-1.0).max(1.0).step(0.001);
    //g_GUI.add( Params, "MarkerCircleDist" ).min(-1.0).max(1.0).step(0.001);
    g_GUI.add( Params, "MarkerTextDist" ).min(-1.0).max(1.0).step(0.001);

    g_GUI.add( Params, "TiltShiftStrength" ).min(0.0).max(50.0);
    g_GUI.add( Params, "TiltShiftMaxStrength" ).min(0.0).max(100.0).onChange( function( newValue )
    {
        Params.TiltShiftMaxStrength = newValue;

        var tiltStart = { x: Params.TiltShiftStrength };
        var tiltEnd = { x: newValue };
        var tiltTween = new TWEEN.Tween( tiltStart ).to( tiltEnd, 100.0 );
        tiltTween.easing( TWEEN.Easing.Linear.None );
        tiltTween.start();
        tiltTween.onUpdate( function()
        {
            Params.TiltShiftStrength = tiltStart.x;
        });
    });
    g_GUI.add( Params, "TiltShiftPosition" ).min(0.0).max(1.0);

    //g_GUI.remember( Params );
}


function OnExploreClick()
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


function Update( time, frameTime )
{
    /*if( time > 4.0 && PX.kTimeOut )
    {
        OnExploreClick();
        PX.kTimeOut = false;
    }*/

    //
    mouseDeltaX = mouseX - previousMouseX;
    mouseDeltaY = mouseY - previousMouseY;
    previousMouseX = mouseX;
    previousMouseY = mouseY;


    //
    if( appStateMan.IsState( PX.AppStates.AppStateLevel0 ) 
        || appStateMan.IsState( PX.AppStates.AppStateLevel1 ) )
    {
        if( isMouseDown )
        {
            var rotSpeed = PX.Saturate( Params.CameraDistance / PX.kCameraMaxDistance );
            trackball.rotateFactor = rotSpeed * Params.EarthRotationSpeed;

            trackball.HandleMouseEvents( 1, 1, mouseDeltaX, mouseDeltaY, frameTime, aspectRatio );
        }

        //
        trackball.Update( camera, frameTime );
        cameraLookAtPoint.copy( trackball.camLookAt );
    }


    mouseVector3d.set( mouseX, Params.WindowHeight-mouseY, 0.0 );


    // Update Earth
    //
    //if( earth )
    {
        earth.Update( currentTime, frameTime, camera );
    }

    // Do marker population
    if( locationMarkers.doPopulation )
    {
        locationMarkers.PopulateMarkers( markerCluster, locationsDB, camera );
    }

    // Avoidance
    locationMarkers.MarkerAvoidance( markerCluster, frameTime );

    //
    locationMarkers.Update( currentTime, frameTime, camera );

    // Update Tween
    TWEEN.update();

    //
    appStateMan.Update();


    // Get Sun position and map it to our light
    //
    if( Params.EnableSunLight )
    {
        var nowDate = new Date();
        var sunLatLon = SunCalc.getPositionLatLon( nowDate, 0, 0 );
        var ppp = PX.Utils.FromLatLon( PX.ToDegrees(sunLatLon.lat), PX.ToDegrees(sunLatLon.lon), PX.kEarthScale, 0.0 );
        if( sunLight ) sunLight.position.set( ppp.x, ppp.y, ppp.z );
        Params.LightDirX = ppp.x;
        Params.LightDirY = ppp.y;
        Params.LightDirZ = ppp.z;
    }
    else
    {
        var ppp = new THREE.Vector3( Params.LightDirX, Params.LightDirY, Params.LightDirZ );
        if( sunLight ) sunLight.position.set( ppp.x, ppp.y, ppp.z );
    }


    // Update Tilt Shift stuff
    //
    if( effectTiltShiftHBlur )
    {
	    effectTiltShiftHBlur.uniforms[ 'r' ].value = Params.TiltShiftPosition;
	    effectTiltShiftVBlur.uniforms[ 'r' ].value = Params.TiltShiftPosition;
	    effectTiltShiftVBlur.uniforms[ 'v' ].value = Params.TiltShiftStrength / windowHeight;
	    effectTiltShiftHBlur.uniforms[ 'h' ].value = Params.TiltShiftStrength / windowWidth;

        // Change tilt focus position
        if( appStateMan.IsState( PX.AppStates.AppStateLevel1ToLevel2 )
            || appStateMan.IsState( PX.AppStates.AppStateLevel2 )
            || appStateMan.IsState( PX.AppStates.AppStateLevel2ToLevel1 ) )
        {
            if( locationMarkers.clickedMarkerIndex !== -1 )
            {
                var p2d = locationMarkers.markers[ locationMarkers.clickedMarkerIndex ].position.clone();
                p2d.applyQuaternion( earth.mesh.quaternion );
                p2d.project( camera );
                p2d.x = p2d.x * 0.5 + 0.5;
                Params.TiltShiftPosition = p2d.x;
                //console.log( "xxParams.TiltShiftPosition: ", Params.TiltShiftPosition );
            }
        }
    }

    // Update composer FX
    if( effectFXAAPass )
    {
        effectFXAAPass.uniforms[ 'resolution' ].value.set( 1.0 / (windowWidth*deviceContentScale), 1.0 / (windowHeight*deviceContentScale) );
    }
}


function Render()
{
    renderer.clear();

    //
    renderer.setViewport( 0, 0, windowWidth, windowHeight );
    composer.render();
    //
    postFXQuad2.material.opacity = Params.BloomOpacity;
    if( !PX.IsMobile )
        postFXQuad2.material.map = composer.renderTarget1;
    else
        postFXQuad2.material.map = composer.renderTarget2;
    renderer.setViewport( 0, 0, windowWidth, windowHeight );
    renderer.render( postFXScene2, fgCamera );

    //
    renderer.setViewport( 0, 0, windowWidth, windowHeight );
    renderer.render( locationMarkers.markerScene, locationMarkers.camera2d );
}


function MainLoop() 
{
    requestAnimationFrame(MainLoop);

    // Use timestep
    if( appStateMan.GetCurrentState() >= PX.AppStates.AppStateEntry )
    {
        clockTime = timeNow() - startTime;
        var timeDiff = clockTime - previousTime;
        var delta = Math.min( 1.0 / 60.0, timeDiff );
        previousTime = currentTime;
        currentTime += delta;
        frameTime = delta;
    }

    if( PX.kEnableStats ) g_Stats.begin();

    if( Params.MainScene )
    {
        Update( currentTime, frameTime );
        Render();
    }
    else
    {
        modelRenderer.OnFrame( currentTime, frameTime );
    }

    if( PX.kEnableStats )
    {
        g_Stats.end();
    }
}


function UpdateFilterSwitches( id )
{
    //console.log( "UpdateFilterSwitches", id );

    switch( id )
    {
        case PX.ModelTypeDestroyed:
            WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ]           = 1 - WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ];
            WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ]   = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed ]       = -1;
            WebpageStates.CurrentActiveFilterIndex                          = ( WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ] > 0 ) ? 0 : -1;
            break;
        case PX.ModelTypeUnderConstruction:
            WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ]           = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ]   = 1 - WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ];
            WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed]        = -1;
            WebpageStates.CurrentActiveFilterIndex                          = ( WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ] > 0 ) ? 1 : -1;
            break;
        case PX.ModelTypeReconstructed:
            WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ]           = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ]   = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed ]       = 1 - WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed ];
            WebpageStates.CurrentActiveFilterIndex                          = ( WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed ] > 0 ) ? 2 : -1;
            break;
        case 3:
            WebpageStates.FilterSwitches[ PX.ModelTypeDestroyed ]           = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeUnderConstruction ]   = -1;
            WebpageStates.FilterSwitches[ PX.ModelTypeReconstructed ]       = -1;
            WebpageStates.CurrentActiveFilterIndex                          = -1;
            break;            
        default:
            break;
    }
}


function ZoomInFromLevel0ToLevel1( isUserClickOnLocation )
{
    if( appStateMan.IsState( PX.AppStates.AppStateLevel0 ) 
        || appStateMan.IsState( PX.AppStates.AppStateLevel1 ) 
        || appStateMan.IsState( PX.AppStates.AppStateLevel2 ) )
    {
        if( isUserClickOnLocation )
        {
            if( isMouseClick )
            {
                clickedMarkerID = -1;
                //console.log( "ZoomInFromLevel0ToLevel1 (0)" );
                var res = locationMarkers.OnMouseClickEvent( mouseVector3d, camera, true,
                function( object )  // Callback returning clicked marker
                {
                    //console.log( "+--+  Clicked Marker ID:\t", object.id );                    
                    clickedMarkerID = object.id;

                    // Show browse immediately on click
					UNESCO.hideZoomIn();
	            	UNESCO.hideZoomOut()
                    UNESCO.showBrowse( object.id );
                } );
            }
        }
        else
        {
            locationMarkers.OnMouseClickEvent( mouseVector3d, camera, false, null );
        }
    }
}


function ZoomOutFromLevel1ToLevel0( isMouseWheel )
{
    if( appStateMan.IsState( PX.AppStates.AppStateLevel1 ) )
    {
        if( !isMouseWheel || event.wheelDelta < 0.0 )
        {
            //console.log( "ZoomOutFromLevel1ToLevel0" );

            // Change state
            appStateMan.SetState( PX.AppStates.AppStateLevel1ToLevel0 );

            // Tilf Shift
            if( effectTiltShiftHBlur )
            {
                var tiltStart = { x: Params.TiltShiftStrength };
                var tiltEnd = { x: 0.0 };
                var tiltTween = new TWEEN.Tween( tiltStart ).to( tiltEnd, 1000.0 );
                tiltTween.easing( TWEEN.Easing.Quintic.InOut );
                tiltTween.start();
                tiltTween.onUpdate( function()
                {
                    Params.TiltShiftStrength = tiltStart.x;
                });
            }

            // Disable auto scale in main loop
            locationMarkers.zoomLevel1IntroAnimDone = false;

            // Move camera far far away
            Params.CameraDistance = PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, 1.0 );
            var cameraTargetPoint = camera.position.clone().normalize().multiplyScalar( Params.CameraDistance );
            var tween = new TWEEN.Tween( camera.position ).to( cameraTargetPoint, 1000 ); //Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();

            // Outline Global Scale
            /*var ogsTarget = new THREE.Vector2( PX.EPSILON, PX.EPSILON );
            var tweenogs = new TWEEN.Tween( locationMarkers.outlineGlobalScale ).to( ogsTarget, Params.AnimTime * 1000.0 * 0.5 );
            tweenogs.easing( TWEEN.Easing.Quadratic.InOut );
            tweenogs.start();*/

            // Scale down all Level 1 markers
            var target = new THREE.Vector3( PX.EPSILON, PX.EPSILON, PX.EPSILON );
            for( var i=0; i<locationMarkers.markersCount; ++i )
            {
                var m = locationMarkers.markers[ i ];

                m.tween = new TWEEN.Tween( m.scale ).to( target, 1000.0 );
                m.tween.easing( TWEEN.Easing.Quintic.InOut );
                m.tween.start();
                // Next calls only happen once, when last marker scale down is done
                if( i === locationMarkers.markersCount-1 )
                {
                    m.tween.onComplete( function()
                    {
                        //
                        locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );

                        // Cancel any markerd marker 
                        locationMarkers.currentMouseOverMarkerIndex = -1;

                        // Restore original cluster colors
                        for( var i=0; i<locationMarkers.markersCount; ++i )
                        {
		                    locationMarkers.geomColorArray[ i*3+0 ] = PX.kLocationColor.r;
                            locationMarkers.geomColorArray[ i*3+1 ] = PX.kLocationColor.g;
                            locationMarkers.geomColorArray[ i*3+2 ] = PX.kLocationColor.b;
                        }

                        // When all scale down is done, recompute Level 0 markers and do animation in
                        locationMarkers.SetZoomLevel( 0 );
                        locationMarkers.doPopulation = true;
                        locationMarkers.doAvoidance = true;

                        // Do level0 animation
                        locationMarkers.TweenLevel0( 1.0, 1.0 * 1000.0, 0.0 * 1000.0, 
                        null, 
                        function()
                        {
                            appStateMan.SetState( PX.AppStates.AppStateLevel0 );
                        } );
                    });
                }
            }
        }
    }
}


function OnResize()
{
    if( !renderer || !camera )
        return;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    Params.WindowWidth = windowWidth;
    Params.WindowHeight = windowHeight;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( windowWidth, windowHeight );
    composer.setSize( windowWidth * deviceContentScale, windowHeight * deviceContentScale );
    
    locationMarkers.OnResize( windowWidth, windowHeight );

    if( modelRenderer )
    {
        modelRenderer.OnResize( windowWidth, windowHeight );
    }
}


function onTouchStart( event ) 
{
    isMouseDown = true;
    isMouseMoved = false;

    mouseX = event.touches[ 0 ].pageX;
    mouseY = event.touches[ 0 ].pageY;

    switch( appStateMan.GetCurrentState() )
    {
        case PX.AppStates.AppStateLevel1:
        {
            locationMarkers.OnMouseOverEvent( true );
            break;
        }
        default:
            break;
    }

    previousMouseX = mouseX;
    previousMouseY = mouseY;
}


function onTouchEnd( event ) 
{
    isMouseDown = false;
    if( isMouseMoved ) isMouseClick = false;
    else isMouseClick = true;
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    switch( appStateMan.GetCurrentState() )
    {
        case PX.AppStates.AppStateLevel1:
        {
            locationMarkers.OnMouseOverEvent( isMouseClick );
            break;
        }
        default:
            break;
    }

    //
    ZoomInFromLevel0ToLevel1( true );
}


function onTouchMove( event ) 
{
    isMouseMoved = true;
    mouseX = event.touches[ 0 ].pageX;
    mouseY = event.touches[ 0 ].pageY;

    switch( appStateMan.GetCurrentState() )
    {
        case PX.AppStates.AppStateLevel1:
        {
            locationMarkers.OnMouseOverEvent( true );
            break;
        }
        default:
            break;
    }

	event.preventDefault();
	event.stopPropagation();
}


function OnMouseDown(event)
{
    isMouseDown = true;
    isMouseMoved = false;
    mouseX = event.clientX;
    mouseY = event.clientY;
    previousMouseX = mouseX;
    previousMouseY = mouseY;
}


function OnMouseUp(event)
{
    isMouseDown = false;
    if( isMouseMoved ) isMouseClick = false;
    else isMouseClick = true;
    //console.log( "isMouseClick: ", isMouseClick );
    mouseX = event.clientX;
    mouseY = event.clientY;
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    //
    ZoomInFromLevel0ToLevel1( true );
}


function OnMouseMove(event)
{
    isMouseMoved = true;
    mouseX = event.clientX;
    mouseY = event.clientY;

    //
    switch( appStateMan.GetCurrentState() )
    {
        case PX.AppStates.AppStateLevel0:
        {
            var markerIndex = locationMarkers.IntersectsLevel0( mouseVector3d );
            break;
        }
        case PX.AppStates.AppStateLevel1:
        {
            locationMarkers.OnMouseOverEvent( true );
            break;
        }
        default:
            break;
    }

	event.preventDefault();
	event.stopPropagation();
}

function OnMouseWheel( event )
{
    ZoomOutFromLevel1ToLevel0( true );
}


function OnMouseOut()
{
    isMouseDown = false;
    previousMouseX = 0.0;
    previousMouseY = 0.0;
    mouseX = 0.0;
    mouseY = 0.0;
}
