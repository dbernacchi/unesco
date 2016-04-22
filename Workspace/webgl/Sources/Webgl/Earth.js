
//
UG.Earth = function ()
{
    this.mesh = null;
    this.geometry = null;
    this.materialAttributes = null;
    this.material = null;
    this.uniforms = null;

    this.sceneShadow = null;
    this.shadowPlaneMesh = null;

    this.worldMatrix = new THREE.Matrix4();

    this.doIntroAnimation = true;
    this.introScale = { x: 0.001 };

    this.currentAngle = { x: 0.0 };
    this.rotationSpeed = 0.0;
};


UG.Earth.prototype =
{
    constructor: UG.Earth

    , Init: function( scene )
    {
        // Shadow plane
        //
        //if( !PX.IsMobile )
        {
            this.sceneShadow = new THREE.Scene();

            var planeMat = new THREE.MeshBasicMaterial( { color: 0xffffff, map: PX.AssetsDatabase["EarthShadow"], opacity: 1.5, transparent: true, vertexColors: THREE.VertexColors } );
            planeMat.side = THREE.DoubleSide;
            planeMat.depthTest = false;
            planeMat.depthWrite = false;
            var planeGeom = new THREE.PlaneGeometry( 1, 1, 0 );
	        var matTrans = new THREE.Matrix4().makeTranslation( 0, -0.5, -1.0 );
            var matRot = new THREE.Matrix4(); //.makeRotationX( THREE.Math.degToRad( 90.0 ) )
	        var objMat = new THREE.Matrix4().multiplyMatrices( matTrans, matRot );
	        planeGeom.applyMatrix( objMat );
            this.shadowPlaneMesh = new THREE.Mesh( planeGeom, planeMat );
            this.shadowPlaneMesh.position.set( 0, 0, 0 );
            //this.shadowPlaneMesh.renderOrder = 0;
            //scene.add( this.shadowPlaneMesh );
            this.sceneShadow.add( this.shadowPlaneMesh );
        }


        this.uniforms =
        {
            DiffuseMap: { type: "t", value: PX.AssetsDatabase["EarthDiffuseMap"] }
            , NormalMap: { type: "t", value: PX.AssetsDatabase["EarthNormalMap"] }
            , SpecularMap: { type: "t", value: PX.AssetsDatabase["EarthSpecularMap"] }
            //, CloudsMap: { type: "t", value: PX.AssetsDatabase["EarthCloudsMap"] }
            //, CloudsNormalMap: { type: "t", value: PX.AssetsDatabase["EarthCloudsNormalMap"] }
            , NightLightsMap: { type: "t", value: PX.AssetsDatabase["EarthNightLightsMap"] }
            , World: { type: "m4", value: this.worldMatrix }
            , ViewPosition: { type: "v3", value: null }
            , LightDirection: { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
            , Params0: { type: "v4", value: new THREE.Vector4() }
            , Params1: { type: "v4", value: new THREE.Vector4() }
            , Params2: { type: "v4", value: new THREE.Vector4() }
            , Time: { type: "f", value: 0.0 }
        }

        this.materialAttributes =
        {
            ParticleColorAndIndex:
            {
                type: 'f'
                , value: null
            }
            , ParticleOffsetDirectionVector:
            {
                type: 'f'
                , value: null
            }
            , ParticleScale:
            {
                type: 'f'
                , value: null
            }
        };

        this.material = new THREE.ShaderMaterial(
        {
            uniforms: this.uniforms
            //, attributes: this.materialAttributes
            , vertexShader: PX.AssetsDatabase["EarthVertexShader"]
            , fragmentShader: PX.AssetsDatabase["EarthPixelShader"]
            , vertexColors: THREE.VertexColors
        } );
        //this.material.side = THREE.DoubleSide;
        this.material.extensions.derivatives = true;
        this.material.depthTest = true;
        this.material.depthWrite = true;
        this.material.transparent = false;
        //this.material.wireframe = true;
        //this.material.polygonOffset = true;
        //this.material.polygonOffsetFactor = 1;
        //this.material.polygonOffsetUnits = 1.0;

        //this.mesh = new THREE.Mesh( new THREE.SphereGeometry( PX.kEarthScale, 32*4, 22*4 ), this.material );
        this.mesh = new THREE.Mesh( new THREE.SphereGeometry( PX.kEarthScale, PX.kEarthDetailX, PX.kEarthDetailY ), this.material );
        this.mesh.position.set( 0, 0, 0 );
        //this.mesh.renderOrder = 100;

        scene.add( this.mesh );


        // Add intro tween
        //
        var target = { x : 1.0 };
        var tween = new TWEEN.Tween( this.introScale ).to( target, 2000 );
        tween.easing( TWEEN.Easing.Sinusoidal.InOut );
        tween.delay( 2000 );
        tween.start();
        tween.onComplete( function()
        {
            appStateMan.SetState( PX.AppStates.AppStateEntry );
        });
    }

    , Update: function( time, frameTime, camera )
    {
        // Update globe's scale
        //
        this.mesh.scale.set( this.introScale.x, this.introScale.x, this.introScale.x );


        // Shadow Plane
        //
        //if( !PX.IsMobile )
        if( this.shadowPlaneMesh )
        {
            this.shadowPlaneMesh.material.opacity = PX.Pow2( this.introScale.x ) * 1.0;
            this.shadowPlaneMesh.scale.set( PX.EPSILON + Params.EarthShadowScaleX * this.introScale.x, PX.EPSILON + Params.EarthShadowScaleY * this.introScale.x, PX.EPSILON + Params.EarthShadowScaleZ * this.introScale.x );
            this.shadowPlaneMesh.rotation.setFromRotationMatrix( camera.matrix );
        }


        // Update shader params
        //
        this.uniforms.Time.value = time;
        this.uniforms.Params0.value.set( Params.AmbientIntensity, Params.DiffuseIntensity, Params.SpecularIntensity, Params.NormalMapIntensity );
        this.uniforms.Params1.value.set( Params.CloudsIntensity, Params.CloudsShadowIntensity, Params.CloudsShadowOffset, Params.NightDayMixFactor );
        this.uniforms.Params2.value.set( Params.EarthRoughness, Params.HalfLambertPower, Params.RimAngle, Params.DiffuseRimIntensity );
        this.uniforms.ViewPosition.value = camera.position;
        this.uniforms.LightDirection.value.set( -Params.LightDirX, -Params.LightDirY, -Params.LightDirZ );


        // While in Entry point, globe is slowly rotating
        switch( appStateMan.GetCurrentState() )
        {
            case PX.AppStates.AppStateEntry:
                this.rotationSpeed += frameTime * 0.2;
                this.rotationSpeed = PX.Saturate( this.rotationSpeed );
                this.currentAngle.x = time * 3.0 * this.rotationSpeed;
                this.mesh.quaternion.setFromAxisAngle( PX.YAxis, PX.ToRadians( this.currentAngle.x ) );
                break;
        
            case PX.AppStates.AppStateIntroToLevel0:
                this.mesh.quaternion.setFromAxisAngle( PX.YAxis, PX.ToRadians( this.currentAngle.x ) );
                break;
            default:
                break;
        }

        //
        this.worldMatrix.makeRotationFromQuaternion( this.mesh.quaternion );
    }


    , ResetTransform: function( onCompleteCB )
    {
        var resetAngle = PX.Utils.NextMultiple( this.currentAngle.x, 360 );
        console.log( "resetAngle: " + resetAngle + " currentAngle: " + this.currentAngle.x );
        var tween = new TWEEN.Tween( this.currentAngle ).to( { x: resetAngle }, 2000 );
        tween.easing( TWEEN.Easing.Sinusoidal.InOut );
        //tween.delay( 1000 );
        tween.start();
        tween.onComplete( function()
        {
            if( onCompleteCB ) onCompleteCB();
        });
    }

};