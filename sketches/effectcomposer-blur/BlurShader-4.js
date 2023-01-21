// Kawase Blur
// https://www.shadertoy.com/view/Xl3XW7

const BlurShader = {
  uniforms: {
    res: { value: null },
    tDiffuse: { value: null },
  },

  vertexShader: /* glsl */ `
    
            varying vec2 vUv;
    
            void main() {
    
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
            }`,

  fragmentShader: /* glsl */ `
        uniform vec2 res;
        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        void reSample(in int d, in vec2 uv, inout vec4 fragColor)
        {
        
            vec2 step1 = (vec2(d) + 0.5) / res.xy;
            
            fragColor += texture2D(tDiffuse, vUv + step1) / float(4);
            fragColor += texture2D(tDiffuse, vUv - step1) / float(4);
            vec2 step2 = step1;
            step2.x = -step2.x;
            fragColor += texture2D(tDiffuse, vUv + step2) / float(4);
            fragColor += texture2D(tDiffuse, vUv - step2) / float(4);
        }

        void main()
        {
            vec2 pixelSize = vec2(1.0) / res.xy;
            vec2 halfSize = pixelSize / vec2(2.0);
            
            vec4 color = vec4(0);
            reSample(3, vUv, color);
            
            gl_FragColor = color;
        }
    `,
};

export { BlurShader };
