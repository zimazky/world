struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoords: vec2f
}
@vertex
fn vertexMain(
  @location(0) pos: vec2f,
  @location(1) color: vec3f,
  @location(2) texCoords: vec2f
) -> VertexOut {
  var output: VertexOut;
  output.position = vec4f(pos, 0, 1);
  output.color = vec4f(color, 1);
  output.texCoords = texCoords;
  return output;
}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;

@fragment
fn fragmentMain(fragData: VertexOut) -> @location(0) vec4f {
  var texColor = textureSample(tex, texSampler, fragData.texCoords);
  return fragData.color*texColor;
}
