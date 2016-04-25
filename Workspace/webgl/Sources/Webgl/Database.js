


/////////////////////////////////////////////////////////////////////////////////////
// Representation of a location in memory (read from json)

var Location = function()
{ 
    this.id = -1;
    this.name = null;       // Location name
    this.latlon = null;     // Lat/long
    this.position = null;   // 3D spherical position
    this.modelCount = 0;
};
Location.prototype =
{
    constructor: Location
}





function FindLocationById( id )
{
    for( var i=0; i<locationsDB.length; ++i )
    {
        var loc = locationsDB[ i ];
        if( loc.id === id )
            return loc;
    }

    return null;
}


// Loaders
//

function ParseLocationData( locationsJson )
{
    // Parse Location Json
    for( var i=0; i<locationsJson.length; ++i )
    {
        var location = new Location();

        location.name = locationsJson[i]["marker_title"];
        location.id = parseInt( locationsJson[i]["id"] );
        location.latlon = new THREE.Vector2( locationsJson[i]["lat"], locationsJson[i]["lng"] );
        location.position = PX.Utils.FromLatLon( location.latlon.x, location.latlon.y, PX.kEarthScale, PX.kLocationMarkerScale * PX.kLocationMarkerZScale * 0.5 );
        location.modelCount = 0;

        locationsDB.push( location );
        locationsDBMap.set( location.id, location );
    }


    // Connect models with locations
    //
/*    var reconstructions = PX.AssetsDatabase["ReconstructionsJson"];
    for( var i=0; i<reconstructions.length; ++i )
    {
        var locId = parseInt( reconstructions[i]["location_id"] );
        var modelId = parseInt( reconstructions[i]["id"] );
        //var loc = FindLocationById( locId );
        var loc = locationsDBMap.get( locId );
        //console.log( loc );
        if( loc )
        {
            loc.modelCount++;
        }
        else
        {
            console.log( i, "****  Couldn't find location with id: ", locId, "  model id: ", modelId );
        }
    }

    // @DEBUG:
    for( var i=0; i<locationsDB.length; ++i )
    {
        var loc = locationsDB[i];
        console.log( "location: ", loc.id, "  modelCount: ", loc.modelCount );
    }*/
}
