uniform vec3 color;
uniform vec3 addCol;
uniform float alpha;
uniform float addColRate;

varying vec3 vNor;

void main(void) {
  vec4 dest = vec4(color, alpha);
  dest.rgb += mix(vec3(0.0), addCol, addColRate);
  dest.rgb += vNor.x * 0.25;
  dest.rgb -= vNor.z * 0.85;
  // dest.rgb += vNor.y * 0.5;
  gl_FragColor = dest;
}
