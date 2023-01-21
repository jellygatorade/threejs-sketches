// https://www.shadertoy.com/view/ltScRG

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
  
          // 16x acceleration of https://www.shadertoy.com/view/4tSyzy
          // by applying gaussian at intermediate MIPmap level.
          
          const int samples = 36,
                    LOD = 2,         // gaussian done on MIPmap at scale LOD
                    sLOD = 1 << LOD; // tile size = 2^LOD
          const float sigma = float(samples) * .25;
          
          float gaussian(vec2 i) {
              return exp( -.5* dot(i/=sigma,i) ) / ( 6.28 * sigma*sigma );
          }
          
          vec4 blur(sampler2D sp, vec2 U, vec2 scale) {
              vec4 outCol = vec4(0);  
              int s = samples/sLOD;
              
              for ( int i = 0; i < s*s; i++ ) {
                  vec2 d = vec2(i%s, i/s)*float(sLOD) - float(samples)/2.;
                  outCol += gaussian(d) * textureLod( sp, U + scale * d , float(LOD) );
              }
              
              return outCol / outCol.a;
          }
          
          void main() 
          {
              gl_FragColor = blur( tDiffuse, vUv, 1./res); // the last param is meant to be scaled with the aspect ratio, see original shader
          }`,
};

export { BlurShader };
