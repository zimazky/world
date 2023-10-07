@group(0) @binding(0) var<uniform> mvp: mat4x4f;

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) fragPosition: vec4f,
  @location(1) color: vec4f
}
@vertex
fn vertexMain(
  @location(0) position: vec4f,
  @location(1) color: vec3f
) -> VertexOut {
  var output: VertexOut;
  output.position = mvp * position;
  output.fragPosition = position;
  output.color = vec4f(color, 1);
  return output;
}

@fragment
fn fragmentMain(fragData: VertexOut) -> @location(0) vec4f {
  //return vec4f(0.5*normalize(fragData.fragPosition.xyz*fragData.color.rgb)+0.5, 1);
  return vec4f(fragData.color.rgb, 1);

}
