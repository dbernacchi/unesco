/* global THREE: true } */
var textures_to_load = 0;

var texture_load_checks = 0;

setInterval(function(){ 

	if(texture_load_checks > 4 && textures_to_load > 0){
		location.reload(true);	
	}
	
	texture_load_checks++;

}, 5000);

var PX = PX || {};

var g_TextureLoader = new THREE.TextureLoader();
//var gltfLoader = null;


function LoadJsonData( name, url )
{
    var defer = $.Deferred();
    console.log( "+--+  Load JSON:\t\t" + name, url );

/*    $.ajax( { scriptCharset: "utf-8" , contentType: "charset=unicode"} );
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
    });*/

    $.ajax( { scriptCharset: "utf-8" , dataType: "json", contentType: "application/json; charset=unicode"} );
    //$.getJSON( url, function( json )
    $.getJSON( url+"?"+new Date().getTime(), function( json )
    {
        PX.AssetsDatabase[ name ] = json;
        console.log( "+--+ Loaded JSON:\t\t" + name );
        defer.resolve();
    } );

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

    return defer;
}


function LoadTexture( name, url )
{
    var defer = $.Deferred();

    console.log( "+--+  Load Texture:\t\t" + name, url );

    textures_to_load++;
    
    console.log("+--+  Textures To Load:\t\t" + textures_to_load);
    
    
    var customTexture = new THREE.Texture();

    var customImage = new Image();
    customImage.src = url;
    customImage.onload = function()
    {
        console.log( "+--+  Loaded Texture:\t\t" + name, url );
        
	    textures_to_load--;
	    
	    console.log("+--+  Textures Left To Load:\t\t" + textures_to_load);
	    
        customTexture.image = customImage;
        customTexture.wrapS = THREE.ClampToEdgeWrapping;
        customTexture.wrapT = THREE.ClampToEdgeWrapping;
        customTexture.magFilter = THREE.LinearFilter;
        customTexture.minFilter = THREE.LinearMipMapLinearFilter;
        customTexture.needsUpdate = true;
        PX.AssetsDatabase[ name ] = customTexture;
        defer.resolve();
    }

/*
    g_TextureLoader.load( url
    , function( tex )
    {
        console.log( "+--+  Loaded Texture:\t\t" + name, url );
        PX.AssetsDatabase[name] = tex;
        defer.resolve();

        tex = null;
    }
    , function()
    {
        // progress
    }
    , function()
    {
        // Error
        console.log( "**** Failed to load texture" );
        defer.resolve();
    } );*/

    return defer.promise();
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

/***
function LoadBINScene( path, filename, scene, onProgressCB, onCompleteCB )
{
    var url = path + filename + ".js";
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
***/

function LoadOBJScene( path, filename, scene, shaderMaterials, onProgressCB, onCompleteCB )
{
    //var url = path + filename;
    console.log( "+--+  Load OBJ Scene:\t", path + filename );


    var mtlUrl = filename + ".mtl"; // + "?" + new Date().getTime();
    var objUrl = filename + ".obj"; // + "?" + new Date().getTime();


	var onProgress = function ( xhr ) 
    {
		if ( xhr.lengthComputable ) 
        {
            var percentage = ( xhr.loaded / xhr.total );
            if( xhr.total <= 0.0 ) percentage = 0.0;
            if( onProgressCB ) onProgressCB( percentage );
		}
	};

	var onError = function ( xhr ) 
    { 
        console.log( "**** OBJ onError: ", xhr );
    };

	var loadStartTime = Date.now();

    var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl( path );
	mtlLoader.setPath( path );
	mtlLoader.load( mtlUrl, function( materials ) 
    {
        materials.preload();
/*
        var matArray = materials.getAsArray();

        var ourMat = null;

        console.log( matArray, matArray.length );
        for ( var i=0; i<matArray.length; ++i )
        {
            var mat = matArray[i];
            if( mat.bumpMap )
            {
                mat.normalMap = mat.bumpMap; //.clone();
                console.log( "mat has normalmap" );
                console.log( mat );
            }
            ourMat = mat;
        }
        */
        var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
	    objLoader.setPath( path );
	    var objRequest = objLoader.load( objUrl
        , function( data ) 
        {
            scene.add( data );

            // Apply some defaults we want. Just is case 3d models come with bad properties
            data.traverse( function( object )
            {
                if( object instanceof THREE.Mesh )
                {
/**                    var modelUniforms =
                    {
                        DiffuseMap: { type: "t", value: null }
                        , NormalMap: { type: "t", value: null }
                        //, World: { type: "m4", value: new THREE.Matrix4() }
                        , ViewPosition: { type: "v3", value: new THREE.Vector3( 0, 0, 1 ) }
                        , LightDirection: { type: "v3", value: new THREE.Vector3( 0.5, 1, 1 ) }
                        , Params0: { type: "v4", value: new THREE.Vector4( Params.ModelAmbientIntensity, Params.ModelDiffuseIntensity, Params.ModelSpecularIntensity, 1.0 ) }
                        //, Params1: { type: "v4", value: new THREE.Vector4( 1, 1, 1, 1 ) }
                        , Params2: { type: "v4", value: new THREE.Vector4( Params.ModelRoughness, 2.0, 0.4, 1.0 ) }
                        //, Time: { type: "f", value: 0.0 }
                    }

                    var fragShader = "";

                    if( object.material.normalMap )
                    {
                        fragShader += "#define ENABLE_NORMAL_MAP"
                    }
                    else
                    {
                        console.log( "****  No normal maps" );
                    }

                    fragShader += PX.AssetsDatabase["ModelPixelShader"];

                    var material = new THREE.ShaderMaterial(
                    {
                        uniforms: modelUniforms
                        , vertexShader: PX.AssetsDatabase["ModelVertexShader"]
                        , fragmentShader: fragShader
                        //, vertexColors: THREE.VertexColors
                    } );
                    material.extensions.derivatives = true;
                    material.side = THREE.DoubleSide;
                    material.depthTest = true;
                    material.depthWrite = true;
                    material.transparent = false;

                    material.map = object.material.map;
                    material.normalMap = object.material.normalMap;
                    modelUniforms.DiffuseMap.value = object.material.map;
                    if( object.material.normalMap )
                    {
                        modelUniforms.NormalMap.value = object.material.normalMap;
                    }

                    object.material = material;
***/

/****
                    var idx = 0;
                    if( object.material.map && object.material.normalMap )
                    {
                        console.log( "object with diffuse + normals" );
                        object.material = shaderMaterials[0]; //.clone();

                        object.material.uniforms.DiffuseMap.value = object.material.map;
                        object.material.uniforms.NormalMap.value = object.material.normalMap;

                        idx = 0;
                    }
                    else if( object.material.map && !object.material.normalMap )
                    {
                        console.log( "object with diffuse only" );

                        object.material = shaderMaterials[1]; //.clone();

                        object.material.uniforms.DiffuseMap.value = object.material.map;
                        //object.material.uniforms.NormalMap.value = null;

                        idx = 1;
                    }
                    else
                    {
                        console.log( "object with no maps" );

                        object.material = shaderMaterials[2]; //.clone();

                        //object.material.uniforms.DiffuseMap.value = null;
                        //object.material.uniforms.NormalMap.value = null;

                        idx = 2;
                    }
***/

                    // Diff Intensity
                    /*if( object.material.color )
                    {
                        console.log( "diffuse intensity: ", object.material.uniforms.Params0.y, object.material.color.r );
                        object.material.uniforms.Params0.y *= object.material.color.r;
                    }
                    // Spec Intensity
                    object.material.uniforms.Params0.z = object.material.specular.r;
                    console.log( "specular intensity: ", object.material.uniforms.Params0.z );*/


                    //
                    if( object.material.map )
                        object.material.color = new THREE.Color( 0xffffff );
                    object.material.side = THREE.DoubleSide;
                    object.material.transparent = false;
                    object.material.opacity = 1.0;
                    object.material.shading = THREE.SmoothShading;

                    object.frustumCulled = false;

                    //console.log( "LoadOBJScene()  object.material: " );
                    //console.log( object.material );
                }
            });

            ComputeSceneBounds( scene );

            //ComputeSceneBoundingSphere( scene, sceneCenter, distToCamera );

    	    var loadEndTime = Date.now();
	        var loadTime = (loadEndTime - loadStartTime) / 1000;
            console.log( "+--+  Loaded OBJ Scene:\t  Load time: ", loadTime );

            if( onCompleteCB ) onCompleteCB();

            mtlLoader = null;
            objLoader = null;
        } 
        , onProgress, onError );
        /*, function(result) 
        {
            var percentage = ( result.loaded / result.total );
            if( result.total <= 0.0 ) percentage = 0.0;
            if( onProgressCB ) onProgressCB( percentage );
        }
        , function()
        {
            console.log( "**** onError: Failed to load OBJ" );
        });*/

        //console.log( "+--+  OBJ Loader Request: ", objRequest );
    }
    , function( xhr ) 
    {
    }
    , function( xhr )
    {
        console.log( "**** onError: Failed to load MTL" );
    });
}

/**
function LoadSceneData( path, filename, scene, onProgressCB, onCompleteCB )
{
    var url = path + filename;
    console.log( "+--+  Load SCENE Scene:\t", url );

    //var defer = $.Deferred();

	var loadStartTime = Date.now();

    var loader = new THREE.SceneLoader();
    //loader.callbackSync = callbackSync;
    //loader.callbackProgress = onProgressCB;
    loader.load( url, function( result )
    //loader.load( url+"?"+new Date().getTime(), function ( result )
    {
        // Load textures from scene
        var scene_ = result.scene;
        //scene_.autoUpdate = false;
        scene_.traverse( function( object )
        {
            if( object instanceof THREE.Mesh )
            {
                console.log( object );

                //scene.add( object );
            }

        } );

        scene.add( scene_ );

        if( scene )
            ComputeSceneBounds( scene );

    	var loadEndTime = Date.now();
	    var loadTime = (loadEndTime - loadStartTime) / 1000;
        console.log( "+--+  Loaded OBJ Scene:\t  Load time: ", loadTime );

        if( onCompleteCB ) onCompleteCB();
    },
    function( result )
    {
        var percentage = ( result.loaded / result.total );
        if( result.total <= 0.0 ) percentage = 0.0;
        if( onProgressCB ) onProgressCB( percentage );

        var per = result.loaded; // / res.total;
        console.log( "SCENE progress: ", per );
    }
    );
}
**/

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
    var distToCamera = len / ( Math.tan( PX.ToRadians( PX.kCameraFovY ) * 0.5 ) );

    return new THREE.Vector4( sceneCenter.x, sceneCenter.y, sceneCenter.z, distToCamera );
}
