
PX.Utils = 
{

    ConvertPosToLatLon: function( x, y, z, radius )
    {
        var lat = (Math.acos(y / radius)) * 180.0 / Math.PI;
        var lon = ((360.0 + (Math.atan2(x , z)) * 180.0 / Math.PI) % 360.0);
        return new THREE.Vector2( lat, lon );
    }

    // @NOTE: For this to work we need coordinates as such:
    // North must be position latitude
    // South must be negative latitude
    // West must be positive longitude
    // East must be negative longitude
    , FromLatLon: function( lat, lon, radius, heightOffset )
    {
        var pos = new THREE.Vector3();
        var latRad = PX.ToRadians( 90.0 - lat );
        var lonRad = PX.ToRadians( -lon );
        pos.x = (radius+heightOffset) * Math.sin(latRad) * Math.cos(lonRad);
        pos.y = (radius+heightOffset) * Math.cos(latRad);
        pos.z = (radius+heightOffset) * Math.sin(latRad) * Math.sin(lonRad);
        return pos;
    }

    , FromLatLon2: function( lat, lon, radius, heightOffset )
    {
        var pos = new THREE.Vector3();
        var latRad = PX.ToRadians( lat );
        var lonRad = PX.ToRadians( lon );
        // http://es.mathworks.com/help/matlab/ref/sph2cart.html?requestedDomain=www.mathworks.com
        pos.x = (radius+heightOffset) * Math.cos(latRad) * Math.cos(lonRad);
        pos.y = (radius+heightOffset) * Math.cos(latRad);
        pos.z = (radius+heightOffset) * Math.sin(latRad) * Math.sin(lonRad);

        /*pos.x = (radius+height) * Math.sin(latRad) * Math.cos(lonRad);
        pos.y = (radius+height) * Math.cos(latRad);
        pos.z = (radius+height) * Math.sin(latRad) * Math.sin(lonRad);*/
        return pos;
    }

    , ProjectPoint: function( pos, camera, width, height) 
    {
        var vector = pos.project( camera );
        vector.x = ((vector.x + 1.0) / 2.0) * width;
        vector.y = (-(vector.y - 1.0) / 2.0) * height;
        return vector;
    }
}