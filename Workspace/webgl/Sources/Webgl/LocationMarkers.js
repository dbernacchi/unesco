
/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarker = function()
{ 
    this.GUID           = "";
    this.text           = "";
    this.index          = -1;
    this.latlon         = new THREE.Vector2();
    this.position       = new THREE.Vector3();
    this.positionSS     = new THREE.Vector3();
    this.scale          = new THREE.Vector3();
    this.markerCount    = 0;
    this.type           = 0;
    this.color          = null;
};
UG.LocationMarker.prototype =
{
    constructor: UG.LocationMarker
};



/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarkers = function()
{ 
	this.locationsGroup         = null;
	this.meshes                 = [];
	this.markers                = [];
	this.level0Scales           = [];
    //this.textRenderer         = null;
    this.textRenderer2          = null;
	this.markersCount           = 0;

	this.markerCluster          = null;
    this.doPopulation           = true;
    this.doAvoidance            = false;

    this.zoomLevel              = 0;
    this.avoidanceCount         = 0;

    this.zoomLevel1IntroAnimDone = false;

    this.billboardMaterial      = null;
    this.billboardGeometry      = null;
    this.geomPositionArray      = null;
    this.geomColorArray         = null;
    this.billboards             = null;
    this.billboardsGroup        = null;

    this.markerScene            = null;
    this.camera2d               = null;

    this.clickedMarkerIndex     = -1;
    this.level2GlobalScale      = new THREE.Vector3( 1.0, 1.0, 1.0 );
};

