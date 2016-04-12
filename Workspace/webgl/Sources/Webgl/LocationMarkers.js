
/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarker = function()
{ 
    this.GUID = "";
    this.text = "";
    this.index = -1;
    this.latlon = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.scale = new THREE.Vector3();
    this.markerCount = 0;
    this.clicks = 0; // Number of clicks on this marker. 1: align camera, 2: open right menu, 3: in menu

    this.type = 0;
    this.color = null;
};
UG.LocationMarker.prototype =
{
    constructor: UG.LocationMarker
};



/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarkers = function()
{ 
	this.locationsGroup = null;
	this.meshes = [];
	this.markers = [];
    //this.textRenderer = null;
    this.textRenderer2 = null;
	this.markersCount = 0;

	this.markerCluster = null;
    this.doPopulation = true;
    this.doAvoidance = false;

    this.zoomLevel = 0;

    this.billboardMaterial = null;
    this.billboardGeometry = null;
    this.billboards = null;
    this.billboardsGroup = null;

    this.markerScene = null;
    this.camera2d = null;

    var tween = null;
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

	        //var mat = new THREE.MeshLambertMaterial( { color: color, emissive: 0x003333 } );
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
	        mesh.scale.set( 0.001, 0.001, 0.001 );
	        mesh.lookAt( new THREE.Vector3(0, 0, 0) );

	        mesh.name = locations[i].name;

	        //
	        this.meshes.push( mesh );

	        var lm = new UG.LocationMarker();
	        lm.text = "";
	        lm.position.copy( locations[i].position );
            lm.clicks = 0;
            lm.color = color;
            lm.index = i;
	        this.markers.push( lm );

	        this.locationsGroup.add( mesh );
	    }

        //
        //this.textRenderer = new PX.TextRenderer();
        //this.textRenderer.Init( bmFontDescriptor, 2048, 0x000000, PX.AssetsDatabase["TextAtlasTex"], scene );
        //this.locationsGroup.add( this.textRenderer.mesh );

        //
        //this.locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );

	    scene.add( this.locationsGroup );


        this.billboardMaterial = new THREE.PointsMaterial( { size: Params.Level0MarkerRadius, sizeAttenuation: false, color: 0xffffff, opacity: 0.75, map: PX.AssetsDatabase[ "Circle" ], transparent: true } );
        this.billboardMaterial.vertexColors = THREE.VertexColors;
        this.billboardMaterial.depthTest = false;
        this.billboardMaterial.depthWrite = false;
        this.billboardGeometry = new THREE.Geometry();
        for( var i=0; i<locations.length; ++i )
        {
		    var vertex = new THREE.Vector3();
            vertex.x = locations[i].position.x;
            vertex.y = locations[i].position.y;
            vertex.z = locations[i].position.z;
		    this.billboardGeometry.vertices.push( vertex );
		    this.billboardGeometry.colors.push( new THREE.Color( 0x000055 ) );
	    }
	    this.billboards = new THREE.Points( this.billboardGeometry, this.billboardMaterial );
        this.billboards.frustumCulled = false;
        //this.billboards.dynamic = true;

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
    }


    , TweenLevel0: function( targetValue, time, delay, onCompleteCallback )
    {
        var target = { x : targetValue, y: targetValue, z: targetValue };
        var tween = new TWEEN.Tween( this.billboardsGroup.scale ).to( target, time );
        tween.easing( TWEEN.Easing.Quintic.InOut );
        tween.delay( (delay === undefined ) ? 0 : delay );
        tween.start();
        tween.onComplete( function()
        {
            if( onCompleteCallback ) onCompleteCallback();
        });
    }

    , TweenLevel1: function( targetValue, time, delay, onCompleteCallback )
    {
        var target = { x : targetValue, y: targetValue, z: targetValue };
        var tween = new TWEEN.Tween( this.locationsGroup.scale ).to( target, time );
        tween.easing( TWEEN.Easing.Quintic.InOut );
        tween.delay( (delay === undefined ) ? 0 : delay );
        tween.start();
        tween.onComplete( function()
        {
            if( onCompleteCallback ) onCompleteCallback();
        });
    }


    , Render: function( )
	{

	}


    , Update: function( time, frameTime, camera )
    {
        if( this.doPopulation )
            return;

        if( this.zoomLevel === 0 )
        {
            for( var i=0; i<this.markersCount; ++i )
            {
		        this.billboardGeometry.vertices[i].set( 10000, 0, 0 );
            }

            this.UpdateLevel0( time, frameTime, camera );
        }
        else
        {
            //
            for( var i=0; i<this.meshes.length; ++i )
            {
                // restore original color
                /*if( this.markers[ i ].clicks === 0 )
                {
                    this.meshes[ i ].material.color.copy( this.markers[i].color );
                }*/

                // Default all locations to far far away
                this.meshes[i].position.set( 10000, 0, 0 );
	   	    }

            this.UpdateLevel1( time, frameTime, camera );
        }

        //console.log( this.zoomLevel );
    }


    , UpdateLevel0: function( time, frameTime, camera )
    {
        if( this.doPopulation )
            return;

        this.textRenderer2.Begin();


        //var matRot = new THREE.Matrix4();
        //var matTrans2 = new THREE.Matrix4();
        //var matScale2 = new THREE.Matrix4();
        //var matRes2 = new THREE.Matrix4();
        var distToCamera = new THREE.Vector3();

        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Use distance to camera for constant size
            if( locationsIntroAnimDone ) 
            {
                distToCamera.subVectors( camera.position, loc.position );
                var locationScale = distToCamera.length();
                locationScale = ( locationScale / PX.kCameraMaxDistance );
                loc.scale.set( locationScale, locationScale, locationScale );
            }

            // Text Info
            //
            var ttt = (1.0) * PX.kLocationMarkerZScale;
            //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

            var p0 = camera.position.clone().sub( loc.position ).normalize();
            var p1 = loc.position.clone().normalize();
            var dot = p0.dot( p1 );
            //var dotMax = Math.max( 0.0, dot );

            //var smallOffset = 0.001;
            //var p = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (ttt * loc.scale.z * PX.kLocationMarkerScale) );

            //var p2 = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (ttt * loc.scale.z * PX.kLocationMarkerScale) );
            //matRot.makeRotationFromQuaternion( this.meshes[i].quaternion );
            //matTrans2.makeTranslation( loc.position.x, loc.position.y, loc.position.z );
            //matScale2.makeScale( loc.scale.x, loc.scale.y, loc.scale.z );
            //matRes2.multiplyMatrices( matTrans2, matScale2 );
            //matRes2.multiplyMatrices( matTrans2, matRot );
            //matRes2.multiplyMatrices( matRes2, matScale2 );
            //matRes2.makeTranslation( loc.position.x, loc.position.y, loc.position.z );


            // BILLBOARDS
            //var pp = PX.Utils.ProjectPoint( this.markers[i].position.clone(), camera, 10, 10 );//Params.WindowWidth, Params.WindowHeight );
            this.billboards.material.size = this.billboardsGroup.scale.x * Params.Level0MarkerRadius;
            if( dot >= 0.0 )
            {
                var pp = loc.position.clone();
                //var pp = PX.ZeroVector.clone();
                //pp = pp.applyMatrix4( matRes2 );
                pp = pp.project( camera );

                // 2d ortho
                pp.x = ( (pp.x + 1.0 ) * 0.5 ) * Params.WindowWidth;
                pp.y = ( ((pp.y + 1.0 ) * 0.5 )) * Params.WindowHeight;
                pp.z = 0.0;
                //console.log( pp );

		        this.billboardGeometry.vertices[i].set( pp.x, pp.y, 0.0 );

                this.textRenderer2.AppendText2D( loc.text, pp, 9, this.billboardsGroup.scale.x, true );
            }
            else
            {
                // Move far far away from view. not visible
		        this.billboardGeometry.vertices[i].set( 10000, 0, 0.0 );
            }
	    }

        //
        this.billboards.geometry.verticesNeedUpdate = true;
        this.billboards.geometry.colorsNeedUpdate = true;
        //this.billboards.material.needsUpdate = true;

        // Text End
        this.textRenderer2.End();
    }


    , UpdateLevel1: function( time, frameTime, camera )
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

        var bindex = 0;
        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[i];

            // Use distance to camera for constant size
            if( locationsIntroAnimDone ) 
            {
                distToCamera.subVectors( camera.position, loc.position );
                var locationScale = distToCamera.length();
                locationScale = ( locationScale / PX.kCameraMaxDistance );
                loc.scale.set( locationScale, locationScale, locationScale );

                //var per = i / (this.markersCount-1);
                //var pulse = PX.CubicPulse( 0.0, 0.8, Math.sin(time*2.0+i) );
                //var pulse = PX.Saturate( PX.Utils.Pulse( (2.0*Math.PI*per) + time, 0.5 ) );
                //loc.scale.x += pulse * 0.1;
                //loc.scale.y += pulse * 0.1;
                //loc.scale.z += pulse * 0.1;
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


    , Intersects: function( raycaster )
    {
        if( this.doPopulation )
            return;

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
            else
            {
                this.meshes[ i ].material.color.copy( this.markers[ i ].color );
            }
        }

        return -1;
    }


    , IntersectsLevel0: function( mouse )
    {
        if( this.doPopulation )
            return;

        // Intersection test per mesh
        var hr = Params.Level0MarkerRadius * 0.5;
        for( var i=0; i<this.markersCount; ++i )
        {
            var loc = this.markers[ i ];

		    var vert = this.billboardGeometry.vertices[ i ].clone();
            var len = vert.sub( mouse ).lengthSq();
            if( len < (hr * hr) )
            {
                console.log( "level0 intersect: ", i );
		        this.billboardGeometry.colors[ i ].setHex( PX.kLocationMouseOverColor );
                return loc.index;
            }
            else
            {
		        this.billboardGeometry.colors[ i ].setHex( PX.kLocationColor );
            }
        }

        return -1;
    }

    , OnMouseUp: function( mouse3d, camera, object )
    {
        if( this.zoomLevel === 0 )
        {
            var scope = this;

            var index = this.IntersectsLevel0( mouse3d );
            if( index < 0 )
            {
                //console.log( "no intersection", index );
                return;
            }

            scope.doAvoidance = true;

            this.TweenLevel0( PX.EPSILON, Params.AnimTime * 0.2 * 1000.0, Params.AnimTime * 0.8 * 1000.0, function()
            {
                scope.doAvoidance = false;
            });


            var loc = this.markers[ index ];

            Params.CameraDistance = PX.Lerp( PX.kCameraMinDistance, PX.kCameraMaxDistance, 0.0 );

            var cameraSourcePoint = camera.position.clone();
            var cameraTargetPoint = loc.position.clone().normalize().multiplyScalar( Params.CameraDistance );
            var cameraLookAtSourcePoint = camera.getWorldDirection().clone();
            var cameraLookAtTargetPoint = PX.ZeroVector.clone();

            // POSITION
            var tween = new TWEEN.Tween( cameraSourcePoint ).to( cameraTargetPoint, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            tween.onStart(function()
            {
            });
            tween.onUpdate(function()
            {
                camera.position.x = cameraSourcePoint.x;
                camera.position.y = cameraSourcePoint.y;
                camera.position.z = cameraSourcePoint.z;
            });
            tween.onComplete(function()
            {
                scope.SetZoomLevel( 1 );
                scope.doPopulation = true;
                scope.doAvoidance = true;

                scope.TweenLevel1( 1.0, Params.AnimTime * 1000.0, 0 * 1000.0, function()
                {
                    scope.doAvoidance = false;
                });
            });

            // LOOKAT
            tween = new TWEEN.Tween( cameraLookAtSourcePoint ).to( cameraLookAtTargetPoint, Params.AnimTime * 1000.0 );
            tween.easing( TWEEN.Easing.Quadratic.InOut );
            tween.start();
            tween.onUpdate(function()
            {
                camera.lookAt( cameraLookAtSourcePoint );
            });
        }
        else
        {
        }
    }

    , SetZoomLevel: function( level )
    {
        this.zoomLevel = level;
        if( level === 1 )
        {
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
        }
    }


    , PopulateMarkers: function( markerCluster, locations, camera )
    {
        this.markersCount = 0;

        var clusterCount = markerCluster.getTotalClusters();
        console.log( "clusterCount:", clusterCount );

        if( clusterCount > 0 )
        {
            this.doPopulation = false;

            var distToCamera = new THREE.Vector3();

            //if( zoomLevel < PX.kZoomMaxLevel )
            {
                for( var i=0; i<locations.length; ++i )
                {
		            this.billboardGeometry.vertices[i].set( 10000, 0, 0 );
                }

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

                    // Use distance to camera for constant size
                    distToCamera.subVectors( camera.position, this.markers[i].position );
                    var locationScale = distToCamera.length();
                    locationScale = ( locationScale / PX.kCameraMaxDistance );

                    var target = new THREE.Vector3( locationScale, locationScale, locationScale );
                    this.markers[i].tween = new TWEEN.Tween( this.markers[i].scale ).to( target, 2000.0/clusterCount );
                    this.markers[i].tween.easing( TWEEN.Easing.Sinusoidal.InOut );
                    this.markers[i].tween.delay( 3000 + ((i * 2000)/clusterCount) );
                    this.markers[i].tween.start();
                    if( i === clusterCount-1 )
                    {
                        this.markers[i].tween.onComplete( function()
                        {
                            locationsIntroAnimDone = true;
                        });
                    }
                }

                //
                this.billboardGeometry.verticesNeedUpdate = true;
            }
            /*else
            {
                for( var i=0; i<clusterCount; ++i )
                {
                    var c = markerCluster.clusters_[i];
                    var clusterCenter = c.getCenter();

                    for( var k=0; k<c.markers_.length; ++k )
                    {
                        var markerPos = c.markers_[k].getPosition();
                        locationMarkers[ this.markersCount ].text = locations[ this.markersCount ].name;
                        locationMarkers[ this.markersCount ].latlon.set( markerPos.lat(), markerPos.lng() );
                        locationMarkers[ this.markersCount ].position.copy( PX.Utils.FromLatLon( markerPos.lat(), markerPos.lng(), PX.kEarthScale, PX.kMarkerOffsetFromEarthSurface ) );
                        locationMarkers[i].markerCount = 1;
                        this.markersCount++;

                        //console.log( locationMarkers[idx].latlon, locationMarkers[idx].text );
                    }
                }
            }*/

            //doLocationsGather = false;
        }
    }


    , MarkerAvoidance: function( markerCluster, frameTime )
    {
        if( this.doPopulation || this.doAvoidance === false )
        {
            return;
        }

        // Avoid touching
        //
        var MinDistancesPerLevel = [ 
            230,
            110
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
                var latLonDir = new THREE.Vector2( p1.lat(), p1.lng() ).sub( new THREE.Vector2( p2.lat(), p2.lng() ) ).normalize();

                var dist = locj.position.clone().sub( loci.position );
                var dir = dist.clone().normalize();

                var distInKm = markerCluster.distanceBetweenPoints_( p1, p2 );
                //var minDistance = Params.Dummy;
                //var minDistance = MinDistancesPerLevel[ 0 ];
                var minDistance = MinDistancesPerLevel[ this.zoomLevel ];
                //var minDistance = MinDistancesPerLevel[ PX.Clamp( this.zoomLevel, 0, PX.kZoomMaxLevel ) ];
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
    }
};
