


//
PX.TextRenderer = function ()
{
    this.bmFontDescriptor = null;
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.textRenderTextVertexOffset = 0;

    this.positions = null;
    this.uvs = null;

};


PX.TextRenderer.prototype =
{
    constructor: PX.TextRenderer

    , Init: function( bmFontDescriptor, vertexCount, color, texture, scene )
    {
        this.bmFontDescriptor = bmFontDescriptor;

        //this.material = new THREE.MeshBasicMaterial( { map: texture, color: 0xff0000 } );
        this.material = new THREE.MeshBasicMaterial( { map: texture, color: color, opacity: 2.0, transparent: true } );
        this.material.side = THREE.DoubleSide;
        this.material.blending = THREE.AdditiveBlending;
        this.material.depthWrite = false;
        this.material.premultipliedAlpha = true;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.dynamic = true;

	    var positions = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 * 4 ), 3 );
	    var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 * 4 ), 2 );
	    //var colors = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 * 4 ), 3 );
	    var indices = [];

        /*var isCenter = true;
        if( isCenter )
        {
            var totalWidth = 0.0;
            for( var ci=0; ci<vertexCount; ++ci )
            {
		        letterDescriptor = bmFontDescriptor.getLetter( ''+ci );
    		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;

                totalWidth += letterxAdvance;
            }

	        xOffset -= totalWidth * 0.5;
            yOffset += fontSizeFactor;
        }*/

        //var transform = new THREE.Quaternion();
        //transform.setFromAxisAngle( PX.YAxis, PX.ToRadians( 45 ) );

        for( var i=0; i<vertexCount; ++i )
        {
/*		    letterDescriptor = bmFontDescriptor.getLetter( ' ' );
		    var letterxOffset = letterDescriptor.xoffset * fontSizeFactor;
		    var letteryOffset = - (letterDescriptor.yoffset * fontSizeFactor);
		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;

		    // append the textureCoords for the current letter
		    var textureCoords = (letterDescriptor.textureBuffer);  
*/
		    // initialize P1
		    var vertex = new THREE.Vector3();
		    var uv = new THREE.Vector2( 0, 0 );

		    /*vertex.x = 0 + letterxOffset;
		    vertex.y = - (letterDescriptor.height * fontSizeFactor) + letteryOffset; 
		    vertex.z = 0.0;
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            vertex.applyQuaternion( transform );
		    uv.x = textureCoords[0];
		    uv.y = textureCoords[1];*/
            //
            positions.setXYZ( i*4+0, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+0, uv.x, 1.0 - uv.y );

		    // initialize P2		
		    /*vertex.x = (letterDescriptor.width * fontSizeFactor) + letterxOffset;
		    vertex.y = - (letterDescriptor.height * fontSizeFactor)  + letteryOffset;
		    vertex.z = 0.0;
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            vertex.applyQuaternion( transform );
		    uv.x = textureCoords[2];
		    uv.y = textureCoords[3];*/
            //
            positions.setXYZ( i*4+1, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+1, uv.x, 1.0 - uv.y );

		    // initialize P3		
		    /*vertex.x = (letterDescriptor.width * fontSizeFactor) + letterxOffset;
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            vertex.applyQuaternion( transform );
		    uv.x = textureCoords[4];
		    uv.y = textureCoords[5];*/
            //
            positions.setXYZ( i*4+2, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+2, uv.x, 1.0 - uv.y );

		    // initialize P4		
		    /*vertex.x = 0 + letterxOffset;
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            vertex.applyQuaternion( transform );
		    uv.x = textureCoords[6];
		    uv.y = textureCoords[7];*/
            //
            positions.setXYZ( i*4+3, vertex.x, vertex.y, vertex.z );
		    uvs.setXY( i*4+3, uv.x, 1.0 - uv.y );


            //colors.setXYZ( i*4+0, 255, 255, 255 );
            //colors.setXYZ( i*4+1, 255, 255, 255 );
            //colors.setXYZ( i*4+2, 255, 255, 255 );
            //colors.setXYZ( i*4+3, 255, 255, 255 );
			
		    //xOffset += letterxAdvance; 
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

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.frustumCulled = false;
        this.mesh.position = new THREE.Vector3( 0, 0, 0 );

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
    }


    , AppendText: function( text, pos, textSize, transform, isCenter )
    {
	    // set factor which bitmap font tiles shall be scaled with
        //
	    var fontSizeFactor = 1.0 / textSize;

	    // set start position for first string
        //
	    var xOffset = pos.x;
	    var yOffset = pos.y;
        var zOffset = pos.z;

        var letterDescriptor;

        var yyy = 0; //-textSize * (1.0 / textSize ) * 0.5;

        //
        if( isCenter )
        {
            var totalWidth = 0.0;
            var totalHeight = 0.0;
            for( var ci=0; ci<text.length; ++ci )
            {
		        letterDescriptor = this.bmFontDescriptor.getLetter( text[ci] );
                if( !letterDescriptor )
                    continue;

    		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;
		        var letteryOffset = -(letterDescriptor.yoffset);

		        totalHeight += (letterDescriptor.height);

                totalWidth += letterxAdvance;
            }

	        xOffset += totalWidth * 0.5;
            yyy = -(totalHeight / text.length) * fontSizeFactor * 0.75;
        }


        //
	    var vertex = new THREE.Vector3();
	    var uv = new THREE.Vector2( 0, 0 );
        for( var ci=0; ci<text.length; ++ci )
        {
            var i = ci + this.textRenderTextVertexOffset;

		    letterDescriptor = this.bmFontDescriptor.getLetter( text[ci] );
            if( !letterDescriptor )
                continue;

		    var letterxOffset = letterDescriptor.xoffset * fontSizeFactor;
		    var letteryOffset = -(letterDescriptor.yoffset * fontSizeFactor);
		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;

            //var yyy = 0; //-((letterDescriptor.height * fontSizeFactor) + letteryOffset);

		    // append the textureCoords for the current letter
		    var textureCoords = (letterDescriptor.textureBuffer);  

		    // P1
		    vertex.x = -(0 + letterxOffset);
		    vertex.y = -(letterDescriptor.height * fontSizeFactor) + letteryOffset; 
		    vertex.z = 0.0;
            //
            vertex.x += xOffset;
            vertex.y += yOffset - ( isCenter ? yyy : 0.0 );
            vertex.z += zOffset;
            vertex.applyMatrix4( transform );
            //
		    uv.x = textureCoords[0];
		    uv.y = textureCoords[1];
            //
            this.positions[ i*4*3+0 ] = vertex.x;
            this.positions[ i*4*3+1 ] = vertex.y;
            this.positions[ i*4*3+2 ] = vertex.z;
            this.uvs[ i*4*2+0 ] = uv.x;
            this.uvs[ i*4*2+1 ] = 1.0 - uv.y;

		    // P2		
		    vertex.x = -((letterDescriptor.width * fontSizeFactor) + letterxOffset);
		    vertex.y = -(letterDescriptor.height * fontSizeFactor) + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xOffset;
            vertex.y += yOffset - ( isCenter ? yyy : 0.0 );
            vertex.z += zOffset;
            vertex.applyMatrix4( transform );
            //
		    uv.x = textureCoords[2];
		    uv.y = textureCoords[3];
            //
            this.positions[ i*4*3+3 ] = vertex.x;
            this.positions[ i*4*3+4 ] = vertex.y;
            this.positions[ i*4*3+5 ] = vertex.z;
            this.uvs[ i*4*2+2 ] = uv.x;
            this.uvs[ i*4*2+3 ] = 1.0 - uv.y;

		    // P3		
		    vertex.x = -((letterDescriptor.width * fontSizeFactor) + letterxOffset);
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xOffset;
            vertex.y += yOffset - ( isCenter ? yyy : 0.0 );
            vertex.z += zOffset;
            vertex.applyMatrix4( transform );
            //
		    uv.x = textureCoords[4];
		    uv.y = textureCoords[5];
            //
            this.positions[ i*4*3+6 ] = vertex.x;
            this.positions[ i*4*3+7 ] = vertex.y;
            this.positions[ i*4*3+8 ] = vertex.z;
            this.uvs[ i*4*2+4 ] = uv.x;
            this.uvs[ i*4*2+5 ] = 1.0 - uv.y;

		    // P4		
		    vertex.x = -(0 + letterxOffset);
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xOffset;
            vertex.y += yOffset - ( isCenter ? yyy : 0.0 );
            vertex.z += zOffset;
            vertex.applyMatrix4( transform );
            //
		    uv.x = textureCoords[6];
		    uv.y = textureCoords[7];
            //
            this.positions[ i*4*3+9  ] = vertex.x;
            this.positions[ i*4*3+10 ] = vertex.y;
            this.positions[ i*4*3+11 ] = vertex.z;
            this.uvs[ i*4*2+6 ] = uv.x;
            this.uvs[ i*4*2+7 ] = 1.0 - uv.y;

            //
		    xOffset -= letterxAdvance; 
	    }

        this.textRenderTextVertexOffset += text.length;
    }


    , AppendText2D: function( text, pos, textSize, scaleFactor, isCenterX, isCenterY )
    {
	    // set factor which bitmap font tiles shall be scaled with
        //
	    var fontSizeFactor = 1.0 / textSize;

	    // set start position for first string
        //
	    var xOffset = pos.x;
	    var yOffset = pos.y;
        var zOffset = pos.z;

        var letterDescriptor;

        var xxx = 0.0;
        var yyy = 0.0;

        //
        if( isCenterX || isCenterY )
        {
            var totalWidth = 0.0;
            var totalHeight = 0.0;
            var temp = 0.0;
            for( var ci=0; ci<text.length; ++ci )
            {
		        letterDescriptor = this.bmFontDescriptor.getLetter( text[ci] );
                if( !letterDescriptor )
                    continue;

		        var letterxOffset = letterDescriptor.xoffset * fontSizeFactor;
		        var letteryOffset = -(letterDescriptor.yoffset) * fontSizeFactor;
    		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;

		        totalHeight += ( -(letterDescriptor.height * fontSizeFactor) );
                temp += letteryOffset;
                totalWidth += letterxAdvance + letterxOffset;
            }

            if( isCenterX ) xxx = -totalWidth * 0.5;
            if( isCenterY ) yyy = -( ( totalHeight / text.length ) * 0.5 + ( temp / text.length ) );
        }


        //
	    var vertex = new THREE.Vector3();
	    var uv = new THREE.Vector2( 0, 0 );
        for( var ci=0; ci<text.length; ++ci )
        {
            var i = ci + this.textRenderTextVertexOffset;

		    letterDescriptor = this.bmFontDescriptor.getLetter( text[ci] );
            if( !letterDescriptor )
                continue;

		    var letterxOffset = letterDescriptor.xoffset * fontSizeFactor;
		    var letteryOffset = -(letterDescriptor.yoffset * fontSizeFactor);
		    var letterxAdvance = letterDescriptor.xadvance * fontSizeFactor;

		    // append the textureCoords for the current letter
		    var textureCoords = (letterDescriptor.textureBuffer);  

		    // P1
		    vertex.x = (0 + letterxOffset);
		    vertex.y = -(letterDescriptor.height * fontSizeFactor) + letteryOffset; 
		    vertex.z = 0.0;
            //
            vertex.x += xxx;
            vertex.y += yyy;
            //
            vertex.x *= scaleFactor;
            vertex.y *= scaleFactor;
            vertex.z *= scaleFactor;
            //
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            //
		    uv.x = textureCoords[0];
		    uv.y = textureCoords[1];
            //
            this.positions[ i*4*3+0 ] = vertex.x;
            this.positions[ i*4*3+1 ] = vertex.y;
            this.positions[ i*4*3+2 ] = vertex.z;
            this.uvs[ i*4*2+0 ] = uv.x;
            this.uvs[ i*4*2+1 ] = 1.0 - uv.y;

		    // P2		
		    vertex.x = ((letterDescriptor.width * fontSizeFactor) + letterxOffset);
		    vertex.y = -(letterDescriptor.height * fontSizeFactor) + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xxx;
            vertex.y += yyy;
            //
            vertex.x *= scaleFactor;
            vertex.y *= scaleFactor;
            vertex.z *= scaleFactor;
            //
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            //
		    uv.x = textureCoords[2];
		    uv.y = textureCoords[3];
            //
            this.positions[ i*4*3+3 ] = vertex.x;
            this.positions[ i*4*3+4 ] = vertex.y;
            this.positions[ i*4*3+5 ] = vertex.z;
            this.uvs[ i*4*2+2 ] = uv.x;
            this.uvs[ i*4*2+3 ] = 1.0 - uv.y;

		    // P3		
		    vertex.x = ((letterDescriptor.width * fontSizeFactor) + letterxOffset);
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xxx;
            vertex.y += yyy;
            //
            vertex.x *= scaleFactor;
            vertex.y *= scaleFactor;
            vertex.z *= scaleFactor;
            //
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            //
		    uv.x = textureCoords[4];
		    uv.y = textureCoords[5];
            //
            this.positions[ i*4*3+6 ] = vertex.x;
            this.positions[ i*4*3+7 ] = vertex.y;
            this.positions[ i*4*3+8 ] = vertex.z;
            this.uvs[ i*4*2+4 ] = uv.x;
            this.uvs[ i*4*2+5 ] = 1.0 - uv.y;

		    // P4		
		    vertex.x = (0 + letterxOffset);
		    vertex.y = 0 + letteryOffset;
		    vertex.z = 0.0;
            //
            vertex.x += xxx;
            vertex.y += yyy;
            //
            vertex.x *= scaleFactor;
            vertex.y *= scaleFactor;
            vertex.z *= scaleFactor;
            //
            vertex.x += xOffset;
            vertex.y += yOffset;
            vertex.z += zOffset;
            //
		    uv.x = textureCoords[6];
		    uv.y = textureCoords[7];
            //
            this.positions[ i*4*3+9  ] = vertex.x;
            this.positions[ i*4*3+10 ] = vertex.y;
            this.positions[ i*4*3+11 ] = vertex.z;
            this.uvs[ i*4*2+6 ] = uv.x;
            this.uvs[ i*4*2+7 ] = 1.0 - uv.y;

            //
		    xOffset += letterxAdvance; 
	    }

        this.textRenderTextVertexOffset += text.length;
    }

};