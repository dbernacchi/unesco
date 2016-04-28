

var preloaderBG = $(".preloaderBG");
var preloaderFG = $(".preloaderFG");


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

    this.materials = [];

    this.artSunLight = null;

    this.aspectRatio = 1.0;
};


PX.ModelRenderer.prototype =
{
    constructor: PX.ModelRenderer

    , Init: function( container, width, height )
    {
        this.container = container;
        this.width = width;
        this.height = height;

        //console.log( width, height );

        if( !this.renderer )
        {
            this.renderer = new THREE.WebGLRenderer( { antialias: true, precision: PX.ShaderPrecision, stencil: false, alpha: true } );
        }
        this.renderer.setClearColor( 0x000000, 0.0 );
        //renderer.gammaInput = true;
        //renderer.gammaOutput = true;
        element = this.renderer.domElement;
        
        container.appendChild( element );

        container.style.top = "0px";
        container.style.left = "0px";
        container.style.right = "0px";
        container.style.bottom = "0px";

        container.width = width;
        container.height = height;
        container.style.width = width;
        container.style.height = height;

        //console.log( "model renderer: ", window.devicePixelRatio, width, height );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );

        this.renderer.autoClear = false;
        this.renderer.autoClearStencil = false;
        this.renderer.sortObjects = false;

        // Artefact Scene
        //
        //if( !this.artefactScene )
        {
            this.artefactScene = new THREE.Scene();
        }

        // Create Artefact camera
        //
        this.aspectRatio = width / height;

        //if( !this.artefactCamera )
        {
            this.artefactCamera = new THREE.PerspectiveCamera( PX.kCameraFovY, this.aspectRatio, PX.kModelCameraNearPlane, PX.kModelCameraFarPlane );
        }
        this.artefactCamera.updateProjectionMatrix();
        this.artefactCamera.position = new THREE.Vector3( 0, 0, 50.0 );
        var currentCamLookAt0 = new THREE.Vector3( 0, 0, 0 );
        this.artefactCamera.lookAt( currentCamLookAt0 );
        this.artefactScene.add( this.artefactCamera );

        // Create Artefact sun light
        //
        this.artSunLight = new THREE.DirectionalLight( 0xffffff );
        this.artSunLight.position.set( 0.5, 1, 1 );
        //artSunLight.position.copy( this.artefactCamera.getWorldDirection() );
        this.artefactScene.add( this.artSunLight );
        var artAmbLight = new THREE.HemisphereLight( 0x7f7faa, 0x040410, 1 );
        this.artefactScene.add( artAmbLight );


        //this.SetupMaterial();

        // Init Trackball
        //
        /*this.trackball = new PX.CameraTrackball();
        this.trackball.Init( this.artefactCamera );
        this.trackball.rotateFactor = 0.5;
        this.trackball.damping = 0.1;
        this.trackball.lockUpVector = false;*/

        // Events
        //
        /*
        this.renderer.domElement.addEventListener('mousemove', OnMouseMove, false);
        this.renderer.domElement.addEventListener('mouseout', OnMouseOut, false);
        this.renderer.domElement.addEventListener('mousedown', OnMouseDown, false);
        this.renderer.domElement.addEventListener('mouseup', OnMouseUp, false);
        this.renderer.domElement.addEventListener('mousewheel', OnMouseWheel, false);*/

        //
        this.Reset();
    }


    , SetupMaterial: function()
    {
        var modelUniforms0 =
        {
            DiffuseMap: { type: "t", value: null }
            , NormalMap: { type: "t", value: null }
            , DiffuseColor: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            //, World: { type: "m4", value: new THREE.Matrix4() }
            , ViewPosition: { type: "v3", value: new THREE.Vector3( 0, 0, 100 ) }
            , LightDirection: { type: "v3", value: new THREE.Vector3( -1, -1, -1 ) }
            , Params0: { type: "v4", value: new THREE.Vector4( 0.001, 3.14, 0.1, 1 ) }
            //, Params1: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            , Params2: { type: "v4", value: new THREE.Vector4( 0.6, 2.0, 0.4, 1.0 ) }
        }
        var modelUniforms1 =
        {
            DiffuseMap: { type: "t", value: null }
            , DiffuseColor: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            //, World: { type: "m4", value: new THREE.Matrix4() }
            , ViewPosition: { type: "v3", value: new THREE.Vector3( 0, 0, 100 ) }
            , LightDirection: { type: "v3", value: new THREE.Vector3( -1, -1, -1 ) }
            , Params0: { type: "v4", value: new THREE.Vector4( 0.001, 3.14, 0.1, 1 ) }
            //, Params1: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            , Params2: { type: "v4", value: new THREE.Vector4( 0.6, 2.0, 0.4, 1.0 ) }
        }
        var modelUniforms2 =
        {
            DiffuseColor: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            //, World: { type: "m4", value: new THREE.Matrix4() }
            , ViewPosition: { type: "v3", value: new THREE.Vector3( 0, 0, 100 ) }
            , LightDirection: { type: "v3", value: new THREE.Vector3( -1, -1, -1 ) }
            , Params0: { type: "v4", value: new THREE.Vector4( 0.001, 3.14, 0.1, 1 ) }
            //, Params1: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
            , Params2: { type: "v4", value: new THREE.Vector4( 0.6, 2.0, 0.4, 1.0 ) }
        }


        // Diffuse + Normal
        var fragShader0 = "#define ENABLE_NORMAL_MAP";
        fragShader0 += "#define ENABLE_DIFFUSE_MAP";
        fragShader0 += PX.AssetsDatabase["ModelPixelShader"];
        var materialDiffuseAndNormals = new THREE.ShaderMaterial(
        {
            uniforms: modelUniforms0
            , vertexShader: PX.AssetsDatabase["ModelVertexShader"]
            , fragmentShader: fragShader0
            , vertexColors: THREE.VertexColors
        } );
        materialDiffuseAndNormals.extensions.derivatives = true;
        materialDiffuseAndNormals.side = THREE.DoubleSide;
        materialDiffuseAndNormals.depthTest = true;
        materialDiffuseAndNormals.depthWrite = true;
        materialDiffuseAndNormals.transparent = false;
        this.materials.push( materialDiffuseAndNormals );


        // Diffuse Only
        var fragShader1 = "#define ENABLE_DIFFUSE_MAP";
        fragShader1 += PX.AssetsDatabase["ModelPixelShader"];
        var materialDiffuseOnly = new THREE.ShaderMaterial(
        {
            uniforms: modelUniforms1
            , vertexShader: PX.AssetsDatabase["ModelVertexShader"]
            , fragmentShader: fragShader1
            , vertexColors: THREE.VertexColors
        } );
        materialDiffuseOnly.extensions.derivatives = true;
        materialDiffuseOnly.side = THREE.DoubleSide;
        materialDiffuseOnly.depthTest = true;
        materialDiffuseOnly.depthWrite = true;
        materialDiffuseOnly.transparent = false;
        this.materials.push( materialDiffuseOnly );


        // No Maps
        var fragShader2 = PX.AssetsDatabase["ModelPixelShader"];
        var materialNoMaps = new THREE.ShaderMaterial(
        {
            uniforms: modelUniforms2
            , vertexShader: PX.AssetsDatabase["ModelVertexShader"]
            , fragmentShader: fragShader2
            , vertexColors: THREE.VertexColors
        } );
        materialNoMaps.extensions.derivatives = true;
        materialNoMaps.side = THREE.DoubleSide;
        materialNoMaps.depthTest = true;
        materialNoMaps.depthWrite = true;
        materialNoMaps.transparent = false;
        this.materials.push( materialNoMaps );
    }


    , Load: function( path, filename, onProgressCB )
    {
        var scope = this;

		preloaderBG.css( "opacity", 1.0 );
        preloaderFG.css( "opacity", 1.0 );
        preloaderFG.css( "width", '0%' );
        preloaderBG.show();
        preloaderFG.show();

        //LoadSceneData( path, filename, this.artefactScene,
        LoadOBJScene( path, filename, this.artefactScene, this.materials,
        //LoadBINScene( path, filename, this.artefactScene,
        function( per )
        {
            //console.log( "+--+  Load: Percentage: ", per );
            if( onProgressCB ) onProgressCB( per );

            // Since we do a margin on the FG bar we need to compute the offset to remove from the bar in %
            // sub that from the total width % and we get the proper fitting size
            var offset = ( ( parseInt(preloaderFG.css('margin-left')) * 2.0 ) / windowWidth) * 100.0;
            var percentage = PX.Clamp( ( Math.ceil( (per+0.25) * 80.0 ) ), 0.0, 80.0 );
            //console.log( "Load()  percentage: ", percentage, "  offset: ", offset );
            preloaderFG.css( "width", (percentage - offset) + '%' );
        },
        function()
        {
		    preloaderBG.fadeTo(1000, 0);
            preloaderFG.fadeTo(1000, 0, function()
            {
                // hide progress
                preloaderBG.hide();
                preloaderFG.hide();

                //console.log( "Reset" );
                scope.Reset();

                //console.log( "compute Scene Bounds" );
                var res = ComputeSceneBoundingSphere( scope.artefactScene );
                scope.sceneCenter.x = res.x;
                scope.sceneCenter.y = res.y;
                scope.sceneCenter.z = res.z;
                scope.distToCamera = res.w;
                console.log( scope.sceneCenter, scope.distToCamera );

                //console.log( "Set camera" );
                scope.artefactCamera.position.x = scope.sceneCenter.x;
                scope.artefactCamera.position.y = scope.sceneCenter.y;
                scope.artefactCamera.position.z = scope.sceneCenter.z + scope.distToCamera;
                scope.artefactCamera.lookAt( scope.sceneCenter.clone() );
                console.log( "scope.artefactCamera.position: ", scope.artefactCamera.position );
                console.log( "scope.artefactCamera.direction: ", scope.artefactCamera.getWorldDirection() );

                //
                //console.log( "set orbit controls" );
                if( scope.artefactOrbitControls )
                {
                    scope.artefactOrbitControls.minDistance = scope.distToCamera * 0.3;
                    scope.artefactOrbitControls.maxDistance = scope.distToCamera * 2.0;
                    scope.artefactOrbitControls.target.copy( scope.sceneCenter );
                    scope.artefactOrbitControls.update();
                    //console.log( "(2) scope.artefactCamera.position: ", scope.artefactCamera.position );
                    //console.log( "(2) scope.artefactCamera.direction: ", scope.artefactCamera.getWorldDirection() );
                }

                if( this.trackball ) this.trackball.Reset( scope.artefactCamera, scope.sceneCenter );

                // Need to call this after Reset
                console.log( "+--+  ModelRenderer enabled" );
                scope.enabled = true;
            });
        } );
    }


    , Update: function( time, frameTime )
    {
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
/*
        var scope = this;
        this.artefactScene.traverse( function( object )
        {
            if( object instanceof THREE.Mesh )
            {
                object.material.uniforms.Params0.value.set( Params.ModelAmbientIntensity, Params.ModelDiffuseIntensity, Params.ModelSpecularIntensity, 1.0 );
                object.material.uniforms.Params2.value.x = Params.ModelRoughness;
                object.material.uniforms.ViewPosition.value = scope.artefactCamera.position;
            }
        });*/

        // Update shader material
//        console.log( this.artefactCamera.position );
/*        for( var i=0; i<3; i++ )
        {
            this.materials[i].uniforms.Params0.value.set( Params.ModelAmbientIntensity, Params.ModelDiffuseIntensity, Params.ModelSpecularIntensity, 1.0 );
            this.materials[i].uniforms.Params2.value.x = Params.ModelRoughness;
            this.materials[i].uniforms.ViewPosition.value = this.artefactCamera.position;
            //this.materials[i].uniforms.LightDirection.value = this.artSunLight.position;
        }*/
    }


    , Render: function()
    {
        this.renderer.clear();

        this.renderer.setViewport( 0, 0, this.width, this.height );
        this.renderer.render( this.artefactScene, this.artefactCamera );
    }


    , OnFrame: function( time, frameTime )
    {
        if( ! this.enabled )
            return;

        this.Update( time, frameTime );
        this.Render();
    }


    , OnResize: function( w, h )
    {
        if( this.enabled )
        {
            this.width = w;
            this.height = h;

            this.artefactCamera.aspect = this.width / this.height;
            this.artefactCamera.updateProjectionMatrix();
            this.renderer.setSize( this.width, this.height );
        }
    }


    , Reset: function()
    {
        this.enabled = false;

        if( !this.artefactOrbitControls )
        {
	        this.artefactOrbitControls = new THREE.OrbitControls( this.artefactCamera, this.renderer.domElement );
        }
        this.artefactOrbitControls.enableDamping = true;
        this.artefactOrbitControls.dampingFactor = 0.05;
        this.artefactOrbitControls.rotateSpeed = 0.05;
        this.artefactOrbitControls.minDistance = 1.0;
        this.artefactOrbitControls.maxDistance = 500.0;
        this.artefactOrbitControls.target.set( 0, 0, 0 );
        this.artefactOrbitControls.update();

        this.renderer.clear();
    }


    , Clear: function()
    {
        preloaderBG.hide();
        preloaderFG.hide();

        console.log( "+--+  Scene children count: ", this.artefactScene.children.length );

        //
        var scope = this.artefactScene;
        this.artefactScene.traverse( function( obj )
        {
            console.log( obj );

            if( obj instanceof THREE.Mesh )
            {
                console.log( "+--+  Removed 3d model" );
                scope.remove( obj );
                if( obj.material.map )
                {
                    obj.material.map.dispose();
                    obj.material.map = null;
                }
                if( obj.material.normalMap )
                {
                    obj.material.normalMap.dispose();
                    obj.material.normalMap = null;
                }
                obj.material.dispose();
                obj.material = null;
                obj.geometry.dispose();
                obj.geometry = null;
                obj = null;
            }
            if( obj instanceof THREE.Group )
            {
                console.log( "+--+  Removed 3d group " );
                scope.remove( obj );
                if( obj.children.length > 0 )
                {
                    for( var i=obj.children.length-1; i>=0; i-- )
                    {
                        var obj2 = obj.children[ i ];
                        console.log( obj2 );
                        if( obj2 instanceof THREE.Mesh ) 
                        {
                            console.log( "+--+  Removed 3d model from Group" );
                            obj.remove( obj2 );
                            if( obj2.material.map )
                            {
                                obj2.material.map.dispose();
                                obj2.material.map = null;
                            }
                            if( obj2.material.normalMap )
                            {
                                obj2.material.normalMap.dispose();
                                obj2.material.normalMap = null;
                            }
                            obj2.material.dispose();
                            obj2.material = null;
                            obj2.geometry.dispose();
                            obj2.geometry = null;
                        }
                        obj2 = null;
                    }
                }
                obj = null;
            }
            if( obj instanceof THREE.Scene )
            {
                console.log( "+--+  Removed 3d scene " );
                scope.remove( obj );
                if( obj.children.length > 0 )
                {
                    for( var i=obj.children.length-1; i>=0; i-- )
                    {
                        var obj2 = obj.children[ i ];
                        console.log( obj2 );
                        if( obj2 instanceof THREE.Mesh ) 
                        {
                            console.log( "+--+  Removed 3d model from Scene" );
                            obj.remove( obj2 );
                            if( obj2.material.map )
                            {
                                obj2.material.map.dispose();
                                obj2.material.map = null;
                            }
                            if( obj2.material.normalMap )
                            {
                                obj2.material.normalMap.dispose();
                                obj2.material.normalMap = null;
                            }
                            obj2.material.dispose();
                            obj2.material = null;
                            obj2.geometry.dispose();
                            obj2.geometry = null;
                        }
                        obj2 = null;
                    }
                }
                obj = null;
            }
        });

        console.log( "+--+  Scene children count: ", this.artefactScene.children.length );

        /*if( this.artefactScene.children.length > 0 )
        {
            for( var i=this.artefactScene.children.length-1; i>=0; i-- )
            {
                var obj = this.artefactScene.children[ i ];
                console.log( obj );
                if( obj instanceof THREE.Mesh ) 
                {
                    console.log( "+--+  Removed 3d model" );
                    this.artefactScene.remove( obj );
                    if( obj.material.map ) obj.material.map.dispose();
                    if( obj.material.normalMap ) obj.material.normalMap.dispose();
                    obj.material.dispose();
                    obj.geometry.dispose();
                    //obj.dispose();
                    obj = null;
                }
            }
        }*/

        //
        console.log( "+--+  Do a final render to run GC" );
        this.Render();  // Render once to clear the Scene
        this.renderer.clear();


        // Release trackball controller
        if( this.artefactOrbitControls )
        {
            this.artefactOrbitControls.dispose();
            this.artefactOrbitControls = null;
        }

        //
        console.log( "+--+  Model Renderer disabled" );
        this.enabled = false;
    }
}

