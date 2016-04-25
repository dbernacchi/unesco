
/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarker = function()
{ 
    this.id             = -1;
    this.GUID           = "";
    this.title          = "";
    this.text           = "";
    this.index          = -1;
    this.latlon         = new THREE.Vector2();
    this.position       = new THREE.Vector3();
    this.direction      = new THREE.Vector3();
    this.positionSS     = new THREE.Vector3();
    this.scale          = new THREE.Vector3();
    this.markerCount    = 0;
    this.type           = 0;
    this.color          = null;
    this.targetColor    = null;
    this.colorChangeSpeed = 2.0;

    this.modelCount     = 0;

    this.tween          = null;
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
    this.textRenderer           = null;
    this.textRenderer1          = null;
    this.textRenderer2          = null;
    this.circleRenderer         = null;
	this.markersCount           = 0;

    this.titleTargetOpacity     = 0.0;

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
    this.currentMouseOverMarkerIndex = -1;

    this.clickedStartTime       = 0.0;
    this.level2GlobalScale      = new THREE.Vector2( 1.0, 1.0 );
    this.level2SelectedGlobalScale = new THREE.Vector2( 1.0, 1.0 );
    this.outlineGlobalScale     = new THREE.Vector2( 0.0, 0.0 );

    this.lineSprite             = null;

    //this.level1FilterScales     = [];

    this.locationsGroupAnim     = true;
};

