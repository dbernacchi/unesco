


/////////////////////////////////////////////////////////////////////////////////////
// Representation of a location in memory (read from json)

var Location = function()
{ 
    this.id = -1;
    this.name = null;       // Location name
    this.latlon = null;     // Lat/long
    this.position = null;   // 3D spherical position
    this.modelCount = 0;
    this.types = [ 0, 0, 0 ];        // Array of types. 0: Destroyed, 1: Reconstructed, 2: Under Construction. Each element has the count per type
};
Location.prototype =
{
    constructor: Location
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
        location.position = PX.Utils.FromLatLon( location.latlon.x, location.latlon.y, PX.kEarthScale, PX.kLocationMarkerScale );
        //location.position = PX.Utils.FromLatLon( location.latlon.x, location.latlon.y, PX.kEarthScale, PX.kLocationMarkerScale * PX.kLocationMarkerZScale * 0.5 );
        location.modelCount = 0;

        locationsDB.push( location );
        locationsDBMap.set( location.id, location );
    }
}


function PopulateLocationsWithModelInfo( reconstructions )
{
    for( var i=0; i<reconstructions.length; ++i )
    {
        var locId = parseInt( reconstructions[i]["location_id"] );
        var modelId = parseInt( reconstructions[i]["id"] );
        var status = reconstructions[i]["status"];
        
        var loc = locationsDBMap.get( locId );
        if( loc )
        {
            loc.modelCount++;

            if( status !== undefined )
            {
                var res = status.toLowerCase();
                //console.log( i, res );
           
                if( res === "destroyed" )
                    loc.types[0]++;
                else if( res === "under reconstruction" )
                    loc.types[1]++;
                else if( res === "reconstructed" )
                    loc.types[2]++;
            }
            else
            {
                console.log( "****  status is undefined. locId: ", locId, "  model id: ", modelId );
            }
        }
        else
        {
            console.log( i, "****  Couldn't find location with id: ", locId, "  model id: ", modelId );
            console.log(reconstructions[i]);
        }
    }

    // @DEBUG:
    /*for( var i=0; i<locationsDB.length; ++i )
    {
        var loc = locationsDB[i];
        console.log( "+--+  ParseLocationData()  location: ", loc.id, "  modelCount: ", loc.modelCount, "  types: ", loc.types[0], loc.types[1], loc.types[2] );
    }*/
}