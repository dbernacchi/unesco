
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

    if( checks.iphone || checks.ipod || checks.ipad || checks.android || checks.androidTablet || checks.mobile )
    {
        PX.IsMobile = true;

        // change defauls for mobile
        PX.kEarthDetailX = 32;
        PX.kEarthDetailY = 22;
        PX.kLocationMarkerDetail = 10;
    }
    else
    {
        PX.IsMobile = false;
    }
    //PX.IsMobile = true;

    console.log( "PX.IsMobile: ", PX.IsMobile );


    // Start WebGL
    //
    CreateRenderer();
    LoadData();
});
