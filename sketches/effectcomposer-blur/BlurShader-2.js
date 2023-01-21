const BlurShader = {
  uniforms: {
    tDiffuse: { value: null },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main()
        {
            float Pi = 6.28318530718; // Pi*2
            
            // GAUSSIAN BLUR SETTINGS {{{
            float Directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
            float Quality = 2.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
            float Size = 0.01; // BLUR SIZE (Radius)
            // GAUSSIAN BLUR SETTINGS }}}
        
            vec2 Radius = vec2(Size);

            // Pixel colour
            vec4 Color = texture2D(tDiffuse, vUv);
            
            // Blur calculations
            for( float d=0.0; d<Pi; d+=Pi/Directions)
            {
                for(float i=1.0/Quality; i<=1.0; i+=1.0/Quality)
                {
                    Color += texture2D( tDiffuse, vUv+vec2(cos(d),sin(d))*Radius*i);		
                }
            }
            
            // Output to screen
            Color /= Quality * Directions - 15.0;
            gl_FragColor =  Color;
        }`,
};

export { BlurShader };
