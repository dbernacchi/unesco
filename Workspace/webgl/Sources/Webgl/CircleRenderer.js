


//
PX.CircleRenderer = function ()
{
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.textRenderTextVertexOffset = 0;

    this.positions = null;
    this.uvs = null;
    this.colors = null;
};


PX.CircleRenderer.prototype =
{
    constructor: PX.CircleRenderer

    , Init: function( vertexCount, color, texture, scene )
    {
        //this.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.material = new THREE.MeshBasicMaterial( { map: texture, color: color, opacity: 1.0, transparent: true } ); //, vertexColors: THREE.VertexColors } );
        this.material.side = THREE.DoubleSide;
        //this.material.blending = THREE.NormalBlending;
        //this.material.blending = THREE.AdditiveBlending;
        this.material.depthWrite = false;
        //this.material.premultipliedAlpha = true;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.dynamic = true;

	    var positions = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 * 4 ), 3 );
	    var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 * 4 ), 2 );
	    //var colors = new THREE.BufferAttribute( new Float32Array( vertexCount * 4 * 4 ), 4 );
	    var indices = [];

        for( var i=0; i<vertexCount; ++i )
        {
		    // initialize P1
		    var vertex = new THREE.Vector3();
		    var uv = new THREE.Vector2( 0, 0 );

            //
            positions.setXYZ( i*4+0, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+0, uv.x, 1.0 - uv.y );
            //
            positions.setXYZ( i*4+1, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+1, uv.x, 1.0 - uv.y );
            //
            positions.setXYZ( i*4+2, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+2, uv.x, 1.0 - uv.y );
            //
            positions.setXYZ( i*4+3, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+3, uv.x, 1.0 - uv.y );

/*            colors.setXYZ( i*4+0, 255, 255, 255 );
            colors.setXYZ( i*4+1, 255, 255, 255 );
            colors.setXYZ( i*4+2, 255, 255, 255 );
            colors.setXYZ( i*4+3, 255, 255, 255 );
            //colors.setXYZ( i*4+3, 255, 255, 255 );
*/			
	    }

        // Indices
        for( var i=0; i<vertexCount; ++i )
        {
		    var indices_offset = i * 4; 
            indices.push( 0+indices_offset );
            indices.push( 1+indices_offset );
            indices.push( 2+indices_offset );
            indices.push( 0+indices_offset );
            indices.push( 2+indices_offset );
            indices.push( 3+indices_offset );
        }

	    this.geometry.setIndex( new THREE.Uint16Attribute( indices, 1 ) );
	    this.geometry.addAttribute( 'position', positions );
	    //this.geometry.addAttribute( 'color', colors );
	    this.geometry.addAttribute( 'uv', uvs );

        this.positions = this.geometry.attributes.position.array;
        this.uvs = this.geometry.attributes.uv.array;
        //this.colors = this.geometry.attributes.color.array;

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.frustumCulled = false;
        this.mesh.position = new THREE.Vector3( 0, 0, 0 );

        //
        if( scene ) scene.add( this.mesh );
    }


    , Begin: function()
    {
        this.textRenderTextVertexOffset = 0;
    }


    , End: function()
    {
        //
        this.geometry.setDrawRange( 0, this.textRenderTextVertexOffset * 6 );  // 6 indices per char

        //
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.uv.needsUpdate = true;
        //this.geometry.attributes.color.needsUpdate = true;
    }


    , AppendRect: function( pos, scale, transform ) //, _color )
    {
	    // set start position for first string
        //
	    var xOffset = pos.x;
	    var yOffset = pos.y;
        var zOffset = pos.z;

        var i = this.textRenderTextVertexOffset;

        //
	    var vertex = new THREE.Vector3();
	    var uv = new THREE.Vector2( 0, 0 );

		// P1
		vertex.x = -1 * scale;
		vertex.y = -1 * scale; 
		vertex.z = 0.0;
        //
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        vertex.applyMatrix4( transform );
        //
		uv.x = 0;
		uv.y = 0;
        //
        this.positions[ i*4*3+0 ] = vertex.x;
        this.positions[ i*4*3+1 ] = vertex.y;
        this.positions[ i*4*3+2 ] = vertex.z;
        this.uvs[ i*4*2+0 ] = uv.x;
        this.uvs[ i*4*2+1 ] = uv.y;

		// P2		
		vertex.x =  1 * scale;
		vertex.y = -1 * scale;
		vertex.z = 0.0;
        //
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        vertex.applyMatrix4( transform );
        //
		uv.x = 1;
		uv.y = 0;
        //
        this.positions[ i*4*3+3 ] = vertex.x;
        this.positions[ i*4*3+4 ] = vertex.y;
        this.positions[ i*4*3+5 ] = vertex.z;
        this.uvs[ i*4*2+2 ] = uv.x;
        this.uvs[ i*4*2+3 ] = uv.y;

		// P3		
		vertex.x = 1 * scale;
		vertex.y = 1 * scale;
		vertex.z = 0.0;
        //
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        vertex.applyMatrix4( transform );
        //
		uv.x = 1;
		uv.y = 1;
        //
        this.positions[ i*4*3+6 ] = vertex.x;
        this.positions[ i*4*3+7 ] = vertex.y;
        this.positions[ i*4*3+8 ] = vertex.z;
        this.uvs[ i*4*2+4 ] = uv.x;
        this.uvs[ i*4*2+5 ] = uv.y;

		// P4		
		vertex.x = -1 * scale;
		vertex.y =  1 * scale;
		vertex.z = 0.0;
        //
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        vertex.applyMatrix4( transform );
        //
		uv.x = 0;
		uv.y = 1;
        //
        this.positions[ i*4*3+9  ] = vertex.x;
        this.positions[ i*4*3+10 ] = vertex.y;
        this.positions[ i*4*3+11 ] = vertex.z;
        this.uvs[ i*4*2+6 ] = uv.x;
        this.uvs[ i*4*2+7 ] = uv.y;
/**
        //
        this.colors[ i*4*4+0 ] = _color.x;
        this.colors[ i*4*4+1 ] = _color.y;
        this.colors[ i*4*4+2 ] = _color.z;
        this.colors[ i*4*4+3 ] = _color.w;
        this.colors[ i*4*4+4 ] = _color.x;
        this.colors[ i*4*4+5 ] = _color.y;
        this.colors[ i*4*4+6 ] = _color.z;
        this.colors[ i*4*4+7 ] = _color.w;
        this.colors[ i*4*4+8 ] = _color.x;
        this.colors[ i*4*4+9 ] = _color.y;
        this.colors[ i*4*4+10 ] = _color.z;
        this.colors[ i*4*4+11 ] = _color.w;
        this.colors[ i*4*4+12 ] = _color.x;
        this.colors[ i*4*4+13 ] = _color.y;
        this.colors[ i*4*4+14 ] = _color.z;
        this.colors[ i*4*4+15 ] = _color.w;
***/
        this.textRenderTextVertexOffset += 4;
    }

    /**
    , AppendRectQuat: function( pos, scale, quat, _color )
    {
	    // set start position for first string
        //
	    var xOffset = pos.x;
	    var yOffset = pos.y;
        var zOffset = pos.z;

        var i = this.textRenderTextVertexOffset;

        //
	    var vertex = new THREE.Vector3();
	    var uv = new THREE.Vector2( 0, 0 );

		// P1
		vertex.x = -1 * scale;
		vertex.y = -1 * scale; 
		vertex.z = 0.0;
        //
        vertex.applyQuaternion( quat );
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        //
		uv.x = 0;
		uv.y = 0;
        //
        this.positions[ i*4*3+0 ] = vertex.x;
        this.positions[ i*4*3+1 ] = vertex.y;
        this.positions[ i*4*3+2 ] = vertex.z;
        this.uvs[ i*4*2+0 ] = uv.x;
        this.uvs[ i*4*2+1 ] = uv.y;

		// P2		
		vertex.x =  1 * scale;
		vertex.y = -1 * scale;
		vertex.z = 0.0;
        //
        vertex.applyQuaternion( quat );
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        //
		uv.x = 1;
		uv.y = 0;
        //
        this.positions[ i*4*3+3 ] = vertex.x;
        this.positions[ i*4*3+4 ] = vertex.y;
        this.positions[ i*4*3+5 ] = vertex.z;
        this.uvs[ i*4*2+2 ] = uv.x;
        this.uvs[ i*4*2+3 ] = uv.y;

		// P3		
		vertex.x = 1 * scale;
		vertex.y = 1 * scale;
		vertex.z = 0.0;
        //
        vertex.applyQuaternion( quat );
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        //
		uv.x = 1;
		uv.y = 1;
        //
        this.positions[ i*4*3+6 ] = vertex.x;
        this.positions[ i*4*3+7 ] = vertex.y;
        this.positions[ i*4*3+8 ] = vertex.z;
        this.uvs[ i*4*2+4 ] = uv.x;
        this.uvs[ i*4*2+5 ] = uv.y;

		// P4		
		vertex.x = -1 * scale;
		vertex.y =  1 * scale;
		vertex.z = 0.0;
        //
        vertex.applyQuaternion( quat );
        vertex.x += xOffset;
        vertex.y += yOffset;
        vertex.z += zOffset;
        //
		uv.x = 0;
		uv.y = 1;
        //
        this.positions[ i*4*3+9  ] = vertex.x;
        this.positions[ i*4*3+10 ] = vertex.y;
        this.positions[ i*4*3+11 ] = vertex.z;
        this.uvs[ i*4*2+6 ] = uv.x;
        this.uvs[ i*4*2+7 ] = uv.y;

        //
        this.colors[ i*4*3+0 ] = _color.x;
        this.colors[ i*4*3+1 ] = _color.y;
        this.colors[ i*4*3+2 ] = _color.z;
        this.colors[ i*4*3+3 ] = _color.x;
        this.colors[ i*4*3+4 ] = _color.y;
        this.colors[ i*4*3+5 ] = _color.z;
        this.colors[ i*4*3+6 ] = _color.x;
        this.colors[ i*4*3+7 ] = _color.y;
        this.colors[ i*4*3+8 ] = _color.z;
        this.colors[ i*4*3+9 ] = _color.x;
        this.colors[ i*4*3+10 ] = _color.y;
        this.colors[ i*4*3+11 ] = _color.z;

        this.textRenderTextVertexOffset += 4;
    }
**/

};