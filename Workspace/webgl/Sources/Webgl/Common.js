
var UG = {};
var PX = {};



// Precision timer
//
var timeNow;
var startTime;
if (this.performance && performance.now) {
    timeNow = function () {
        return performance.now() * 0.001;
    };
}
else {
    timeNow = function () {
        return Date.now() * 0.001;
    };
}


// PX Commons stuff
//
PX =
{
    // Resources
    //

    AssetsDatabase: []

    // Constants
    //
    , EPSILON: 0.001

    , kEarthScale: 30.0
    , kEarthDetail: 50
    , kMarkerOffsetFromEarthSurface: 0.0
    , kLocationMarkerScale: 0.65
    , kLocationMarkerDetail: 16
    , kLocationMarkerZScale: 0.25
    , kMaxGridSize: 1
    , kLocationTextSize: 120.0
    , kLocationColor: 0x00ffff
    , kLocationMouseOverColor: 0xff00ff
    , kLocationMouseClickedColor: 0xff7f00

    , kCameraFovY: 36.0
    , kCameraNearPlane: 1.0
    , kCameraFarPlane: 1000.0
    , kCameraMinDistance: 75 //60.0
    , kCameraMaxDistance: 100.0
    , kGlobalTimeScale: 1.0

    , kZoomMaxLevel: 3.0

    , XAxis: new THREE.Vector3(1, 0, 0)
    , YAxis: new THREE.Vector3(0, 1, 0)
    , ZAxis: new THREE.Vector3(0, 0, 1)
    , XAxisNeg: new THREE.Vector3(-1, 0, 0)
    , YAxisNeg: new THREE.Vector3(0, -1, 0)
    , ZAxisNeg: new THREE.Vector3(0, 0, -1)    
    , ZeroVector: new THREE.Vector3(0, 0, 0)
    , IdentityQuat: new THREE.Quaternion()

    , RAD_TO_DEG: (180.0 / Math.PI)
    , DEG_TO_RAD: (Math.PI / 180.0)

    , ToDegrees: function( x )
    {
        return x * PX.RAD_TO_DEG;
    }

    , ToRadians: function( x )
    {
        return x * PX.DEG_TO_RAD;
    }

    , Lerp: function( a, b, t )
    {
        //return b*t + (a - t*a);
        return (a + t*(b - a) );
    }

    , Saturate: function( x )
    {
        if( x < 0.0 ) return 0.0;
        if( x > 1.0 ) return 1.0;
        return x;
    }

    , Clamp: function( x, a, b )
    {
        return Math.max( a, Math.min( x, b ) );
    }

    , ClampVector3: function( res, a, b )
    {
        res.x = PX.Clamp( res.x, a, b );
        res.y = PX.Clamp( res.y, a, b );
        res.z = PX.Clamp( res.z, a, b );
    }

    , LerpVector3: function( res, a, b, t )
    {
        res.x = PX.Lerp( a.x, b.x, t );
        res.y = PX.Lerp( a.y, b.y, t );
        res.z = PX.Lerp( a.z, b.z, t );
    }

    , TweenCubic: function( t )
    {
        return t*t*t;
    }

    , Smoothstep: function( edge0, edge1, x )
    {
        // Scale, bias and saturate x to 0..1 range
        x = PX.Saturate( (x - edge0) / (edge1 - edge0) );
        // Evaluate polynomial
        return x*x*(3 - 2*x);
    }

    , Pow2: function( x )
    {
        return ( x * x );
    }

    , Pow4: function( x )
    {
        var x2 = x * x;
        return ( x2 * x2 );
    }

};


var Params =
{
    Latitude: 38.7223
    , Longitude: 9.1393
    , MainScene: true
    , CameraDistance: 100.0
    , Art_CameraDistance: 100.0
    , AmbientIntensity: 0.00033
    , DiffuseIntensity: 2.0
    , SpecularIntensity: 0.063
    , NormalMapIntensity: 1.0
    , CloudsIntensity: 0.0 //0.1
    , CloudsShadowIntensity: 0.0 //0.3
    , CloudsShadowOffset: 0.0 //5.0
    , NightDayMixFactor: 0.5 // 0.25
    , EarthRoughness: 0.8
    , EarthRotationSpeed: 10.0
    , HalfLambertPower: 2.0
    , RimAngle: 0.4
    , DiffuseRimIntensity: 0.25
    , LightDirX: 0.15
    , LightDirY: 1.0
    , LightDirZ: 0.6
    , MapGridSize: PX.kMaxGridSize
    , Latitude: 0.0
    , Longitude: 0.0
    , ZoomLevel: 0.0
    , Intersects: 0
    , Dummy: 50.0
};
