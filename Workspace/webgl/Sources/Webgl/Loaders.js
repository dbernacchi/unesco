/* global THREE: true } */

var PX = PX || {};

var g_TextureLoader = new THREE.TextureLoader();


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
