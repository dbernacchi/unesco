/* global THREE: true } */

var PX = PX || {};

var g_TextureLoader = new THREE.TextureLoader();
var gltfLoader = null;


function LoadJsonData( name, url )
{
    var defer = $.Deferred();
    console.log( "+--+  Load JSON:\t\t" + name, url );

    $.ajax( { scriptCharset: "utf-8" , contentType: "charset=unicode"} );
    $.ajax({
        url: url,
        dataType: "text",
        success: function(data) 
        {
            //console.log( data );
            var jsonData = $.parseJSON( data );
            //console.log( jsonData );
            PX.AssetsDatabase[ name ] = jsonData;
            console.log( "+--+  Loaded JSON:\t\t" + name, url );
            defer.resolve();
        }
    });

/*    $.ajax( { scriptCharset: "utf-8" , dataType: "json", contentType: "application/json; charset=unicode"} );
    $.getJSON( url, function( json )
    //$.getJSON( url+"?"+new Date().getTime(), function( json )
    {
        PX.AssetsDatabase[ name ] = json;
        console.log( "+--+ Loaded JSON:\t\t" + name );
        defer.resolve();
    } );*/

    return defer; //.promise();
}


function LoadShaderData( name, url )
{
    var defer = $.Deferred();
    console.log( "+--+  Load Shader:\t\t" + name, url );
    $.ajax({
        url : url,
        dataType: "text",
        scriptCharset: "utf-8",
        contentType: "application/text; charset=unicode",
        success : function (data) 
        {
            PX.AssetsDatabase[ name ] = data;
            console.log( "+--+  Loaded Shader:\t\t" + name, url );
            defer.resolve();
        }
    });
/*    $.ajax( { scriptCharset: "utf-8" , dataType: "text", contentType: "application/text; charset=unicode"} );
    $.get( url, function(data)
    {
        PX.AssetsDatabase[ name ] = data;
        console.log( "+--+  Loaded Shader:\t\t" + name, url );
        defer.resolve();
    } );
**/
    return defer;
} 


function LoadText( name, url )
{
    var defer = $.Deferred();
    console.log( "+--+  Load Text:\t\t" + name, url );
    $.ajax({
        url : url,
        dataType: "text",
        scriptCharset: "utf-8",
        contentType: "application/text; charset=unicode",
        success : function (data) 
        {
            PX.AssetsDatabase[ name ] = data;
            console.log( "+--+  Loaded Text:\t\t" + name, url );
            defer.resolve();
        }
    });
}


function LoadTexture( name, url )
{
    var defer = $.Deferred();

    console.log( "+--+  Load Texture:\t\t" + name, url );
    g_TextureLoader.load( url, function( tex )
    {
        PX.AssetsDatabase[name] = tex;
        console.log("+--+  Loaded Texture:\t\t" + name, url);
        defer.resolve();
    } );
    return defer; //.promise();
}


/*function InitLoaders()
{
	gltfLoader = new THREE.glTFLoader();
	binLoader = new THREE.BinaryLoader();
}*/

/**
function LoadScene( url, scene )
{
    console.log( "+--  Load Scene:\t", url );

	var loadStartTime = Date.now();
	gltfLoader.load( url, function(data) 
    {
	    var root = data.scene;
     
	    scene.add( root );

        ComputeSceneBounds( scene );

        ComputeSceneBoundingSphere( scene );

    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--  Loaded Scene:\t  loadtime: ", loadTime );

    } );
}
***/

function LoadBINScene( path, filename, scene, onProgressCB, onCompleteCB )
{
    var url = path + filename;
    console.log( "+--+  Load BIN Scene:\t", url );

    var binLoader = new THREE.BinaryLoader();
    binLoader.texturePath = path;
    binLoader.binaryPath = path;

	var loadStartTime = Date.now();
	binLoader.load( url
    , function( geometry, materials ) 
    {

        var material = materials[0];
	    console.log( material );
	    console.log( material.map );

        material.color.setHex( 0xffffff );
        material.emissive.setHex( 0x000000 );
        material.transparent = false;
        material.opacity = 1.0;
        material.side = THREE.DoubleSide;

        var objMesh = new THREE.Mesh( geometry, material ); 
        scene.add( objMesh );

        ComputeSceneBounds( scene );

        //ComputeSceneBoundingSphere( scene, sceneCenter, distToCamera );

    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--+  Loaded BIN Scene:\t  Load time: ", loadTime );

        if( onCompleteCB ) onCompleteCB();
    } 
    , function(result) 
    {
        var percentage = ( result.loaded / result.total );
        if( result.total <= 0.0 ) percentage = 0.0;
        if( onProgressCB ) onProgressCB( percentage );
    }
    );
}


function LoadOBJScene( url, scene, onProgressCB, onCompleteCB )
{
    console.log( "+--+  Load OBJ Scene:\t", url );

    var binLoader = new THREE.OBJLoader();

	var loadStartTime = Date.now();
	binLoader.load( url
    , function( object ) 
    {
        scene.add( object );

        ComputeSceneBounds( scene );

        //ComputeSceneBoundingSphere( scene, sceneCenter, distToCamera );

    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--+  Loaded OBJ Scene:\t  Load time: ", loadTime );

        if( onCompleteCB ) onCompleteCB();
    } 
    , function(result) 
    {
        var percentage = ( result.loaded / result.total );
        if( result.total <= 0.0 ) percentage = 0.0;
        if( onProgressCB ) onProgressCB( percentage );
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


function ComputeSceneBoundingSphere( scene )
{
    var sceneMin = new THREE.Vector3( 99999, 99999, 99999 );
    var sceneMax = new THREE.Vector3( -99999, -99999, -99999 );
    //var sceneCenter = new THREE.Vector3();
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

    var sceneCenter = new THREE.Vector3();
    sceneCenter.addVectors( sceneMin, sceneMax );
    //radius = sceneCenter.length();
    sceneCenter = sceneCenter.divideScalar( 2.0 );
    //console.log( sceneCenter, sceneMin, sceneMax, radius );

    //var len = Math.max( sceneMin.x, sceneMax.x );
    var minLength = sceneMin.length();
    var maxLength = sceneMax.length();
    var len = Math.max( minLength, maxLength );

    // Reposition camera based on scene bounds
    //
    var distToCamera = ( len * 1.0 ) / ( Math.tan( PX.ToRadians( PX.kCameraFovY ) * 0.5 ) );

    return new THREE.Vector4( sceneCenter.x, sceneCenter.y, sceneCenter.z, distToCamera );
}