UG.LocationMarkers.prototype =
{
    constructor: UG.LocationMarkers

    , Init: function( locations, markerCluster, bmFontDescriptor, scene )
    {
    	this.markerCluster = markerCluster;

        this.markerScene = new THREE.Scene();

        //
        var spriteMat = new THREE.SpriteMaterial( { map: PX.AssetsDatabase["TooltipLine"], color: 0xffffff, transparent: true, opacity: 0.0 } );
        this.lineSprite = new THREE.Sprite( spriteMat );
        this.lineSprite.material.side = THREE.DoubleSide;
        this.lineSprite.material.blending = THREE.AdditiveBlending;
        this.lineSprite.material.depthWrite = false;
        this.lineSprite.material.premultipliedAlpha = true;

        this.markerScene.add( this.lineSprite );

        //
        this.locationsGroup = new THREE.Object3D();
	    this.locationsGroup.position.set( 0, 0, 0 );
        //this.locationsGroup.renderOrder = 1000;

        //
	    for( var i=0; i<locations.length; ++i )
	    {
            var loc = locations[i];

	        // Get color
            var rndIdx = Math.round( Math.random() * 3 ) % 3;
            var color = PX.kLocationColor.clone();

	        //var material = new THREE.MeshLambertMaterial( { color: color, emissive: 0x003333 } );
	        var material = new THREE.MeshLambertMaterial( { color: color } );
	        //var material = new THREE.MeshBasicMaterial( { color: color } );
	        //material.depthWrite = false;
            //material.polygonOffset = true;
            //material.polygonOffsetFactor = 0.6;
            //material.polygonOffsetUnits = 1.0;
            material.side = THREE.DoubleSide;
            var geom = new THREE.CircleBufferGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerDetail );
	        var matTrans = new THREE.Matrix4().makeTranslation( 0, 0, Params.MarkerCircleDist );
	        geom.applyMatrix( matTrans );
            /*
	        //var material = new THREE.MeshLambertMaterial( { color: color, emissive: 0x003333 } );
	        var material = new THREE.MeshLambertMaterial( { color: color } );
	        //var material = new THREE.MeshBasicMaterial( { color: color } );
	        //material.depthWrite = false;
            material.polygonOffset = true;
            material.polygonOffsetFactor = 0.6;
            material.polygonOffsetUnits = 1.0;

	        var geom = new THREE.CylinderGeometry( PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerScale, PX.kLocationMarkerDetail, 1 );
	        var matTrans = new THREE.Matrix4().makeTranslation( 0, 0, -PX.kLocationMarkerScale*0.5 );
	        var matRot = new THREE.Matrix4().makeRotationX( THREE.Math.degToRad( 90.0 ) )
	        var objMat = new THREE.Matrix4().multiplyMatrices( matTrans, matRot );
	        geom.applyMatrix( objMat );*/

	        var mesh = new THREE.Mesh( geom, material );

	        mesh.position.copy( loc.position );
	        mesh.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON);
	        mesh.lookAt( new THREE.Vector3(0, 0, 0) );

	        mesh.name = loc.name;

	        //
	        this.meshes.push( mesh );

	        var lm = new UG.LocationMarker();
            lm.id = loc.id;
	        lm.title = loc.name.toUpperCase();
	        lm.text = "";
	        lm.position.copy( loc.position );
            lm.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
            //lm.clicks = 0;
            lm.color = color;
            lm.targetColor = color.clone();
            lm.colorChangeSpeed = 10.0;
            lm.index = i;
            lm.type = rndIdx;
	        this.markers.push( lm );

            this.level0Scales.push( new THREE.Vector3( PX.EPSILON, PX.EPSILON, PX.EPSILON ) );

	        this.locationsGroup.add( mesh );
	    }

        //
        this.textRenderer1 = new PX.TextRenderer();
        this.textRenderer1.Init( bmFontDescriptor, 2048, 0xffffff, PX.AssetsDatabase["TextAtlasTex"], null );
        this.textRenderer1.material.depthWrite = false;
        this.textRenderer1.material.opacity = 1.0;
        //this.textRenderer1.material.polygonOffset = true;
        //this.textRenderer1.material.polygonOffsetFactor = 1.0;
        //this.textRenderer1.material.polygonOffsetUnits = 1.0;
        this.locationsGroup.add( this.textRenderer1.mesh );


        this.circleRenderer = new PX.CircleRenderer();
        this.circleRenderer.Init( 4096, 0xffffff, PX.AssetsDatabase["Circle"], null );
        this.circleRenderer.material.depthWrite = false;
        this.circleRenderer.material.opacity = 0.0;
        //this.circleRenderer.material.polygonOffset = true;
        //this.circleRenderer.material.polygonOffsetFactor = -1.0;
        //this.circleRenderer.material.polygonOffsetUnits = 1.0;
        this.locationsGroup.add( this.circleRenderer.mesh );

        //
        this.textRenderer = new PX.TextRenderer();
        this.textRenderer.Init( bmFontDescriptor, 256, 0xffffff, PX.AssetsDatabase["TextAtlasTex"], this.markerScene );
        this.textRenderer.material.depthWrite = false;
        this.textRenderer.material.opacity = 0.0;
        //this.locationsGroup.add( this.textRenderer.mesh );
        //this.markerScene.add( this.textRenderer.mesh );

        //
        if( this.locationsGroupAnim ) this.locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );

	    scene.add( this.locationsGroup );


        this.billboardMaterial = new THREE.PointsMaterial( { size: Params.Level0MarkerRadius, sizeAttenuation: false, color: 0xffffff, opacity: 1.0, map: PX.AssetsDatabase[ "Circle" ], transparent: true } );
        //this.billboardMaterial = new THREE.PointsMaterial( { size: Params.Level0MarkerRadius, sizeAttenuation: false, color: 0xffffff, opacity: 0.8, map: PX.AssetsDatabase[ "Circle" ], transparent: true } );
        this.billboardMaterial.vertexColors = THREE.VertexColors;
        //this.billboardMaterial.depthTest = false;
        //this.billboardMaterial.depthWrite = false;
        this.billboardGeometry = new THREE.BufferGeometry();

		var positions = new Float32Array( locations.length * 3 );
		var colors = new Float32Array( locations.length * 3 );

        var commonColor = PX.kLocationColor;

        var vertex = new THREE.Vector3();
        for( var i=0; i<locations.length; ++i )
        {
		    vertex.copy( locations[i].position );

            positions[ i*3+0] = 10000.0; //vertex.x;
            positions[ i*3+1] = 0.0; //vertex.y;
            positions[ i*3+2] = 0.0; //vertex.z;
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
        //this.markerScene.add( this.textRenderer2.mesh );

        this.camera2d = new THREE.OrthographicCamera( 0, Params.WindowWidth, Params.WindowHeight, 0, -100, 100 );
        this.markerScene.add( this.camera2d );

/***
        this.level1FilterScales.push( new THREE.Vector3( 1.0, 1.0, 1.0 ) );
        this.level1FilterScales.push( new THREE.Vector3( 1.0, 1.0, 1.0 ) );
        this.level1FilterScales.push( new THREE.Vector3( 1.0, 1.0, 1.0 ) );
***/
        // Init
        ////this.markerScene.visible = false;
        this.locationsGroup.visible = false;
        this.textRenderer.visible = false;

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
        if( this.locationsGroupAnim )
        {
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
        else
        {
            this.locationsGroup.scale.set( targetValue, targetValue, targetValue );
            if( onCompleteCB ) onCompleteCB();
        }
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
                this.UpdateLocationCircleBillboards( time, frameTime, camera );
                break;
            }
            case PX.AppStates.AppStateLevel1ToLevel0:
            {
                this.UpdateLocationCircleBillboards( time, frameTime, camera );
                this.UpdateLocationMeshes( time, frameTime, camera );
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
        var camDir = camera.getWorldDirection().multiplyScalar( -1.0 );

        // Update billboard's size
        this.billboards.material.size = this.billboardsGroup.scale.x * Params.Level0MarkerRadius;
        //console.log( "this.billboards.material.size: ", this.billboards.material.size );

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[ i ];

            // Text Info
            //
            //var ttt = (1.0) * PX.kLocationMarkerZScale;
            //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

            //var v0 = camera.position.clone().sub( loc.position ).normalize();
            var v1 = loc.direction;
            //var v1 = loc.position.clone().normalize();
            var dot = camDir.dot( v1 );

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

                var fontSize = PX.kLocationFontSize;

                this.textRenderer2.AppendText2D( loc.text, loc.positionSS, fontSize, this.billboardsGroup.scale.x, true, true );
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

        // Place only visible clusters/markers
        //
        var matTrans = new THREE.Matrix4();
        var matRot = new THREE.Matrix4();
        var matScale = new THREE.Matrix4();
        var matRes = new THREE.Matrix4();
        var distToCamera = new THREE.Vector3();

        this.circleRenderer.Begin();
        this.circleRenderer.material.opacity = 1.0;

        this.textRenderer1.Begin();
        this.textRenderer1.material.opacity = 1.0;

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Use distance to camera for constant size
            if( this.zoomLevel1IntroAnimDone ) 
            {
                distToCamera.subVectors( camera.position, loc.position );
                var locationScale = distToCamera.length();
                locationScale = ( locationScale * PX.kCameraOneOverMaxDistance ); /// PX.kCameraMaxDistance );

                // If there is more than 1 model scale the location marker
                if( loc.modelCount > 1 )
                {
                    locationScale *= 2.0;
                }
                
                // Apply a global scale (used in level 2 to scale all non selected markers)
                if( i !== this.clickedMarkerIndex )
                {
                    locationScale *= this.level2GlobalScale.x;
                }
                if( i === this.clickedMarkerIndex && loc.modelCount <= 1 )
                {
                    locationScale *= this.level2SelectedGlobalScale.x;
                }

                //locationScale *= this.level1FilterScales[ loc.type ].x;

                loc.scale.set( locationScale, locationScale, locationScale );

                // If there's a clicked marker, do pulse effect on it
                // this is used in Level2 when a location has been selected
                if( i === this.clickedMarkerIndex && appStateMan.IsState( PX.AppStates.AppStateLevel2 ) )
                //if( i === this.clickedMarkerIndex )
                {
                    //var per = i / (this.markersCount - 1);
                    var pulse = PX.CubicPulse( 0.0, 0.5, Math.sin( (time-this.clickedStartTime) * 2.0 ) );
                    //var pulse = PX.Saturate( PX.Utils.Pulse( (2.0*Math.PI*per) + time, 0.5 ) );
                    loc.scale.x += pulse * 0.2;
                    loc.scale.y += pulse * 0.2;
                    loc.scale.z += pulse * 0.2;
                }
            }

            this.meshes[i].position.copy( loc.position );
            this.meshes[i].scale.set( loc.scale.x, loc.scale.y, loc.scale.z );
            //this.meshes[i].scale.set( loc.scale.x, loc.scale.y, loc.scale.z * PX.kLocationMarkerZScale );
            //this.meshes[i].scale.set( loc.scale.x, loc.scale.y, loc.scale.z * ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 ) );
            this.meshes[i].lookAt( PX.ZeroVector );
            loc.color.r += (loc.targetColor.r - loc.color.r ) * frameTime * loc.colorChangeSpeed;
            loc.color.g += (loc.targetColor.g - loc.color.g ) * frameTime * loc.colorChangeSpeed;
            loc.color.b += (loc.targetColor.b - loc.color.b ) * frameTime * loc.colorChangeSpeed;
            this.meshes[i].material.color.copy( loc.color );

            // Marker's Text Info
            //
            if( loc.modelCount > 1 )
            {
                var ttt = (1.0) * PX.kLocationMarkerZScale;
                //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

                var smallOffset = 0.001;
                var p = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (ttt * loc.scale.z * PX.kLocationMarkerScale) );

                matTrans = matTrans.makeTranslation( p.x, p.y, p.z );
                matRot.makeRotationFromQuaternion( this.meshes[i].quaternion );
                matScale.makeScale( loc.scale.x, loc.scale.y, loc.scale.z );
                matRes.multiplyMatrices( matTrans, matRot );
                matRes.multiplyMatrices( matRes, matScale );

                var fontSize = 130;
                if( PX.IsMobile ) fontSize = 64;
                var localPos = new THREE.Vector3( 0, 0, Params.MarkerTextDist );
                this.textRenderer1.AppendText( ""+loc.modelCount, localPos, fontSize, matRes, true );
            }

            //
            var outlinePos = new THREE.Vector3();
            outlinePos.z += Params.OutlineDist;
            this.circleRenderer.AppendRect( outlinePos, this.outlineGlobalScale.x * (PX.kLocationMarkerScale + ((Params.OutlineThickness * 0.001) / loc.scale.x)), this.meshes[i].matrix );
	    }

        this.textRenderer1.End();
        this.circleRenderer.End();


        //
        this.textRenderer.Begin();

        this.textRenderer.material.opacity += ( this.titleTargetOpacity - this.textRenderer.material.opacity ) * frameTime * 10.0;
        this.lineSprite.material.opacity = PX.Saturate( this.textRenderer.material.opacity * this.textRenderer.material.opacity );

        if( this.currentMouseOverMarkerIndex >= 0 )
        {
            var loc = this.markers[ this.currentMouseOverMarkerIndex ];

            var v0 = camera.getWorldDirection().multiplyScalar( -1.0 );
            var v1 = loc.direction;
            //var v0 = camera.position.clone().sub( loc.position ).normalize();
            //var v1 = loc.position.clone().normalize();
            var dot = v0.dot( v1 );

            //
            if( dot >= 0.0 )
            {
                //loc.positionSS.copy( loc.position.clone().applyMatrix4( earth.mesh.matrix ) );
                loc.positionSS.copy( loc.position.clone().applyQuaternion( earth.mesh.quaternion ) );
                loc.positionSS.project( camera );

                // 2d ortho
                loc.positionSS.x = ( (loc.positionSS.x + 1.0 ) * 0.5 ) * Params.WindowWidth;
                loc.positionSS.y = ( (loc.positionSS.y + 1.0 ) * 0.5 ) * Params.WindowHeight;
                loc.positionSS.z = 0.0;

                var offsetValue = 30.0;
                var offsetValueScale = 0.125;
                if( loc.modelCount > 1 ) offsetValueScale *= 2.0;

                // Offset overlay text
                //
                if( loc.positionSS.y < Params.WindowHeight-(Params.WindowHeight/10) )
                {
                    this.lineSprite.position.set( loc.positionSS.x + offsetValue * 0.5, loc.positionSS.y + offsetValue * 0.5, 0 );
                    this.lineSprite.scale.set( offsetValue, offsetValue, 1 );
                    // @NOTE: Must be done after changing lineSprite
                    loc.positionSS.x += offsetValue;
                    loc.positionSS.y += offsetValue;

                    this.lineSprite.position.x += offsetValue * offsetValueScale;
                    this.lineSprite.position.y += offsetValue * offsetValueScale;
                    loc.positionSS.x += offsetValue * offsetValueScale;
                    loc.positionSS.y += offsetValue * offsetValueScale;
                }
                // If near the top, move tooltip down (invert)
                else
                {
                    this.lineSprite.position.set( loc.positionSS.x + offsetValue * 0.5, loc.positionSS.y - offsetValue * 0.5, 0 );
                    this.lineSprite.scale.set( offsetValue, -offsetValue, 1 );
                    // @NOTE: Must be done after changing lineSprite
                    loc.positionSS.x += offsetValue;
                    loc.positionSS.y -= offsetValue;

                    this.lineSprite.position.x += offsetValue * offsetValueScale;
                    this.lineSprite.position.y -= offsetValue * offsetValueScale;
                    loc.positionSS.x += offsetValue * offsetValueScale;
                    loc.positionSS.y -= offsetValue * offsetValueScale;

                }

                var fontSize = PX.kLocationFontSize;

                this.textRenderer.AppendText2D( loc.title, loc.positionSS, fontSize, 1.0, false, true );
            }
        }

        this.textRenderer.End();
    }


    , ChangeSelectedLocationTargetColor( colorHex )
    {
        if( i === this.clickedMarkerIndex && appStateMan.IsState( PX.AppStates.AppStateLevel2 ) )
        {
            //UNESCO.changeLevel2SelectedMarker( colorHex );
            this.markers[ this.clickedMarkerIndex ].targetColor.set( colorHex );
        }
    }

    , SetLocationTargetColor( filters, loc )
    {
        if( filters[ loc.type ] )
        {
            var idx = loc.type;
            loc.targetColor.copy( PX.kLocationColors2[ idx ] );
            loc.colorChangeSpeed = 2.0;
            return;
        }

        loc.targetColor.copy( PX.kLocationColor );
        loc.colorChangeSpeed = 10.0;
    }


    , FilterLocationMeshColors: function( filters )
    {
        if( this.doPopulation || !this.zoomLevel1IntroAnimDone )
            return;

/***
        // find is all filters are on
        var allFiltersOff = 0;
        for( var i=0; i<3; ++i )
        {
            allFiltersOff += filters[ i ];
        }

        for( var i=0; i<3; ++i )
        {
            var value = PX.Saturate( filters[i]+PX.EPSILON );
            if( allFiltersOff === 0 )  value = PX.Saturate( 1.0 ); // IF all filters are off, then show everything

            var target = new THREE.Vector3( value, value, value );
            tween = new TWEEN.Tween( this.level1FilterScales[ i ] ).to( target, 0.2 * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            //this.level1FilterScales[ i ].set( filters[i], filters[i], filters[i] );
        }
***/
        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Use distance to camera for constant size
            this.SetLocationTargetColor( filters, loc );
        }
    }

    , ResetLevel1: function( raycaster )
    {
        if( this.doPopulation )
            return -1;

/***
        for( var i=0; i<3; ++i )
        {
            this.level1FilterScales[ i ].set( 1.0, 1.0, 1.0 );
        }
***/
        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];
            loc.color.copy( PX.kLocationColor );
        }
    }


    , IntersectsLevel1: function( raycaster )
    {
        if( this.doPopulation )
            return -1;

        /*for( var i=0; i<this.markersCount; ++i )
        {
            this.meshes[ i ].material.color.copy( this.markers[ i ].color );
        }*/

        // Intersection test per mesh
        for( var i=0; i<this.markersCount; ++i )
        {
            var intersects = raycaster.intersectObject( this.meshes[ i ], false );
            if( intersects.length > 0 )
            {
                var loc = this.markers[i];
                //console.log( intersects );
                //intersects[ 0 ].object.material.color.set( PX.kLocationMouseOverColor );
                loc.targetColor.copy( PX.kLocationColors2[3] );
                loc.colorChangeSpeed = 10.0;
                this.titleTargetOpacity = 1.0;
                return i;
            }
        }

        this.titleTargetOpacity = 0.0;

        return -1;
    }


    , IntersectsLevel0: function( mouse )
    {
        if( this.doPopulation )
            return -1;

        var c0 = PX.kLocationColor;
        var c1 = PX.kLocationColors2[2];

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


    , OnMouseOverEvent: function()
    {
        var scope = this;

        // Level 1
        if( appStateMan.IsState( PX.AppStates.AppStateLevel1 ) )
        {
            // Update raycaster
            var mouseVector = new THREE.Vector2();
            mouseVector.x = 2.0 * (mouseX / windowWidth) - 1.0;
            mouseVector.y = 1.0 - 2.0 * ( mouseY / windowHeight );
            g_Raycaster.setFromCamera( mouseVector, camera );

            var index = this.IntersectsLevel1( g_Raycaster );
            if( index < 0 )
            {
                if( this.currentMouseOverMarkerIndex >= 0 )
                {
                    var loc = this.markers[ this.currentMouseOverMarkerIndex ];
                    this.SetLocationTargetColor( WebpageStates.FilterSwitches, loc );
                }

                this.currentMouseOverMarkerIndex = -1;
                //console.log( "no intersection", index );
                return;
            }

            // Restore previous loc color (just in case )
            // This fixes an issue where a mouse pos would change too fast that in one time would be over a loc and the next would be on top of another
            if( this.currentMouseOverMarkerIndex >= 0 && this.currentMouseOverMarkerIndex !== index )
            {
                var loc = this.markers[ this.currentMouseOverMarkerIndex ];
                this.SetLocationTargetColor( WebpageStates.FilterSwitches, loc );
            }

            this.currentMouseOverMarkerIndex = index;
        }
    }


    //
    // isZoomToLocation: Used to zoom in to a given location or simply to get camera zoomed in. true/false
    //
    , OnMouseClickEvent: function( mouse3d, camera, isZoomToLocation, onLocationClickCB )
    {
        var scope = this;

        // Level 0
        if( appStateMan.IsState( PX.AppStates.AppStateLevel0 ) )
        {
            var index = -1;

            if( isZoomToLocation )
            {
                index = this.IntersectsLevel0( mouse3d );
                if( index < 0 )
                {
                    //console.log( "no intersection", index );
                    return 0;
                }
            }

            //console.log( "entered OnMouseClickEvent" );
            //trackball.Reset( camera, cameraLookAtPoint );


            // Change app state
            appStateMan.ChangeState( PX.AppStates.AppStateLevel0ToLevel1 );

            // Apply tilt shift
            var tiltStart = { x: Params.TiltShiftStrength };
            var tiltEnd = { x: Params.TiltShiftMaxStrength };
            var tiltTween = new TWEEN.Tween( tiltStart ).to( tiltEnd, 1000.0 );
            tiltTween.easing( TWEEN.Easing.Quintic.InOut );
            tiltTween.start();
            tiltTween.onUpdate( function()
            {
                Params.TiltShiftStrength = tiltStart.x;
            });

/***
            // Reset filter scales and switches
            for( var i=0; i<3; ++i )
            {
                WebpageStates.FilterSwitches[ i ] = 0;
                locationMarkers.level1FilterScales[ i ].set( 1.0, 1.0, 1.0 );
            }
***/
            //
            locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );


            this.TweenLevel0( PX.EPSILON, Params.AnimTime * 0.2 * 1000.0, Params.AnimTime * 0.8 * 1000.0, 
            null, 
            function()
            {
                trackball.Reset( camera, cameraLookAtPoint );

                //scope.doAvoidance = false;
            });

            Params.CameraDistance = PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, 0.0 );

            var cameraTargetPoint = null;
            
            if( isZoomToLocation )
            {
                var loc = this.markers[ index ];
                cameraTargetPoint = loc.position.clone().normalize().multiplyScalar( Params.CameraDistance );
            }
            else
            {
                // Just zoom in in camera's direction
                cameraTargetPoint = camera.position.clone().normalize();
                cameraTargetPoint.multiplyScalar( Params.CameraDistance );
                //console.log( cameraTargetPoint );
            }


            // POSITION
            var tween = new TWEEN.Tween( camera.position ).to( cameraTargetPoint, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            tween.onStart(function()
            {
            });
            tween.onComplete(function()
            {
                scope.SetZoomLevel( 1 );
                scope.doPopulation = true;
                scope.doAvoidance = true;

                scope.TweenLevel1( 1.0, Params.AnimTime * 1000.0, 0 * 1000.0, null, function()
                {
                    // Change app state
                    //appStateMan.ChangeState( PX.AppStates.AppStateLevel1 );

                    trackball.Reset( camera, cameraLookAtPoint );
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


            // Outline Global Scale
            this.outlineGlobalScale.set( 0.0, 0.0 );
        }

        // Level 1
        else if( appStateMan.IsState( PX.AppStates.AppStateLevel1 ) )
        {
            // Update raycaster
            var mouseVector = new THREE.Vector2();
            mouseVector.x = 2.0 * (mouseX / windowWidth) - 1.0;
            mouseVector.y = 1.0 - 2.0 * ( mouseY / windowHeight );
            g_Raycaster.setFromCamera( mouseVector, camera );

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

            trackball.Reset( camera, cameraLookAtPoint );

            // Change State
            appStateMan.ChangeState( PX.AppStates.AppStateLevel1ToLevel2 );


            // Apply tilt shift
            var tiltStart = { x: Params.TiltShiftStrength };
            var tiltEnd = { x: Params.TiltShiftMaxStrength * 2.0 };
            var tiltTween = new TWEEN.Tween( tiltStart ).to( tiltEnd, 1000.0 );
            tiltTween.easing( TWEEN.Easing.Quintic.InOut );
            tiltTween.start();
            tiltTween.onUpdate( function()
            {
                Params.TiltShiftStrength = tiltStart.x;
            });


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
            });

            // ROTATE EARTH
            var v0 = camera.getWorldDirection().clone().normalize();
            var v1 = right.clone().normalize();
            v1 = v1.crossVectors( v1, v0 ).normalize();

            var start = earth.mesh.quaternion.clone();
            var end = null;
            if( PX.IsMobile )
                end = new THREE.Quaternion().setFromAxisAngle( v1, PX.ToRadians(50) );
            else
                end = new THREE.Quaternion().setFromAxisAngle( v1, PX.ToRadians(40) );

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

                trackball.Reset( camera, cameraLookAtPoint );

                // click start time. Used to reset pulse timer
                scope.clickedStartTime = currentTime;

            });

            // Non-Selected Marker Global Scale
            var gsTarget = new THREE.Vector2( PX.EPSILON, PX.EPSILON );
            var tweengs = new TWEEN.Tween( this.level2GlobalScale ).to( gsTarget, Params.AnimTime * 1000.0 );
            tweengs.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs.start();

            // Selected Marker Global Scale
            var gs2Target = new THREE.Vector2( 2.0, 2.0 );
            var tweengs2 = new TWEEN.Tween( this.level2SelectedGlobalScale ).to( gs2Target, Params.AnimTime * 1000.0 );
            tweengs2.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs2.start();

            // Outline Global Scale
            var ogsTarget = new THREE.Vector2( 0.0, 0.0 );
            var tweenogs = new TWEEN.Tween( this.outlineGlobalScale ).to( ogsTarget, Params.AnimTime * 1000.0 * 0.25 );
            tweenogs.easing( TWEEN.Easing.Quadratic.InOut );
            tweenogs.start();
        }

        // Level 2
        else if( appStateMan.IsState( PX.AppStates.AppStateLevel2 ) )
        {
            // Update raycaster
            var mouseVector = new THREE.Vector2();
            mouseVector.x = 2.0 * (mouseX / windowWidth) - 1.0;
            mouseVector.y = 1.0 - 2.0 * ( mouseY / windowHeight );
            g_Raycaster.setFromCamera( mouseVector, camera );

            // If clicking on the globe, go back to Level 1
            var intersects = g_Raycaster.intersectObject( earth.mesh, false );
            if( ! intersects.length )
            {
                return;
            }

            // Change State
            appStateMan.SetState( PX.AppStates.AppStateLevel2ToLevel1 );

            var index = this.clickedMarkerIndex;

            // Reset clicked marker to its original color (Gets changed by the scroller)
            this.markers[ index ].targetColor.set( PX.kFilterColor );

            // Restore default color
            this.SetLocationTargetColor( WebpageStates.FilterSwitches, this.markers[ index ] );

            // Text and sprite opacity
            this.titleTargetOpacity = 0.0;

            // Apply tilt shift
            var tiltStart = { x: Params.TiltShiftStrength };
            var tiltEnd = { x: Params.TiltShiftMaxStrength };
            var tiltTween = new TWEEN.Tween( tiltStart ).to( tiltEnd, 1000.0 );
            tiltTween.easing( TWEEN.Easing.Quintic.InOut );
            tiltTween.start();
            tiltTween.onUpdate( function()
            {
                Params.TiltShiftStrength = tiltStart.x;
            });
            // tiltshift focus position
            var tiltPosStart = { x: Params.TiltShiftPosition };
            var tiltPosEnd = { x: 0.5 };
            tiltTween = new TWEEN.Tween( tiltPosStart ).to( tiltPosEnd, 1000.0 );
            tiltTween.easing( TWEEN.Easing.Quintic.InOut );
            tiltTween.start();
            tiltTween.onUpdate( function()
            {
                Params.TiltShiftPosition = tiltPosStart.x;
            });

            // Non-Selected Marker Global Scale
            var gsTarget = new THREE.Vector2( 1, 1 );
            var tweengs = new TWEEN.Tween( this.level2GlobalScale ).to( gsTarget, Params.AnimTime * 1000.0 );
            tweengs.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs.start();

            // Selected Marker Global Scale
            var gs2Target = new THREE.Vector2( 1.0, 1.0 );
            var tweengs2 = new TWEEN.Tween( this.level2SelectedGlobalScale ).to( gs2Target, Params.AnimTime * 1000.0 );
            tweengs2.easing( TWEEN.Easing.Quadratic.InOut );
            tweengs2.start();

            // Outline Global Scale
            var ogsTarget = new THREE.Vector2( 1.0, 1.0 );
            var tweenogs = new TWEEN.Tween( this.outlineGlobalScale ).to( ogsTarget, Params.AnimTime * 1000.0 * 0.2 ); //Params.AnimTime * 1000.0 );
            tweenogs.easing( TWEEN.Easing.Quadratic.InOut );
            tweenogs.delay( Params.AnimTime * 1000.0 * 0.8 );
            tweenogs.start();

            // CAMERA POSITION
            var target = this.meshes[ index ].position.clone().normalize().multiplyScalar( Params.CameraDistance );
            var tween = new TWEEN.Tween( camera.position ).to( target, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();

            // CAMERA LOOKAT
            var target2 = { x : 0, y: 0, z: 0 };
            tween = new TWEEN.Tween( cameraLookAtPoint ).to( target2, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            //tween.delay( Params.AnimTime * 1000.0 );    // Delay until part 2 of the above tween
            tween.start();
            tween.onUpdate(function()
            {
                camera.lookAt( cameraLookAtPoint );
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

                trackball.Reset( camera, cameraLookAtPoint );

                // Reset clicked marker index
                scope.clickedMarkerIndex = -1;

                scope.currentMouseOverMarkerIndex = -1;
            });
        }

        return 1;
    }


    , SetZoomLevel: function( level )
    {
        this.zoomLevel = level;

        switch( level )
        {
            case 0:
            {
                // Hide level 0 stuff
                this.locationsGroup.visible = false;
                this.textRenderer.visible = false;

                //console.log("zoomLevel: ", level );
                this.markerCluster.setGridSize( Params.MapGridSize );
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
            case 1:
            {
                // Hide level 0 stuff
                this.locationsGroup.visible = true;
                this.textRenderer.visible = true;

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

        var clusterCount = markerCluster.getTotalClusters();

        this.markersCount = 0;

        if( clusterCount > 0 )
        {
            var scope = this;

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
                var loc = this.markers[i];
                //console.log( i, clusterCenter.lat(), clusterCenter.lng() );

                loc.color.copy( PX.kLocationColor );
                loc.targetColor.copy( PX.kLocationColor );
                loc.colorChangeSpeed = 10.0;
	            loc.title = locations[i].name.toUpperCase();
                loc.text = String( c.markers_.length );
                loc.latlon.set( clusterCenter.lat(), clusterCenter.lng() );
                loc.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
                loc.position.copy( PX.Utils.FromLatLon( clusterCenter.lat(), clusterCenter.lng(), PX.kEarthScale, PX.kMarkerOffsetFromEarthSurface ) );
                loc.direction.copy( loc.position.clone().normalize() );
                loc.markerCount = c.markers_.length;
                loc.index = i;

                loc.modelCount = locations[i].modelCount;

                this.markersCount++;

                if( this.zoomLevel > 0 )
                {
                    // Scale meshes down by default
                    this.meshes[i].scale.copy( loc.scale );
                
                    // Use distance to camera for constant size
                    distToCamera.subVectors( camera.position, loc.position );
                    var locationScale = distToCamera.length();
                    locationScale = ( locationScale / PX.kCameraMaxDistance );

                    // If there is more than 1 model, scale the location marker
                    if( loc.modelCount > 1 )
                    {
                        locationScale *= 2.0;
                    }

                    // Tween location markers
                    var target = new THREE.Vector3( locationScale, locationScale, locationScale );
                    loc.tween = new TWEEN.Tween( loc.scale ).to( target, 150.0 );//1000.0/clusterCount );
                    loc.tween.easing( TWEEN.Easing.Quintic.InOut );
                    // Delay is the time that takes to tween Level1 group node
                    if( this.locationsGroupAnim )
                    {
                        var delayTime = Params.AnimTime * 1000.0;
                        loc.tween.delay( delayTime + ((i * 250)/clusterCount) );
                    }
                    else
                    {
                        loc.tween.delay( ((i * 250)/clusterCount) );
                    }
                    loc.tween.start();
                    if( i === clusterCount-1 )
                    {
                        // Outline Global Scale
                        scope.outlineGlobalScale.set( 0.0, 0.0 );
                        var ogsTarget = new THREE.Vector2( 1.0, 1.0 );
                        var tweenogs = new TWEEN.Tween( scope.outlineGlobalScale ).to( ogsTarget, Params.AnimTime * 500.0 );
                        tweenogs.easing( TWEEN.Easing.Quadratic.InOut );
                        tweenogs.delay( Params.AnimTime * 1000.0 );
                        tweenogs.start();

                        loc.tween.onComplete( function()
                        {
                            scope.zoomLevel1IntroAnimDone = true;

                            // Only when markers anim is done we switch state
                            appStateMan.ChangeState( PX.AppStates.AppStateLevel1 );
                        });
                    }
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

                var minDistance = PX.MinDistancesPerLevel[ this.zoomLevel ];
                //var minDistance = PX.MinDistancesPerLevel[ PX.Clamp( this.zoomLevel, 0, PX.kZoomMaxLevel ) ];

                var distInKm = markerCluster.distanceBetweenPoints_( p1, p2 );

                // If there is more than 1 model, increase the min distance
                if( loci.modelCount > 1 || locj.modelCount > 1 )
                {
                    minDistance *= 2.0;
                    //minDistance *= 1.75;
                }

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
