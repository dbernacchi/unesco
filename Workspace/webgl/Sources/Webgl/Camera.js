

PX.CameraTrackball = function()
{
    //this.camera             = null;

    this.target             = new THREE.Vector3();
    this.right              = new THREE.Vector3();

    this.rotateAccel        = new THREE.Vector3();
    this.rotateVel          = new THREE.Vector3();
    this.damping            = 0.15;

    this.polarAngle         = 0.0;
    this.minPolarAngle      = -10;
    this.maxPolarAngle      =  10;

    this.rotateFactor       = 1.0;

    this.lockUpVector       = true;

    this.tempQuat           = new THREE.Quaternion();

    // Convinience
    this.camPosition        = new THREE.Vector3();
    this.camLookAt          = new THREE.Vector3();
    this.camDir             = new THREE.Vector3( 0, 0, 1 );
    this.camUp              = new THREE.Vector3();
};


PX.CameraTrackball.prototype =
{
    constructor: PX.CameraTrackball

    , Init: function( camera )
    {
        //this.camera = camera;
        this.target.copy( camera.getWorldDirection() );
        this.right.copy( this.target );
        this.right.crossVectors( this.right, PX.YAxis );
        this.right.normalize();
    }


    // eventType: 1: mousedown, 2: mousedrag, 3: mouserelease
    // mouseButton: 1: mouseButtonLeft, 2: mouseButtonMiddle, 3: mouseButtonRight
    , HandleMouseEvents: function( eventType, mouseButton, deltaX, deltaY, frameTime, aspectRatio )
    {
        // Rotate
        if( eventType == 1 && mouseButton == 1 )
        {
            this.Rotate( deltaX, deltaY, frameTime, aspectRatio );
        }
    }

    , Reset: function( camera, center )
    {
        //this.camera = camera;
        this.target.copy( center );
        this.right = camera.getWorldDirection().clone();
        this.right.crossVectors( this.right, PX.YAxis );
        this.right.normalize();
    }


    , Update: function( camera, frameTime )
    {
        this.rotateVel.add( this.rotateAccel );
		// Damping
        this.rotateVel.multiplyScalar( 1.0 - ( this.damping * frameTime * 60.0 ) );
		// Cancel Acceleration
        this.rotateAccel.x = this.rotateAccel.y = this.rotateAccel.z = 0.0;

        var radians = PX.ToRadians( -this.rotateVel.y * this.rotateFactor );
		this.tempQuat.setFromAxisAngle( this.right, radians );

        var mat = this.Transform( this.target, this.tempQuat );

        var pos = camera.position.clone().applyMatrix4( mat );

        var axis = new THREE.Vector3( 0, this.camUp.y > 0.0 ? 1 : -1, 0 );
        if( ! this.lockUpVector )
        {
            axis.crossVectors( this.right, this.camDir );
            axis.normalize();
        }

        radians = PX.ToRadians( -this.rotateVel.x * this.rotateFactor );
		this.tempQuat.setFromAxisAngle( axis, radians );
        mat = this.Transform( this.target, this.tempQuat );
        pos.applyMatrix4( mat );

        this.right.applyQuaternion( this.tempQuat );

        var dir = this.target.clone().sub( pos );

        var dist = dir.length();
        dir.normalize();

        var up = this.right.clone();
        up.crossVectors( this.right, dir );
        up.normalize();

        var lookAt = dir.clone().multiplyScalar( dist ).add( pos );

        this.camPosition.copy( pos );
        this.camLookAt.copy( lookAt );
        this.camDir.copy( dir );
        this.camUp.copy( up );

        camera.position.copy( pos );
        camera.lookAt( lookAt );

        this.target = camera.getWorldDirection();
    }


    , Transform: function( center, orientation )
    {
        var m0, m1, m2;

        var rc = center.clone();
        m1 = new THREE.Matrix4().makeRotationFromQuaternion( orientation );

	    m0 = new THREE.Matrix4().makeTranslation( -rc.x, -rc.y, -rc.z );
	    m2 = new THREE.Matrix4().makeTranslation(  rc.x,  rc.y,  rc.z );

        var res = new THREE.Matrix4();
        res.multiplyMatrices( m2, m1 );
        res.multiplyMatrices( res, m0 );
        return res;
    }


    , Rotate: function( offsetX, offsetY, frameTime, aspectRatio )
    {
        // Cancel out the least value for the highest move
        if( Math.abs(offsetX) < Math.abs(offsetY) )
            offsetX *= 0.000125;
        else
            offsetY *= 0.000125;
        
        // Limit the acceleration
        var speedX = 1.0;
        var speedY = 1.0; // / aspectRatio;

        this.rotateAccel.x = PX.Clamp( offsetX * frameTime, -speedX, speedX );
        this.rotateAccel.y = PX.Clamp( offsetY * frameTime, -speedY, speedY );
        this.rotateAccel.z = 0.0;

/*
        this.polarAngle += this.rotateAccel.y;
        //console.log( this.polarAngle );
        if( this.polarAngle >= this.maxPolarAngle )
        {
            this.polarAngle = this.maxPolarAngle;
            this.rotateAccel.y = 0.0;
        }
        else if( this.polarAngle <= this.minPolarAngle )
        {
            this.polarAngle = this.minPolarAngle;
            this.rotateAccel.y = 0.0;
        }*/
    }
};