UG.LocationMarkers.prototype =
{
    constructor: UG.LocationMarkers

    , Init: function( locations, markerCluster, bmFontDescriptor, scene )
    {
    	this.markerCluster = markerCluster;

        this.markerScene = new THREE.Scene();

        //
        this.locationsGroup = new THREE.Object3D();
	    this.locationsGroup.position.set( 0, 0, 0 );

        //
	    for( var i=0; i<locations.length; ++i )
	    {
	        // Get color
            var rndIdx = Math.round( Math.random() * 3 ) % 3;
            var color = new THREE.Color( PX.kLocationColors[rndIdx] );

	        //var material = new THREE.MeshLambertMaterial( { color: color, emissive: 0x003333 } );
	        var material = new THREE.MeshBasicMaterial( { color: color } );
	        material.depthWrite = false;
	        var geom = new THREE.CylinderGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerDetail, 1 );
	        //var geom = new THREE.CylinderGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerScale*0.33, 16, 1 );

	        var matTrans = new THREE.Matrix4().makeTranslation( 0, 0, -PX.kLocationMarkerScale*0.5 );
	        var matRot = new THREE.Matrix4().makeRotationX( THREE.Math.degToRad( 90.0 ) )
	        var objMat = new THREE.Matrix4().multiplyMatrices( matTrans, matRot );

	        geom.applyMatrix( objMat );
	        var mesh = new THREE.Mesh( geom, material );

	        mesh.position.copy( locations[i].position );
	        mesh.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON);
	        mesh.lookAt( new THREE.Vector3(0, 0, 0) );

	        mesh.name = locations[i].name;

	        //
	        this.meshes.push( mesh );

	        var lm = new UG.LocationMarker();
	        lm.text = "";
	        lm.position.copy( locations[i].position );
            lm.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
            //lm.clicks = 0;
            lm.color = color;
            lm.index = i;
            lm.type = rndIdx;
	        this.markers.push( lm );

            this.level0Scales.push( new THREE.Vector3( PX.EPSILON, PX.EPSILON, PX.EPSILON ) );

	        this.locationsGroup.add( mesh );
	    }

        //
        //this.textRenderer = new PX.TextRenderer();
        //this.textRenderer.Init( bmFontDescriptor, 2048, 0x000000, PX.AssetsDatabase["TextAtlasTex"], scene );
        //this.locationsGroup.add( this.textRenderer.mesh );

        //
        this.locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );

	    scene.add( this.locationsGroup );


        this.billboardMaterial = new THREE.PointsMaterial( { size: Params.Level0MarkerRadius, sizeAttenuation: false, color: 0xffffff, opacity: 0.8, map: PX.AssetsDatabase[ "Circle" ], transparent: true } );
        this.billboardMaterial.vertexColors = THREE.VertexColors;
        //this.billboardMaterial.depthTest = false;
        //this.billboardMaterial.depthWrite = false;
        this.billboardGeometry = new THREE.BufferGeometry();

		var positions = new Float32Array( locations.length * 3 );
		var colors = new Float32Array( locations.length * 3 );

        var commonColor = new THREE.Color( PX.kLocationColor );

        var vertex = new THREE.Vector3();
        for( var i=0; i<locations.length; ++i )
        {
		    vertex.copy( locations[i].position );

            positions[ i*3+0] = vertex.x;
            positions[ i*3+1] = vertex.y;
            positions[ i*3+2] = vertex.z;
            colors[ i*3+0] = commonColor.r;
            colors[ i*3+1] = commonColor.g;
            colors[ i*3+2] = commonColor.b;
		    //this.billboardGeometry.vertices.push( vertex );
		    //this.billboardGeometry.colors.push( new THREE.Color( 0x000055 ) );
	    }
		this.billboardGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		//this.billboardGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		this.billboardGeometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

        this.billboardGeometry.dynamic = true;
        this.geomPositionArray = this.billboardGeometry.attributes.position.array;
        this.geomColorArray = this.billboardGeometry.attributes.color.array;

	    this.billboards = new THREE.Points( this.billboardGeometry, this.billboardMaterial );
        this.billboards.frustumCulled = false;

        this.billboardsGroup = new THREE.Object3D();
        this.billboardsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );

        //this.billboardsGroup.add( this.billboards );
        this.markerScene.add( this.billboards );

        this.textRenderer2 = new PX.TextRenderer();
        this.textRenderer2.Init( bmFontDescriptor, 2048, 0xffffff, PX.AssetsDatabase["TextAtlasTex"], this.markerScene );
        this.textRenderer2.material.depthWrite = false;
        //this.textRenderer2.material.depthTest = false;

        //this.billboardsGroup.add( this.textRenderer2.mesh );
        //this.markerScene.add( this.billboardsGroup );
        this.markerScene.add( this.textRenderer2.mesh );

        this.camera2d = new THREE.OrthographicCamera( 0, Params.WindowWidth, Params.WindowHeight, 0, -100, 100 );
        this.markerScene.add( this.camera2d );


        // Init
        this.locationsGroup.visible = false;

    }

    , TweenLevel0: function( targetValue, time, delay, onStartCB, onCompleteCB )
    {
        var target = { x : targetValue, y: targetValue, z: targetValue };
        var tween = new TWEEN.Tween( this.billboardsGroup.scale ).to( target, time );
        tween.easing( TWEEN.Easing.Quintic.InOut );
        tween.delay( (delay === undefined ) ? 0 : delay );
        tween.start();
        tween.onStart( function()
        {
            if( onStartCB ) onStartCB();
        });
        tween.onComplete( function()
        {
            if( onCompleteCB ) onCompleteCB();
        });
    }

    , TweenLevel1: function( targetValue, time, delay, onStartCB, onCompleteCB )
    {
        //this.locationsGroup.scale.set( 1, 1, 1 );
        var target = new THREE.Vector3( targetValue, targetValue, targetValue );
        var tween = new TWEEN.Tween( this.locationsGroup.scale ).to( target, time );
        tween.easing( TWEEN.Easing.Quintic.InOut );
        tween.delay( (delay === undefined ) ? 0 : delay );
        tween.start();
        tween.onStart( function()
        {
            if( onStartCB ) onStartCB();
        });
        tween.onComplete( function()
        {
            if( onCompleteCB ) onCompleteCB();
        });
    }


    , Render: function( )
	{

	}


    , Update: function( time, frameTime, camera )
    {
        if( this.doPopulation )
            return;

        //console.log( this.avoidanceCount );

        switch( appStateMan.GetCurrentState() )
        {
            case PX.AppStates.AppStateIntro:
            {
                //this.UpdateLocationCircleBillboards( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateIntroToLevel0:
            {
                this.UpdateLocationCircleBillboards( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel0:
            {
                for( var i=0; i<this.markersCount; ++i )
                {
		            this.geomPositionArray[i*3+0] = 10000;
		            this.geomPositionArray[i*3+1] = 0;
		            this.geomPositionArray[i*3+2] = 0;
                }

                this.UpdateLocationCircleBillboards( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel0ToLevel1:
            {
                this.UpdateLocationCircleBillboards( time, frameTime, camera );
                this.UpdateLocationMeshes( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel1:
            {
                for( var i=0; i<this.meshes.length; ++i )
                {
                    // Default all locations to far far away
                    this.meshes[i].position.set( 10000, 0, 0 );
	   	        }

                this.UpdateLocationMeshes( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel1ToLevel2:
            {
                this.UpdateLocationMeshes( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel2:
            {
                this.UpdateLocationMeshes( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel2ToLevel1:
            {
                this.UpdateLocationMeshes( time, frameTime, camera );
                break;
            }

            default:
                break;
        }
    }


    , UpdateLocationCircleBillboards: function( time, frameTime, camera )
    {
        if( this.doPopulation )
            return;

        this.textRenderer2.Begin();

        var distToCamera = new THREE.Vector3();

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Text Info
            //
            //var ttt = (1.0) * PX.kLocationMarkerZScale;
            //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

            var v0 = camera.position.clone().sub( loc.position ).normalize();
            var v1 = loc.position.clone().normalize();
            var dot = v0.dot( v1 );

            // Update billboard's size
            this.billboards.material.size = this.billboardsGroup.scale.x * Params.Level0MarkerRadius;

            // BILLBOARDS
            if( dot >= 0.0 )
            {
                loc.positionSS.copy( loc.position );
                loc.positionSS.project( camera );

                // 2d ortho
                loc.positionSS.x = ( (loc.positionSS.x + 1.0 ) * 0.5 ) * Params.WindowWidth;
                loc.positionSS.y = ( (loc.positionSS.y + 1.0 ) * 0.5 ) * Params.WindowHeight;
                loc.positionSS.z = 0.0;

		        this.geomPositionArray[i*3+0] = loc.positionSS.x;
		        this.geomPositionArray[i*3+1] = loc.positionSS.y;
		        this.geomPositionArray[i*3+2] = 0;

                this.textRenderer2.AppendText2D( loc.text, loc.positionSS, 8.5, this.billboardsGroup.scale.x, true );
            }
            else
            {
                // Move far far away from view. not visible
		        this.geomPositionArray[i*3+0] = 10000;
		        this.geomPositionArray[i*3+1] = 0;
		        this.geomPositionArray[i*3+2] = 0;
            }
	    }

        //
        this.billboardGeometry.attributes.position.needsUpdate = true;
        this.billboardGeometry.attributes.color.needsUpdate = true;

        // Text End
        this.textRenderer2.End();
    }


    , UpdateLocationMeshes: function( time, frameTime, camera )
    {
        if( this.doPopulation )
            return;

        //this.textRenderer.Begin();


        // Place only visible clusters/markers
        //
        var matTrans = new THREE.Matrix4();
        var matRot = new THREE.Matrix4();
        var matScale = new THREE.Matrix4();
        var matRes = new THREE.Matrix4();
        var distToCamera = new THREE.Vector3();

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Use distance to camera for constant size
            if( this.zoomLevel1IntroAnimDone ) 
            {
                distToCamera.subVectors( camera.position, loc.position );
                var locationScale = distToCamera.length();
                locationScale = ( locationScale * PX.kCameraOneOverMaxDistance ); /// PX.kCameraMaxDistance );
                // apply a global scale (used in level 2 to scale all non selected markers)
                if( i !== this.clickedMarkerIndex ) locationScale *= this.level2GlobalScale.x;
                loc.scale.set( locationScale, locationScale, locationScale );

                // If there's a clicked marker, do pulse effect on it
                // this is used in Level2 when a location has been selected
                if( i === this.clickedMarkerIndex )
                {
                    var per = i / (this.markersCount-1);
                    var pulse = PX.CubicPulse( 0.0, 0.5, Math.sin(time*2.0+i) );
                    //var pulse = PX.Saturate( PX.Utils.Pulse( (2.0*Math.PI*per) + time, 0.5 ) );
                    loc.scale.x += pulse * 0.2;
                    loc.scale.y += pulse * 0.2;
                    loc.scale.z += pulse * 0.2;
                }
            }

            this.meshes[i].position.copy( loc.position );
            this.meshes[i].scale.set( loc.scale.x, loc.scale.y, loc.scale.z * PX.kLocationMarkerZScale );
            //this.meshes[i].scale.set( loc.scale.x, loc.scale.y, loc.scale.z * ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 ) );
            this.meshes[i].lookAt( PX.ZeroVector );


            // Text Info
            //
            var ttt = (1.0) * PX.kLocationMarkerZScale;
            //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

            var smallOffset = 0.001;
            var p = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (ttt * loc.scale.z * PX.kLocationMarkerScale) );

            matTrans = matTrans.makeTranslation( p.x, p.y, p.z );
            matRot.makeRotationFromQuaternion( this.meshes[i].quaternion );
            //matRot.makeRotationFromEuler( this.meshes[i].rotation );
            matScale.makeScale( loc.scale.x, loc.scale.y, loc.scale.z );
            matRes.multiplyMatrices( matTrans, matRot );
            matRes.multiplyMatrices( matRes, matScale );
            //matRes = locationMeshes[i].matrixWorld;

            //this.textRenderer.AppendText( loc.text, PX.ZeroVector, PX.kLocationTextSize, matRes, true );
	    }

        // Text End
        //this.textRenderer.End();
    }


    , IntersectsLevel1: function( raycaster )
    {
        if( this.doPopulation )
            return;

        for( var i=0; i<this.markersCount; ++i )
        {
            this.meshes[ i ].material.color.copy( this.markers[ i ].color );
        }

        // Intersection test per mesh
        for( var i=0; i<this.markersCount; ++i )
        {
            var intersects = raycaster.intersectObject( this.meshes[ i ], false );
            if( intersects.length > 0 )
            {
                //console.log( intersects );
                intersects[ 0 ].object.material.color.set( PX.kLocationMouseOverColor );
                return i;
            }
        }

        return -1;
    }


    , IntersectsLevel0: function( mouse )
    {
        if( this.doPopulation )
            return;

        var c0 = new THREE.Color( PX.kLocationColor );
        var c1 = new THREE.Color( PX.kLocationMouseOverColor );

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[ i ];

		    this.geomColorArray[ i*3+0 ] = c0.r;
            this.geomColorArray[ i*3+1 ] = c0.g;
            this.geomColorArray[ i*3+2 ] = c0.b;
        }

        // Intersection test per mesh
        var hr = Params.Level0MarkerRadius * 0.5;
        var vert = new THREE.Vector3();
        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[ i ];

		    vert.set( this.geomPositionArray[ i*3+0 ], 
                      this.geomPositionArray[ i*3+1 ], 
                      this.geomPositionArray[ i*3+2 ] );
            //console.log( vert );
            var len = vert.sub( mouse ).lengthSq();
            if( len < (hr * hr) )
            {
                //console.log( "level0 intersect: ", i );
		        this.geomColorArray[ i*3+0 ] = c1.r;
                this.geomColorArray[ i*3+1 ] = c1.g;
                this.geomColorArray[ i*3+2 ] = c1.b;
                return loc.index;
            }
        }

        return -1;
    }

    , OnMouseClickEvent: function( mouse3d, camera, onLocationClickCB )
    {
        var scope = this;

        // Level 0
        if( appStateMan.GetCurrentState() === PX.AppStates.AppStateLevel0 )
        {
            var index = this.IntersectsLevel0( mouse3d );
            if( index < 0 )
            {
                //console.log( "no intersection", index );
                return;
            }

            //console.log( "moooo" );
            //trackball.Reset( camera );


            // Change app state
            appStateMan.ChangeState( PX.AppStates.AppStateLevel0ToLevel1 );

            scope.doAvoidance = true;

            this.TweenLevel0( PX.EPSILON, Params.AnimTime * 0.2 * 1000.0, Params.AnimTime * 0.8 * 1000.0, 
            null, 
            function()
            {
                trackball.Reset( camera );

                //scope.doAvoidance = false;
            });


            var loc = this.markers[ index ];

            Params.CameraDistance = PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, 0.0 );

            //var cameraSourcePoint = camera.position.clone();
            var cameraTargetPoint = loc.position.clone().normalize().multiplyScalar( Params.CameraDistance );

            // POSITION
            var tween = new TWEEN.Tween( camera.position ).to( cameraTargetPoint, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            tween.onStart(function()
            {
            });
            /*tween.onUpdate(function()
            {
                camera.position.x = cameraSourcePoint.x;
                camera.position.y = cameraSourcePoint.y;
                camera.position.z = cameraSourcePoint.z;
            });*/
            tween.onComplete(function()
            {
                scope.SetZoomLevel( 1 );
                scope.doPopulation = true;
                scope.doAvoidance = true;

                scope.TweenLevel1( 1.0, Params.AnimTime * 1000.0, 0 * 1000.0, null, function()
                {
                    // Change app state
                    appStateMan.ChangeState( PX.AppStates.AppStateLevel1 );

                    trackball.Reset( camera );
                });
            });

            // LOOKAT
            var cameraLookAtTargetPoint = PX.ZeroVector.clone();
            tween = new TWEEN.Tween( cameraLookAtPoint ).to( cameraLookAtTargetPoint, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            tween.onUpdate(function()
            {
                camera.lookAt( cameraLookAtPoint );
            });
        }

        // Level 1
        else if( appStateMan.GetCurrentState() === PX.AppStates.AppStateLevel1 )
        {
            var index = this.IntersectsLevel1( g_Raycaster );
            if( index < 0 )
            {
                //console.log( "no intersection", index );
                return;
            }

            // Callback returning clicked marker object
            if( onLocationClickCB ) onLocationClickCB( this.markers[ index ] );

            // Save clicked marker index
            this.clickedMarkerIndex = index;

            trackball.Reset( camera );

            //
            /*if( earthOrbitControls ) 
            {
                earthOrbitControls.enabled = false;
                //earthOrbitControls.update();
            }*/

            // Change State
            appStateMan.ChangeState( PX.AppStates.AppStateLevel1ToLevel2 );


            // Compute right vector
            var dir0 = this.meshes[ index ].position.clone().normalize();
            var right = new THREE.Vector3();
            right.crossVectors( PX.YAxis, dir0 );
            right.normalize();
            right.multiplyScalar( PX.kEarthScale * 1.1 );


            // CAMERA POSITION
            var target = this.meshes[ index ].position.clone().normalize().multiplyScalar( Params.CameraDistance );
            var target2 = target.clone().add( right );
            var tween2 = new TWEEN.Tween( camera.position ).to( target2, Params.AnimTime * 1000.0 );
            tween2.easing( TWEEN.Easing.Quadratic.InOut );
            tween2.start();
            //tween.chain( tween2 );

            // CAMERA LOOKAT
            var cameraTargetPoint2 = cameraLookAtPoint.clone().add( right );
            var target2 = { x : cameraTargetPoint2.x, y: cameraTargetPoint2.y, z: cameraTargetPoint2.z };
            tween = new TWEEN.Tween( cameraLookAtPoint ).to( target2, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            //tween.delay( Params.AnimTime * 1000.0 );    // Delay until part 2 of the above tween
            tween.start();
            tween.onUpdate(function()
            {
                camera.lookAt( cameraLookAtPoint );
                /*if( earthOrbitControls )
                {
                    earthOrbitControls.target.copy( cameraLookAtPoint );
                    earthOrbitControls.enabled = false;
                    earthOrbitControls.update();
                }*/
            });

            // ROTATE EARTH
            var v0 = camera.getWorldDirection().clone().normalize();
            var v1 = right.clone().normalize();
            v1 = v1.crossVectors( v1, v0 ).normalize();

            var start = earth.mesh.quaternion.clone();
            var end = new THREE.Quaternion().setFromAxisAngle( v1, PX.ToRadians(50) );

            var positionw = { x: 0.0 };
            var targetw = { x: 1.0 };
            var tweenw = new TWEEN.Tween( positionw ).to( targetw, Params.AnimTime * 1000.0 );
            tweenw.easing( TWEEN.Easing.Quadratic.InOut );
            //tweenw.delay( Params.AnimTime * 1000.0 );    // Delay until part 2 of the above tween
            tweenw.start();
            tweenw.onUpdate(function()
            {
                THREE.Quaternion.slerp( start, end, earth.mesh.quaternion, positionw.x );
                THREE.Quaternion.slerp( start, end, scope.locationsGroup.quaternion, positionw.x );
            });
            tweenw.onComplete( function()
            {
                appStateMan.ChangeState( PX.AppStates.AppStateLevel2 );

                trackball.Reset( camera );

            });

            // Marker Global Scale
            var gsTarget = new THREE.Vector3( 0.2, 0.2, 0.2 );
            var tweengs = new TWEEN.Tween( this.level2GlobalScale ).to( gsTarget, Params.AnimTime * 1000.0 );
            tweengs.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs.start();
        }

        // Level 2
        else if( appStateMan.GetCurrentState() === PX.AppStates.AppStateLevel2 )
        {
            // If clicking on the globe, go back to Level 1
            var intersects = g_Raycaster.intersectObject( earth.mesh, false );
            if( ! intersects.length )
            {
                return;
            }

            var index = this.clickedMarkerIndex;

            // Change State
            appStateMan.ChangeState( PX.AppStates.AppStateLevel2ToLevel1 );

            // Marker Global Scale
            var gsTarget = new THREE.Vector3( 1, 1, 1 );
            var tweengs = new TWEEN.Tween( this.level2GlobalScale ).to( gsTarget, Params.AnimTime * 1000.0 );
            tweengs.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs.start();

            // CAMERA POSITION
            var target = this.meshes[ index ].position.clone().normalize().multiplyScalar( Params.CameraDistance );
            var tween = new TWEEN.Tween( camera.position ).to( target, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            /*tween.onComplete(function()
            {
                if( earthOrbitControls ) 
                {
                    earthOrbitControls.state = -1;
                    earthOrbitControls.enabled = true;
		            earthOrbitControls.dispatchEvent( changeEvent );
                    earthOrbitControls.update();
                }
            });*/

            // CAMERA LOOKAT
            var target2 = { x : 0, y: 0, z: 0 };
            tween = new TWEEN.Tween( cameraLookAtPoint ).to( target2, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            //tween.delay( Params.AnimTime * 1000.0 );    // Delay until part 2 of the above tween
            tween.start();
            tween.onUpdate(function()
            {
                camera.lookAt( cameraLookAtPoint );
                /*if( earthOrbitControls )
                {
                    earthOrbitControls.enabled = true;
                    earthOrbitControls.target.copy( cameraLookAtPoint );
                    earthOrbitControls.state = -1;
                    earthOrbitControls.update();
                }*/
            });

            // ROTATE EARTH
            var start = earth.mesh.quaternion.clone();
            //var end = new THREE.Quaternion();

            var positionw = { x: 0.0 };
            var targetw = { x: 1.0 };
            var tweenw = new TWEEN.Tween( positionw ).to( targetw, Params.AnimTime * 1000.0 );
            tweenw.easing( TWEEN.Easing.Quadratic.InOut );
            //tweenw.delay( Params.AnimTime * 1000.0 );    // Delay until part 2 of the above tween
            tweenw.start();
            tweenw.onUpdate(function()
            {
                THREE.Quaternion.slerp( start, PX.IdentityQuat, earth.mesh.quaternion, positionw.x );
                THREE.Quaternion.slerp( start, PX.IdentityQuat, scope.locationsGroup.quaternion, positionw.x );
            });
            tweenw.onComplete( function()
            {
                appStateMan.ChangeState( PX.AppStates.AppStateLevel1 );

                trackball.Reset( camera );

                // Reset clicked marker index
                scope.clickedMarkerIndex = -1;
            });
        }

    }

    , SetZoomLevel: function( level )
    {
        this.zoomLevel = level;

        switch( level )
        {
            case 0:
            {
                // Hide level 0 stuff
                this.billboards.visible = true;
                this.locationsGroup.visible = false;
                break;
            }
            case 1:
            {
                // Hide level 0 stuff
                this.locationsGroup.visible = true;
                this.billboards.visible = false;

                this.zoomLevel1IntroAnimDone = false;

                //console.log("zoomLevel: ", level );
                this.markerCluster.setGridSize( 0 );
                this.markerCluster.repaint();
                map.setZoom( zoomLevel );

                //
                var distanceToCenter = ( camera.position.length() );
                var distanceToCenterNorm = PX.Saturate( distanceToCenter / PX.kCameraMaxDistance );
                var camLatLon = PX.Utils.ConvertPosToLatLon( camera.position.x, camera.position.y, camera.position.z, distanceToCenter );
                camLatLon.x = ( 90.0 - camLatLon.x );
                camLatLon.y = camLatLon.y - 90.0;
                Params.Latitude = camLatLon.x;
                Params.Longitude = camLatLon.y;

                var mapCenter = new google.maps.LatLng( camLatLon.x, camLatLon.y );
                map.setCenter( mapCenter );
                break;
            }
            default:
                break;
        }
    }


    , PopulateMarkers: function( markerCluster, locations, camera )
    {
        this.markersCount = 0;

        var clusterCount = markerCluster.getTotalClusters();

        var scope = this;

        if( clusterCount > 0 )
        {
            console.log( "+--+  Number of clusters: " + clusterCount + " at zoom level: " + this.zoomLevel );

            this.doPopulation = false;

            //
            for( var i=0; i<locations.length; ++i )
            {
		        //this.billboardGeometry.attribute.positions[i].set( 10000, 0, 0 );
		        this.geomPositionArray[i*3+0] = 10000;
		        this.geomPositionArray[i*3+1] = 0;
		        this.geomPositionArray[i*3+2] = 0;
            }

            //
            var distToCamera = new THREE.Vector3();
            for( var i=0; i<clusterCount; ++i )
            {
                var c = markerCluster.clusters_[i];
                var clusterCenter = c.getCenter();

                //console.log( i, clusterCenter.lat(), clusterCenter.lng() );

                this.markers[i].text = String( c.markers_.length );
                this.markers[i].latlon.set( clusterCenter.lat(), clusterCenter.lng() );
                this.markers[i].scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
                this.markers[i].position.copy( PX.Utils.FromLatLon( clusterCenter.lat(), clusterCenter.lng(), PX.kEarthScale, PX.kMarkerOffsetFromEarthSurface ) );
                this.markers[i].markerCount = c.markers_.length;
                this.markers[i].index = i;

                this.markersCount++;

                // Scale meshes down by default
                this.meshes[i].scale.copy( this.markers[i].scale );

                
                // Use distance to camera for constant size
                distToCamera.subVectors( camera.position, this.markers[i].position );
                var locationScale = distToCamera.length();
                locationScale = ( locationScale / PX.kCameraMaxDistance );

                //this.markers[i].scale.set( locationScale, locationScale, locationScale );
                
                var target = new THREE.Vector3( locationScale, locationScale, locationScale );
                this.markers[i].tween = new TWEEN.Tween( this.markers[i].scale ).to( target, 250.0 ); ///clusterCount );
                this.markers[i].tween.easing( TWEEN.Easing.Quintic.InOut );

                // Delay is the time that takes to tween Level1 group node
                var delayTime = Params.AnimTime * 1000.0;
                this.markers[i].tween.delay( delayTime + ((i * 500)/clusterCount) );
                this.markers[i].tween.start();
                if( i === clusterCount-1 )
                {
                    this.markers[i].tween.onComplete( function()
                    {
                        scope.zoomLevel1IntroAnimDone = true;
                    });
                }
            }

            //
            //this.billboardGeometry.verticesNeedUpdate = true;
            this.billboardGeometry.attributes.position.needsUpdate = true;
            this.billboardGeometry.attributes.color.needsUpdate = true;
        }
    }


    , MarkerAvoidance: function( markerCluster, frameTime )
    {
        if( this.doPopulation || this.doAvoidance === false )
        {
            //console.log( "no avoidance" );
            return;
        }

        // Avoid touching
        //
        var MinDistancesPerLevel = [ 
            230,
            70
        ];
        /*var MinDistancesPerLevel = [ 
            230,
            185,
            130,
            105,
            70,
            35,
            20 //17.5
        ];*/

        this.avoidanceCount = 0;

        var distToCamera = new THREE.Vector3();
        for( var j=0; j<this.markersCount; ++j )
        {
            var locj = this.markers[j];

            for( var i=j+1; i<this.markersCount; ++i )
            {
                var loci = this.markers[i];

                var latloni = PX.Utils.ConvertPosToLatLon( loci.position.x, loci.position.y, loci.position.z, PX.kEarthScale );
                var latlonj = PX.Utils.ConvertPosToLatLon( locj.position.x, locj.position.y, locj.position.z, PX.kEarthScale );

                var p1 = new google.maps.LatLng( latloni.x, latloni.y );
                var p2 = new google.maps.LatLng( latlonj.x, latlonj.y );
                //var latLonDir = new THREE.Vector2( p1.lat(), p1.lng() ).sub( new THREE.Vector2( p2.lat(), p2.lng() ) ).normalize();

                var dir = locj.position.clone().sub( loci.position ).normalize();
                //var dist = locj.position.clone().sub( loci.position );
                //var dir = dist.clone().normalize();

                var minDistance = MinDistancesPerLevel[ this.zoomLevel ];
                //var minDistance = MinDistancesPerLevel[ PX.Clamp( this.zoomLevel, 0, PX.kZoomMaxLevel ) ];

                var distInKm = markerCluster.distanceBetweenPoints_( p1, p2 );
                if( distInKm <= minDistance )
                {
                    this.avoidanceCount++;

                    var speed = PX.Clamp( minDistance-distInKm, 0.0, minDistance ) * PX.kAvoidanceSpeed;
                    //console.log( distInKm );

                    loci.position.x -= dir.x * frameTime * speed;
                    loci.position.y -= dir.y * frameTime * speed;
                    loci.position.z -= dir.z * frameTime * speed;
                    //
                    locj.position.x += dir.x * frameTime * speed;
                    locj.position.y += dir.y * frameTime * speed;
                    locj.position.z += dir.z * frameTime * speed;

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
            }
        }

        //console.log( "this.avoidanceCount: ", this.avoidanceCount );
        if( this.zoomLevel > 0 && this.avoidanceCount <= this.markersCount/4 )
        {
            console.log( "+--+  Stop avoidance code" );
            this.doAvoidance = false;
        }
    }
};
