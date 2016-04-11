
/////////////////////////////////////////////////////////////////////////////////////

UG.LocationMarker = function()
{ 
    this.GUID = "";
    this.text = "";
    this.latlon = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.markerCount = 0;
    this.clicks = 0; // Number of clicks on this marker. 1: align camera, 2: open right menu, 3: in menu
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
    this.textRenderer = null;
	this.markersCount = 0;

	this.markerCluster = null;
    this.doPopulation = true;
};

UG.LocationMarkers.prototype =
{
    constructor: UG.LocationMarkers

    , Init: function( locations, markerCluster, bmFontDescriptor, scene )
    {
    	this.markerCluster = markerCluster;

        //
        this.locationsGroup = new THREE.Object3D();
	    this.locationsGroup.position.set( 0, 0, 0 );

        //
        this.textRenderer = new PX.TextRenderer();
        this.textRenderer.Init( bmFontDescriptor, 2048, PX.AssetsDatabase["TextAtlasTex"], scene );
        this.locationsGroup.add( this.textRenderer.mesh );

        //
	    for( var i=0; i<locations.length; ++i )
	    {
	        var mat = new THREE.MeshLambertMaterial( { color: PX.kLocationColor, emissive: 0x003333 } );
	        //var mat = new THREE.MeshBasicMaterial( { color: PX.kLocationColor } );
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

	        //
	        this.meshes.push( mesh );

	        //
	        var lm = new UG.LocationMarker();
	        lm.text = "";
	        lm.position.copy( locations[i].position );
            lm.clicks = 0;
	        this.markers.push( lm );

	        this.locationsGroup.add( mesh );
	    }
	    scene.add( this.locationsGroup );

        //
        this.locationsGroup.scale.set( PX.EPSILON, PX.EPSILON, PX.EPSILON );
    }


    , Render: function( )
	{

	}


    , Update: function( time, frameTime, camera )
    {
        this.textRenderer.Begin();

        //
        for( var i=0; i<this.markersCount; ++i )
        {
            // restore original color
            if( this.markers[ i ].clicks === 0 )
                this.meshes[ i ].material.color.set( PX.kLocationColor );

            // Default all locations to far far away
            this.meshes[i].position.set( 10000, 0, 0 );
	   	}

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
            distToCamera.subVectors( camera.position, loc.position );
            var locationScale = distToCamera.length();
            locationScale = ( locationScale / PX.kCameraMaxDistance );

            //console.log( i, p.x, p.y, p.z );
            //billboardGeometry.vertices[i].set( p.x, p.y, p.z );
            this.meshes[i].position.copy( loc.position );
            this.meshes[i].scale.set( locationScale, locationScale, locationScale * PX.kLocationMarkerZScale );
            //this.meshes[i].scale.set( locationScale, locationScale, locationScale * ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 ) );
            this.meshes[i].lookAt( PX.ZeroVector );

            // Text Info
            //
            var ttt = (1.0) * PX.kLocationMarkerZScale;
            //var ttt = ( loc.markerCount > 0 ? loc.markerCount * PX.kLocationMarkerZScale : 1.0 );

            var smallOffset = 0.001;
            var p = PX.Utils.FromLatLon( loc.latlon.x, loc.latlon.y, PX.kEarthScale, smallOffset + (ttt * locationScale * PX.kLocationMarkerScale) );

            matTrans = matTrans.makeTranslation( p.x, p.y, p.z );
            //matRot.makeRotationFromQuaternion( locationMeshes[i].quaternion );
            matRot.makeRotationFromEuler( this.meshes[i].rotation );
            matScale.makeScale( locationScale, locationScale, locationScale );
            matRes.multiplyMatrices( matTrans, matRot );
            matRes.multiplyMatrices( matRes, matScale );
            //matRes = locationMeshes[i].matrixWorld;

            this.textRenderer.AppendText( loc.text, PX.ZeroVector, PX.kLocationTextSize, matRes, true );
	    }

        // Text End
        this.textRenderer.End();
    }


    , Intersects: function( raycaster )
    {
        // Intersection test per mesh
        for( var i=0; i<this.markersCount; ++i )
        {
            var intersects = raycaster.intersectObject( this.meshes[ i ], false );
            if( intersects.length > 0 )
            {
                intersects[ 0 ].object.material.color.set( PX.kLocationMouseOverColor );
                //this.markers[ i ].clicks++;
                return i;
                //break;
            }
        }

        return null;
    }


    , PopulateMarkers: function( markerCluster, locations )
    {
        var clusterCount = markerCluster.getTotalClusters();
        //console.log( "clusterCount:", clusterCount );

        if( clusterCount > 0 )
        {
            this.markersCount = clusterCount;

            this.doPopulation = false;

            //if( zoomLevel < PX.kZoomMaxLevel )
            {
                for( var i=0; i<clusterCount; ++i )
                {
                    var c = markerCluster.clusters_[i];
                    var clusterCenter = c.getCenter();

                    //console.log( i, clusterCenter.lat(), clusterCenter.lng() );

                    this.markers[i].text = String( c.markers_.length );
                    this.markers[i].latlon.set( clusterCenter.lat(), clusterCenter.lng() );
                    this.markers[i].position.copy( PX.Utils.FromLatLon( clusterCenter.lat(), clusterCenter.lng(), PX.kEarthScale, PX.kMarkerOffsetFromEarthSurface ) );
                    this.markers[i].markerCount = c.markers_.length;
                    //this.markersCount++;
                }
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
    }
};
