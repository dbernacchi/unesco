


/////////////////////////////////////////////////////////////////////////////////////
// Representation of a location in memory (read from json)

var Location = function()
{ 
    this.GUID = "";			// GUID
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






// Loaders
//

function ParseLocationData( locationsJson )
{
    // Parse Location Json
    for( var i=0; i<locationsJson.length; ++i )
    {
        var location = new Location();

        location.name = locationsJson[i]["marker_title"];
        location.id = locationsJson[i]["id"];
        location.latlon = new THREE.Vector2( locationsJson[i]["lat"], locationsJson[i]["lng"] );
        location.position = PX.Utils.FromLatLon( location.latlon.x, location.latlon.y, PX.kEarthScale, PX.kLocationMarkerScale * PX.kLocationMarkerZScale * 0.5 );

        // @TEMP:
        location.modelCount = parseInt( Math.random() * 3 );
        //console.log( "Location: this.modelCount: ", location.modelCount );

        locationsDB.push( location );
    }
}
