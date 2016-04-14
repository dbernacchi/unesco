


/////////////////////////////////////////////////////////////////////////////////////
// Representation of a location in memory (read from json)

PX.ModelRenderer = function()
{ 
    this.renderer = null;
    this.container = null;

    this.width = 100.0;
    this.height = 100.0;

    this.artefactScene = null;
    this.artefactCamera = null;
    this.artefactOrbitControls = null;

    this.enabled = false;

    this.sceneCenter = new THREE.Vector3();
    this.distToCamera = 100.0;

    this.trackball = null;

    this.aspectRatio = 1.0;
};


PX.ModelRenderer.prototype =
{
    constructor: PX.ModelRenderer

    , Init( container, width, height )
    {
        this.container = container;
        this.width = width;
        this.height = height;

        console.log( width, height );

        this.renderer = new THREE.WebGLRenderer( { antialias: true, precision: PX.ShaderPrecision, stencil: false, alpha: true } );
        this.renderer.setClearColor( 0x000000, 0.0 );
        //renderer.gammaInput = true;
        //renderer.gammaOutput = true;
        element = this.renderer.domElement;
        container.appendChild( element );

        this.renderer.autoClear = false;
        this.renderer.autoClearStencil = false;

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );


        // Artefact Scene
        //
        this.artefactScene = new THREE.Scene();

        // Create Artefact camera
        //
        this.aspectRatio = width / height;

        this.artefactCamera = new THREE.PerspectiveCamera( PX.kCameraFovY, this.aspectRatio, PX.kCameraNearPlane, PX.kCameraFarPlane );
        this.artefactCamera.updateProjectionMatrix();
        this.artefactCamera.position = new THREE.Vector3( 0, 0, Params.Art_CameraDistance );
        var currentCamLookAt0 = new THREE.Vector3( 0, 0, 0 );
        this.artefactCamera.lookAt( currentCamLookAt0 );
        this.artefactScene.add( this.artefactCamera );

        // Create Artefact sun light
        //
        var artSunLight = new THREE.DirectionalLight( 0xffffff );
        artSunLight.position.set( 1, 1, 1 );
        this.artefactScene.add( artSunLight );
        var artAmbLight = new THREE.HemisphereLight( 0x7f7faa, 0x040410, 1 );
        this.artefactScene.add( artAmbLight );


        // Init Trackball
        //
        /*this.trackball = new PX.CameraTrackball();
        this.trackball.Init( this.artefactCamera );
        this.trackball.rotateFactor = 0.5;
        this.trackball.damping = 0.1;
        this.trackball.lockUpVector = false;*/


        // Events
        //
        /*this.renderer.domElement.addEventListener('resize', OnResize, false);
        this.renderer.domElement.addEventListener('mousemove', OnMouseMove, false);
        this.renderer.domElement.addEventListener('mouseout', OnMouseOut, false);
        this.renderer.domElement.addEventListener('mousedown', OnMouseDown, false);
        this.renderer.domElement.addEventListener('mouseup', OnMouseUp, false);
        this.renderer.domElement.addEventListener('mousewheel', OnMouseWheel, false);*/



        //
        this.Reset();
    }


    , Load( url, onProgressCB )
    {
        var scope = this;

        progressBarElement.text( "" );

        LoadBINScene( url, this.artefactScene, 
        function( per )
        {
            //console.log( "+--+  Load: Percentage: ", per );
            onProgressCB( per );
        },
        function()
        {
            console.log( "Reset" );
            scope.Reset();

            console.log( "compute Scene Bounds" );
            var res = ComputeSceneBoundingSphere( scope.artefactScene );
            scope.sceneCenter.x = res.x;
            scope.sceneCenter.y = res.y;
            scope.sceneCenter.z = res.z;
            scope.distToCamera = res.w;
            console.log( scope.sceneCenter, scope.distToCamera );

            console.log( "Set camera" );
            scope.artefactCamera.position.x = scope.sceneCenter.x;
            scope.artefactCamera.position.y = scope.sceneCenter.y;
            scope.artefactCamera.position.z = scope.distToCamera;
            console.log( "scope.artefactCamera.position: ", scope.artefactCamera.position );

            //
            console.log( "set orbit controls" );
            if( scope.artefactOrbitControls )
            {
                scope.artefactOrbitControls.minDistance = scope.distToCamera * 0.2;
                scope.artefactOrbitControls.maxDistance = scope.distToCamera * 2.0;
                scope.artefactOrbitControls.target.copy( scope.sceneCenter );
                scope.artefactOrbitControls.update();
            }

            if( this.trackball ) this.trackball.Reset( scope.artefactCamera, scope.sceneCenter );

            // Need to call this after Reset
            console.log( "enable it" );
            scope.enabled = true;
        }
        );
    }

    , Update( time, frameTime )
    {
        if( ! this.enabled )
            return;

        //
        mouseDeltaX = mouseX - previousMouseX;
        mouseDeltaY = mouseY - previousMouseY;
        previousMouseX = mouseX;
        previousMouseY = mouseY;

        if( isMouseDown && this.trackball )
        {
            var rotSpeed = 3.0; //PX.Saturate( Params.CameraDistance / PX.kCameraMaxDistance );
            this.trackball.rotateFactor = rotSpeed * 0.5;

            this.trackball.HandleMouseEvents( 1, 1, mouseDeltaX, mouseDeltaY, frameTime, this.aspectRatio );
            //console.log( trackball.rotateVel );
            //console.log( camera.position );
        }

        //
        if( this.trackball ) this.trackball.Update( this.artefactCamera, frameTime );


        if( this.artefactOrbitControls ) this.artefactOrbitControls.update();
    }


    , Render()
    {
        if( ! this.enabled )
            return;

        this.renderer.clear();

        this.renderer.setViewport( 0, 0, this.width, this.height );
        this.renderer.render( this.artefactScene, this.artefactCamera );
    }


    , Reset()
    {
        this.enabled = false;

	    this.artefactOrbitControls = new THREE.OrbitControls( this.artefactCamera, this.renderer.domElement );
        this.artefactOrbitControls.enableDamping = true;
        this.artefactOrbitControls.dampingFactor = 0.05;
        this.artefactOrbitControls.rotateSpeed = 0.05;
        this.artefactOrbitControls.minDistance = 1.0;
        this.artefactOrbitControls.maxDistance = 500.0;
        this.artefactOrbitControls.target.set( 0, 0, 0 );
        this.artefactOrbitControls.update();

        this.renderer.clear();
    }


    , Clear()
    {
        if( this.artefactOrbitControls )
        {
            this.artefactOrbitControls.dispose();
        }
        this.artefactOrbitControls = null;

        //
        if( this.artefactScene.children.length > 0 )
        {
            for( var i=this.artefactScene.children.length-1; i>=0; i-- )
            {
                obj = this.artefactScene.children[ i ];
                if( obj instanceof THREE.Mesh )
                {
                    console.log( "+--+  Removed obj" );
                    this.artefactScene.remove( obj );
                    obj = null;
                }
            }
        }

        this.enabled = false;

        //
        this.renderer.clear();
    }
}

