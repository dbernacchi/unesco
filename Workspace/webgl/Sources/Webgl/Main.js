
//var progressBarElement = $("#progressBar");

$( document ).ready( function()
{
	var ua = navigator.userAgent;
	// parse data
	var checks = 
    {
		iphone: Boolean(ua.match(/iPhone/)),
		ipod: Boolean(ua.match(/iPod/)),
		ipad: Boolean(ua.match(/iPad/)),
		blackberry: Boolean(ua.match(/BlackBerry/)),
		playbook: Boolean(ua.match(/PlayBook/)),
		android: Boolean(ua.match(/Android/)),
		macOS: Boolean(ua.match(/Mac OS X/)),
		win: Boolean(ua.match(/Windows/)),
		mac: Boolean(ua.match(/Macintosh/)),	  
		wphone: Boolean(ua.match(/(Windows Phone OS|Windows CE|Windows Mobile)/)),
		mobile: Boolean(ua.match(/Mobile/)),
		/* http://mojosunite.com/tablet-user-agent-strings */
		androidTablet: Boolean( ua.match(/(GT-P1000|SGH-T849|SHW-M180S)/) ),
		tabletPc: Boolean(ua.match(/Tablet PC/)),
		palmDevice: Boolean(ua.match(/(PalmOS|PalmSource| Pre\/)/)),
		kindle: Boolean(ua.match(/(Kindle)/)),
		otherMobileHints: Boolean(ua.match(/(Opera Mini|IEMobile|SonyEricsson|smartphone)/)),
	};	

    //if( checks.mobile && ( checks.iphone || checks.ipod || checks.android || checks.ipad || checks.androidTablet ) )
    ////if( checks.mobile && (checks.iphone || checks.ipod || checks.android ) )
    {
        //console.log( "+--+  Phones" );

        PX.IsMobile = true;

        PX.kEnableGUI = false;

        Params.Level0MarkerRadius *= 1.3; //1.5;
        PX.kLocationFontSize = 7; //5;

        // change defauls for mobile
        PX.kEarthDetailX = 32;
        PX.kEarthDetailY = 22;

        PX.kLocationMarkerScale = 0.75;

        PX.kCameraMinDistance = 58.0;
        PX.kCameraMaxDistance = 100.0;
        PX.kCameraOneOverMinDistance = 1.0 / PX.kCameraMinDistance;
        PX.kCameraOneOverMaxDistance = 1.0 / PX.kCameraMaxDistance;

        PX.MinDistancesPerLevel[0] = 230;
        PX.MinDistancesPerLevel[1] = 110;

        //Params.CameraNearPlane = PX.kCameraNearPlane;
        Params.CameraDistance = PX.kCameraMaxDistance;
        Params.OutlineThickness = 150;
    }
    /*else if( checks.mobile && ( checks.ipad || checks.androidTablet ) )
    {
        console.log( "+--+  Tablets" );

        PX.IsMobile = true;

        PX.kEnableGUI = false;

        //Params.Level0MarkerRadius *= 1.5;
        //PX.kLocationFontSize = 5;

        // change defauls for mobile
        PX.kEarthDetailX = 32;
        PX.kEarthDetailY = 22;

        //PX.kLocationMarkerScale = 1.5;

        //PX.kCameraMinDistance = 58.0;
        //PX.kCameraMaxDistance = 100.0;
        //PX.kCameraOneOverMinDistance = 1.0 / PX.kCameraMinDistance;
        //PX.kCameraOneOverMaxDistance = 1.0 / PX.kCameraMaxDistance;

        //PX.MinDistancesPerLevel[0] = 230;
        //PX.MinDistancesPerLevel[1] = 180;

        //Params.CameraNearPlane = PX.kCameraNearPlane;
        //Params.CameraDistance = PX.kCameraMaxDistance;
        //Params.OutlineThickness = 100.0 * 3.0;
    }*/
    /*else
    {
        console.log( "+--+  Desktop" );

        PX.IsMobile = false;
    }*/

    console.log( "IsMobile: ", PX.IsMobile );


    // Start WebGL
    //
    CreateRenderer();
    LoadData();
});
