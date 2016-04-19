
var UG = {};
var PX = {};



// Precision timer
//
var timeNow;
if (this.performance && performance.now) 
{
    timeNow = function () 
    {
        return performance.now() * 0.001;
    };
}
else 
{
    timeNow = function () 
    {
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

    , ShaderPrecision: "mediump"
    //, ShaderPrecision: "highp"

    , StartLatLon: { x: 6.3377571, y: 43.139408 }

    , kTransparentCanvas: true
    , kEnableStats: false
    , kEnableGUI: true

    , kEarthScale: 30.0
    , kEarthDetailX: 32*4
    , kEarthDetailY: 22*4
    , kMarkerOffsetFromEarthSurface: 0.0
    , kLocationMarkerScale: 0.8
    , kLocationMarkerDetail: 16
    , kLocationMarkerZScale: 0.125
    , kAvoidanceSpeed: 0.031
    //, kAvoidanceSpeed: 6.0
    , kMaxGridSize: 4
    , kLocationTextSize: 120.0
    , kLocationColor: new THREE.Color( 0x171c5e )
    , kLocationColors: [ 0x171c5e, 0x2f4598, 0x6e89c4 ]
    , kLocationMouseOverColor: 0xf0fbff
    , kLocationMouseClickedColor: 0xf0fbff
    , kLocationColors2: [ new THREE.Color( 0x2f4598 ), new THREE.Color( 0x6e89c4 ), new THREE.Color( 0xc0e3fe ), new THREE.Color( 0xf0fbff ) ]

    , kCameraFovY: 36.0
    , kCameraNearPlane: 1.0
    , kCameraFarPlane: 200.0
    , kCameraMinDistance: 60
    , kCameraMaxDistance: 160.0
    , kCameraOneOverMinDistance: 1.0 / 60.0     // IMPORTANT!!
    , kCameraOneOverMaxDistance: 1.0 / 160.0    // If the above limits change, also change these
    //, kGlobalTimeScale: 1.0

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

	, Step: function( x, t )
	{	
		return ( x >= t ) ? 1.0 : 0.0;
	}        

    , Pulse: function( a, b, x )
    {
		return PX.Step( a, x ) - PX.Step( b, x );
    }

    , CubicPulse: function( c, w, x )
    {
        x = Math.abs(x - c);
        if( x > w ) return 0.0;
        x /= w;
        return 1.0 - x * x * ( 3.0 - 2.0 * x );
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

    , Pow3: function( x )
    {
        return ( x * x * x );
    }

    , Pow4: function( x )
    {
        var x2 = x * x;
        return ( x2 * x2 );
    }

};


var WebpageStates =
{
    FilterSwitches: []
};


var Params =
{
    Latitude: 38.7223
    , Longitude: 9.1393
    , WindowWidth: 0
    , WindowHeight: 0
    , MainScene: true
    , ShowMaps: false
    , ShowStats: false
    , EnableSunLight: false
    , EnableBloom: true
    , BloomOpacity: 0.5
    //, BloomOpacity: 1.0
    , CameraDistance: PX.kCameraMaxDistance
    , Level0MarkerRadius: 30.0
    , AnimTime: 1.0
    , Art_CameraDistance: 100.0
    , AmbientIntensity: 0.00033
    , DiffuseIntensity: 1.5 //1.125
    , SpecularIntensity: 0.07
    , NormalMapIntensity: 0.6
    , CloudsIntensity: 0.0 //0.1
    , CloudsShadowIntensity: 0.0 //0.3
    , CloudsShadowOffset: 0.0 //5.0
    , NightDayMixFactor: 0.5 // 0.25
    , EarthRoughness: 0.8
    , EarthRotationSpeed: 0.5
    , HalfLambertPower: 2.0
    , RimAngle: 0.4
    , DiffuseRimIntensity: 0.25
    , LightDirX: 0.5
    , LightDirY: 1.0
    , LightDirZ: -0.2
    , MapGridSize: PX.kMaxGridSize
    , Latitude: 0.0
    , Longitude: 0.0
    , ZoomLevel: 0.0
    , TiltShiftStrength: 0.0
    , TiltShiftMaxStrength: 5.0
    , TiltShiftPosition: 0.5
    , Intersects: 0
    , Dummy: 0.5

    , EarthShadowScaleX: 170.0 //PX.kEarthScale * 4.0
    , EarthShadowScaleY: 100.0 //PX.kEarthScale * 2.0
    , EarthShadowScaleZ: 0.0
    , EarthShadowPosX: 2.0
    , EarthShadowPosY: -40.0 //-PX.kEarthScale * 1.5
    , EarthShadowPosZ: 0.0

};
