

//
/*PX.Camera = function()
{
    this.orientation        = new THREE.Quaternion();
    this.position           = new THREE.Vector3();
    this.aspect             = 1.0;
};*/

PX.CameraTrackball = function()
{
    //this.camera             = new THREE.Camera();

    this.target             = new THREE.Vector3();
    this.right              = new THREE.Vector3();

    this.rotateAccel        = new THREE.Vector3();
    this.rotateVel          = new THREE.Vector3();
    this.damping            = 0.15;

    this.rotateFactor       = 1.0;

    // Convinience
    this.camPosition        = new THREE.Vector3();
    this.camLookAt          = new THREE.Vector3();
};


PX.CameraTrackball.prototype =
{
    constructor: PX.CameraTrackball

    , Init( camera )
    {
        //this.camera = camera;
        this.target = camera.getWorldDirection();
        this.right = this.target.clone();
        this.right.crossVectors( this.right, PX.YAxis );
        this.right.normalize();
    }


    // eventType: 1: mousedown, 2: mousedrag, 3: mouserelease
    // mouseButton: 1: mouseButtonLeft, 2: mouseButtonMiddle, 3: mouseButtonRight
    , HandleMouseEvents: function( eventType, mouseButton, deltaX, deltaY, frameTime )
    {
        // Rotate
        if( eventType == 1 && mouseButton == 1 )
        {
            this.Rotate( deltaX, deltaY, frameTime );
        }
    }

    , Reset( camera )
    {
        //this.camera = camera;
        this.target = camera.getWorldDirection();
        this.right = this.target.clone();
        this.right.crossVectors( this.right, PX.YAxis );
        this.right.normalize();
    }


    , Update( camera, frameTime )
    {
        this.rotateVel.add( this.rotateAccel );
		// Damping
        this.rotateVel.multiplyScalar( 1.0 - ( this.damping * frameTime * 60.0 ) );

		// Cancel Acceleration
        this.rotateAccel.x = this.rotateAccel.y = this.rotateAccel.z = 0.0;

        var radians = PX.ToRadians( -this.rotateVel.y * this.rotateFactor );
		var q = new THREE.Quaternion().setFromAxisAngle( this.right, radians );

        var mat = this.Transform( this.target, q );

        var pos = camera.position.clone().applyMatrix4( mat );

        var axis = new THREE.Vector3( 0, 1, 0 );

        radians = PX.ToRadians( -this.rotateVel.x * this.rotateFactor );
		q = new THREE.Quaternion().setFromAxisAngle( axis, radians );
        mat = this.Transform( this.target, q );
        pos.applyMatrix4( mat );

        this.right.applyQuaternion( q );

        var dir = this.target.clone().sub( pos );

        var dist = dir.length();
        dir.normalize();

        var up = this.right.clone();
        up.crossVectors( this.right, dir );
        up.normalize();

        var lookAt = dir.clone().multiplyScalar( dist ).add( pos );

        this.camPosition.copy( pos );
        this.camLookAt.copy( lookAt );

        camera.position.copy( pos );
        camera.lookAt( lookAt );
    }


    , Transform( center, orientation )
    {
        var m5, m6, m7;

        var rc = center.clone();
        m6 = new THREE.Matrix4().makeRotationFromQuaternion( orientation );

	   m5 = new THREE.Matrix4().makeTranslation( -rc.x, -rc.y, -rc.z );
	   m7 = new THREE.Matrix4().makeTranslation(  rc.x,  rc.y,  rc.z );

       var res = new THREE.Matrix4();
       res.multiplyMatrices( m7, m6 );
       res.multiplyMatrices( res, m5 );
       return res;
    }


    , Rotate( offsetX, offsetY, frameTime )
    {
        // Cancel out the least value for the highest move
        if( Math.abs(offsetX) < Math.abs(offsetY) )
            offsetX *= 0.000125;
        else
            offsetY *= 0.000125;
        
        // Limit the acceleration
        var speedX = 1.0;
        var speedY = 1.0; // / this.camera.aspect;

        this.rotateAccel.x = PX.Clamp( offsetX * frameTime, -speedX, speedX );
        this.rotateAccel.y = PX.Clamp( offsetY * frameTime, -speedY, speedY );
        this.rotateAccel.z = 0.0;
    }
};

var trackball = new PX.CameraTrackball();