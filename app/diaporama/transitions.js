/**
 * Currently, gl-transitions do not compatible with diaporama,
 * and glsl-transitions some items do not compatible with diaporama,
 * so I manually made a copy, and modified it here.
 *
 * @senntyou
 */

export default [ {
  "id" : "b1ed2b9c435ed6d4b18c8b9fda6e4352",
  "name" : "Inverted Page Curl ",
  "owner" : "rakeshcjadav",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Adapted by Sergey Kosarevsky from:\n// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html\n\n/*\nCopyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n   * Redistributions of source code must retain the above copyright\n     notice, this list of conditions and the following disclaimer.\n   * Redistributions in binary form must reproduce the above\n     copyright notice, this list of conditions and the following disclaimer\n     in the documentation and/or other materials provided with the\n     distribution.\n   * Neither the name of Hewlett-Packard nor the names of its\n     contributors may be used to endorse or promote products derived from\n     this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\nin vec2 texCoord;\n*/\n\nconst float MIN_AMOUNT = -0.16;\nconst float MAX_AMOUNT = 1.5;\nfloat amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;\n\nconst float PI = 3.141592653589793;\n\nconst float scale = 512.0;\nconst float sharpness = 3.0;\n\nfloat cylinderCenter = amount;\n// 360 degrees * amount\nfloat cylinderAngle = 2.0 * PI * amount;\n\nconst float cylinderRadius = 1.0 / PI / 2.0;\n\nvec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)\n{\n\tfloat hitPoint = hitAngle / (2.0 * PI);\n\tpoint.y = hitPoint;\n\treturn rrotation * point;\n}\n\nvec4 antiAlias(vec4 color1, vec4 color2, float distanc)\n{\n\tdistanc *= scale;\n\tif (distanc < 0.0) return color2;\n\tif (distanc > 2.0) return color1;\n\tfloat dd = pow(1.0 - distanc / 2.0, sharpness);\n\treturn ((color2 - color1) * dd) + color1;\n}\n\nfloat distanceToEdge(vec3 point)\n{\n\tfloat dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);\n\tfloat dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);\n\tif (point.x < 0.0) dx = -point.x;\n\tif (point.x > 1.0) dx = point.x - 1.0;\n\tif (point.y < 0.0) dy = -point.y;\n\tif (point.y > 1.0) dy = point.y - 1.0;\n\tif ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);\n\treturn min(dx, dy);\n}\n\nvec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)\n{\n\tfloat hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);\n\tvec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);\n\tif (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))\n\t{\n\t  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\treturn texture2D(to, texCoord);\n\t}\n\n\tif (yc > 0.0) return texture2D(from, p);\n\n\tvec4 color = texture2D(from, point.xy);\n\tvec4 tcolor = vec4(0.0);\n\n\treturn antiAlias(color, tcolor, distanceToEdge(point));\n}\n\nvec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)\n{\n\tfloat shadow = distanceToEdge(point) * 30.0;\n\tshadow = (1.0 - shadow) / 3.0;\n\n\tif (shadow < 0.0) shadow = 0.0; else shadow *= amount;\n\n\tvec4 shadowColor = seeThrough(yc, p, rotation, rrotation);\n\tshadowColor.r -= shadow;\n\tshadowColor.g -= shadow;\n\tshadowColor.b -= shadow;\n\n\treturn shadowColor;\n}\n\nvec4 backside(float yc, vec3 point)\n{\n\tvec4 color = texture2D(from, point.xy);\n\tfloat gray = (color.r + color.b + color.g) / 15.0;\n\tgray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));\n\tcolor.rgb = vec3(gray);\n\treturn color;\n}\n\nvec4 behindSurface(float yc, vec3 point, mat3 rrotation)\n{\n\tfloat shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;\n\tshado *= 1.0 - abs(point.x - 0.5);\n\n\tyc = (-cylinderRadius - cylinderRadius - yc);\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))\n\t{\n\t\tshado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0));\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t}\n\telse\n\t{\n\t\tshado = 0.0;\n\t}\n\t\n\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n\treturn vec4(texture2D(to, texCoord).rgb - shado, 1.0);\n}\n\nvoid main()\n{\n  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n  \n  const float angle = 100.0 * PI / 180.0;\n\tfloat c = cos(-angle);\n\tfloat s = sin(-angle);\n\n\tmat3 rotation = mat3( c, s, 0,\n\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t-0.801, 0.8900, 1\n\t\t\t\t\t\t\t\t);\n\tc = cos(angle);\n\ts = sin(angle);\n\n\tmat3 rrotation = mat3(\tc, s, 0,\n\t\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t\t0.98500, 0.985, 1\n\t\t\t\t\t\t\t\t);\n\n\tvec3 point = rotation * vec3(texCoord, 1.0);\n\n\tfloat yc = point.y - cylinderCenter;\n\n\tif (yc < -cylinderRadius)\n\t{\n\t\t// Behind surface\n\t\tgl_FragColor = behindSurface(yc, point, rrotation);\n\t\treturn;\n\t}\n\n\tif (yc > cylinderRadius)\n\t{\n\t\t// Flat surface\n\t\tgl_FragColor = texture2D(from, texCoord);\n\t\treturn;\n\t}\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\n\tfloat hitAngleMod = mod(hitAngle, 2.0 * PI);\n\tif ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))\n\t{\n\t\tgl_FragColor = seeThrough(yc, texCoord, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)\n\t{\n\t\tgl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tvec4 color = backside(yc, point);\n\n\tvec4 otherColor;\n\tif (yc < 0.0)\n\t{\n\t\tfloat shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t\totherColor = vec4(0.0, 0.0, 0.0, shado);\n\t}\n\telse\n\t{\n\t\totherColor = texture2D(from, texCoord);\n\t}\n\n\tcolor = antiAlias(color, otherColor, cylinderRadius - abs(yc));\n\n\tvec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\tfloat dist = distanceToEdge(point);\n\n\tgl_FragColor = antiAlias(color, cl, dist);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/b1ed2b9c435ed6d4b18c8b9fda6e4352",
  "created_at" : "2016-09-21T06:37:01Z",
  "updated_at" : "2016-09-21T12:08:38Z",
  "stars" : 0.0
}, {
  "id" : "5a66e633d36532aa4743a73d20f20304",
  "name" : "water_drop",
  "owner" : "PawelPlociennik",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float amplitude;\nuniform float speed;\n \nvoid main()\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 dir = p - vec2(.5);\n  float dist = length(dir);\n\n  if (dist > progress) {\n    gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);\n  } else {\n    vec2 offset = dir * sin(dist * amplitude - progress * speed);\n    gl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), progress);\n  }\n}",
  "uniforms" : {
    "amplitude" : 30.0,
    "speed" : 30.0
  },
  "html_url" : "https://gist.github.com/5a66e633d36532aa4743a73d20f20304",
  "created_at" : "2016-09-16T10:24:45Z",
  "updated_at" : "2016-09-16T12:35:36Z",
  "stars" : 0.0
}, {
  "id" : "597954724feda999b2cf2b5518d3edec",
  "name" : "StereoViewer Toy",
  "owner" : "tschundler",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Tunable parameters\nuniform float zoom;  // How much to zoom (out) for the effect ~ 0.5 - 1.0\nuniform float corner_radius;  // Corner radius as a fraction of the image height\n\n///////////////////////////////////////////////////////////////////////////////\n// Stereo Viewer Toy Transition by Ted Schundler                             //\n// BSD License: Free for use and modification by anyone with credit          //\n//                                                                           //\n// Inspired by ViewMaster / Image3D image viewer devices.                    //\n// This effect is similar to what you see when you press the device's lever. //\n// There is a quick zoom in / out to make the transition \"valid\" for GLSL.io //\n///////////////////////////////////////////////////////////////////////////////\n\nconst vec4 black = vec4(0.0, 0.0, 0.0, 1.0);\nconst vec2 c00 = vec2(0.0, 0.0); // the four corner points\nconst vec2 c01 = vec2(0.0, 1.0);\nconst vec2 c11 = vec2(1.0, 1.0);\nconst vec2 c10 = vec2(1.0, 0.0);\n\n// Check if a point is within a given corner\nbool in_corner(vec2 p, vec2 corner, vec2 radius) {\n  // determine the direction we want to be filled\n  vec2 axis = (c11 - corner) - corner;\n\n  // warp the point so we are always testing the bottom left point with the\n  // circle centered on the origin\n  p = p - (corner + axis * radius);\n  p *= axis / radius;\n  return (p.x > 0.0 && p.y > -1.0) || (p.y > 0.0 && p.x > -1.0) || dot(p, p) < 1.0;\n}\n\n// Check all four corners\n// return a float for v2 for anti-aliasing?\nbool test_rounded_mask(vec2 p, vec2 corner_size) {\n  return\n      in_corner(p, c00, corner_size) &&\n      in_corner(p, c01, corner_size) &&\n      in_corner(p, c10, corner_size) &&\n      in_corner(p, c11, corner_size);\n}\n\n// Screen blend mode - https://en.wikipedia.org/wiki/Blend_modes\n// This more closely approximates what you see than linear blending\nvec4 screen(vec4 a, vec4 b) {\n  return 1.0 - (1.0 - a) * (1.0 -b);\n}\n\n// Given RGBA, find a value that when screened with itself\n// will yield the original value.\nvec4 unscreen(vec4 c) {\n  return 1.0 - sqrt(1.0 - c);\n}\n\n// Grab a pixel, only if it isn't masked out by the rounded corners\nvec4 sample_with_corners(sampler2D tex, vec2 p, vec2 corner_size) {\n  p = (p - 0.5) / zoom + 0.5;\n  if (!test_rounded_mask(p, corner_size)) {\n    return black;\n  }\n  return unscreen(texture2D(tex, p));\n}\n\n// special sampling used when zooming - extra zoom parameter and don't unscreen\nvec4 simple_sample_with_corners(sampler2D tex, vec2 p, vec2 corner_size, float zoom_amt) {\n  p = (p - 0.5) / (1.0 - zoom_amt + zoom * zoom_amt) + 0.5;\n  if (!test_rounded_mask(p, corner_size)) {\n    return black;\n  }\n  return texture2D(tex, p);\n}\n\n// Basic 2D affine transform matrix helpers\n// These really shouldn't be used in a fragment shader - I should work out the\n// the math for a translate & rotate function as a pair of dot products instead\n\nmat3 rotate2d(float angle, float aspect) {\n  float s = sin(angle);\n  float c = cos(angle);\n  return mat3(\n    c, s ,0.0,\n    -s, c, 0.0,\n    0.0, 0.0, 1.0);\n}\n\nmat3 translate2d(float x, float y) {\n  return mat3(\n    1.0, 0.0, 0,\n    0.0, 1.0, 0,\n    -x, -y, 1.0);\n}\n\nmat3 scale2d(float x, float y) {\n  return mat3(\n    x, 0.0, 0,\n    0.0, y, 0,\n    0, 0, 1.0);\n}\n\n// Split an image and rotate one up and one down along off screen pivot points\nvec4 get_cross_rotated(vec3 p3, float angle, vec2 corner_size, float aspect) {\n  angle = angle * angle; // easing\n  angle /= 2.4; // works out to be a good number of radians\n\n  mat3 center_and_scale = translate2d(-0.5, -0.5) * scale2d(1.0, aspect);\n  mat3 unscale_and_uncenter = scale2d(1.0, 1.0/aspect) * translate2d(0.5,0.5);\n  mat3 slide_left = translate2d(-2.0,0.0);\n  mat3 slide_right = translate2d(2.0,0.0);\n  mat3 rotate = rotate2d(angle, aspect);\n\n  mat3 op_a = center_and_scale * slide_right * rotate * slide_left * unscale_and_uncenter;\n  mat3 op_b = center_and_scale * slide_left * rotate * slide_right * unscale_and_uncenter;\n\n  vec4 a = sample_with_corners(from, (op_a * p3).xy, corner_size);\n  vec4 b = sample_with_corners(from, (op_b * p3).xy, corner_size);\n\n  return screen(a, b);\n}\n\n// Image stays put, but this time move two masks\nvec4 get_cross_masked(vec3 p3, float angle, vec2 corner_size, float aspect) {\n  angle = 1.0 - angle;\n  angle = angle * angle; // easing\n  angle /= 2.4;\n\n  vec4 img;\n\n  mat3 center_and_scale = translate2d(-0.5, -0.5) * scale2d(1.0, aspect);\n  mat3 unscale_and_uncenter = scale2d(1.0 / zoom, 1.0 / (zoom * aspect)) * translate2d(0.5,0.5);\n  mat3 slide_left = translate2d(-2.0,0.0);\n  mat3 slide_right = translate2d(2.0,0.0);\n  mat3 rotate = rotate2d(angle, aspect);\n\n  mat3 op_a = center_and_scale * slide_right * rotate * slide_left * unscale_and_uncenter;\n  mat3 op_b = center_and_scale * slide_left * rotate * slide_right * unscale_and_uncenter;\n\n  bool mask_a = test_rounded_mask((op_a * p3).xy, corner_size);\n  bool mask_b = test_rounded_mask((op_b * p3).xy, corner_size);\n\n  if (mask_a || mask_b) {\n    img = sample_with_corners(to, p3.xy, corner_size);\n    return screen(mask_a ? img : black, mask_b ? img : black);\n  } else {\n    return black;\n  }\n}\n\nvoid main() {\n  float a;\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec3 p3 = vec3(p.xy, 1.0); // for 2D matrix transforms\n\n  float aspect = resolution.x / resolution.y;\n  // corner is warped to represent to size after mapping to 1.0, 1.0\n  vec2 corner_size = vec2(corner_radius / aspect, corner_radius);\n\n  if (progress <= 0.0) {\n    // 0.0: start with the base frame always\n    gl_FragColor = texture2D(from, p);\n  } else if (progress < 0.1) {\n    // 0.0-0.1: zoom out and add rounded corners\n    a = progress / 0.1;\n    gl_FragColor = simple_sample_with_corners(from, p, corner_size * a, a);\n  } else if (progress < 0.48) {\n    // 0.1-0.48: Split original image apart\n    a = (progress - 0.1)/0.38;\n    gl_FragColor = get_cross_rotated(p3, a, corner_size, aspect);\n  } else if (progress < 0.9) {\n    // 0.48-0.52: black\n    // 0.52 - 0.9: unmask new image\n    gl_FragColor = get_cross_masked(p3, (progress - 0.52)/0.38, corner_size, aspect);\n  } else if (progress < 1.0) {\n    // zoom out and add rounded corners\n    a = (1.0 - progress) / 0.1;\n    gl_FragColor = simple_sample_with_corners(to, p, corner_size * a, a);\n  } else {\n    // 1.0 end with base frame\n    gl_FragColor = texture2D(to, p);\n  }\n}",
  "uniforms" : {
    "zoom" : 0.88,
    "corner_radius" : 0.22
  },
  "html_url" : "https://gist.github.com/597954724feda999b2cf2b5518d3edec",
  "created_at" : "2016-08-30T01:49:23Z",
  "updated_at" : "2016-08-30T07:27:55Z",
  "stars" : 1.0
}, {
  "id" : "ad095dac1054de1c796418f992f0f8a0",
  "name" : "wipeUp",
  "owner" : "homerjam",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 a = texture2D(from, p);\n  vec4 b = texture2D(to, p);\n  gl_FragColor = mix(a, b, step(0.0 + p.y, progress));\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/ad095dac1054de1c796418f992f0f8a0",
  "created_at" : "2016-07-29T13:49:32Z",
  "updated_at" : "2016-07-29T13:52:55Z",
  "stars" : 0.0
}, {
  "id" : "f63e3009c1143950dee9063c3b83fb88",
  "name" : "Circle Crop",
  "owner" : "fkuteken",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nfloat maxRadius = resolution.x + resolution.y;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  float distX = gl_FragCoord.x - resolution.x / 2.0;\n  float distY = gl_FragCoord.y - resolution.y / 2.0;\n  float dist = sqrt(distX * distX + distY * distY);\n  \n  float step = 2.0 * abs(progress - 0.5);\n  step = step * step * step;\n  \n  if (dist < step * maxRadius)\n  {\n    if (progress < 0.5)\n      gl_FragColor = texture2D(from, p);\n    else\n      gl_FragColor = texture2D(to, p);\n  }\n  else\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/f63e3009c1143950dee9063c3b83fb88",
  "created_at" : "2016-07-12T18:04:53Z",
  "updated_at" : "2016-07-12T19:07:57Z",
  "stars" : 0.0
}, {
  "id" : "1ff3305d7f290c306d52c3450b101a25",
  "name" : "Reveal",
  "owner" : "naso",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D to, from;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 a = texture2D(from, p); //vec4(0.0, 0.0, 0.0, 0.0);\n  vec4 b = texture2D(to, p);\n  gl_FragColor = mix(a, b, step(1.0 - p.x, progress));\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/1ff3305d7f290c306d52c3450b101a25",
  "created_at" : "2016-07-08T10:32:51Z",
  "updated_at" : "2016-07-08T14:15:31Z",
  "stars" : 1.0
}, {
  "id" : "714f095318834f4d2375de872c53af1e",
  "name" : "PuzzleRight",
  "owner" : "JustKirillS",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform ivec2 size;\nuniform float pause;\nuniform float dividerSize;\n\nconst vec4 dividerColor = vec4(0.0, 0.0, 0.0, 1.0);\nconst float randomOffset = 0.1;\n \nfloat rand (vec2 co) {\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nfloat getDelta(vec2 p) {\n  vec2 rectanglePos = floor(vec2(size) * p);\n  vec2 rectangleSize = vec2(1.0 / vec2(size).x, 1.0 / vec2(size).y);\n  \n  float top = rectangleSize.y * (rectanglePos.y + 1.0);\n  float bottom = rectangleSize.y * rectanglePos.y;\n  float left = rectangleSize.x * rectanglePos.x;\n  float right = rectangleSize.x * (rectanglePos.x + 1.0);\n  \n  float minX = min(abs(p.x - left), abs(p.x - right));\n  float minY = min(abs(p.y - top), abs(p.y - bottom));\n  return min(minX, minY);\n}\n\nfloat getDividerSize() {\n  vec2 rectangleSize = vec2(1.0 / vec2(size).x, 1.0 / vec2(size).y);\n  return min(rectangleSize.x, rectangleSize.y) * dividerSize;\n}\n\nvoid showDivider (vec2 p) {\n  float currentProg = progress / pause;\n\n  float a = 1.0;\n  if(getDelta(p) < getDividerSize()) {\n    a = 1.0 - currentProg;\n  }\n  \n  gl_FragColor = mix(dividerColor, texture2D(from, p), a);\n}\n\nvoid hideDivider (vec2 p) {\n  float currentProg = (progress - 1.0 + pause) / pause;\n  \n  float a = 1.0;\n  if(getDelta(p) < getDividerSize()) {\n    a = currentProg;\n  }\n\n  gl_FragColor = mix(dividerColor, texture2D(to, p), a);\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  if(progress < pause) {\n    showDivider(p);\n  } else if(progress < 1.0 - pause){\n    if(getDelta(p) < getDividerSize()) {\n      gl_FragColor = dividerColor;\n    } else {\n      float currentProg = (progress - pause) / (1.0 - pause * 2.0);\n      vec2 q = p;\n      vec2 rectanglePos = floor(vec2(size) * q);\n      \n      float r = rand(rectanglePos) - randomOffset;\n      float cp = smoothstep(0.0, 1.0 - r, currentProg);\n    \n      float rectangleSize = 1.0 / vec2(size).x;\n      float delta = rectanglePos.x * rectangleSize;\n      float offset = rectangleSize / 2.0 + delta;\n      \n      p.x = (p.x - offset)/abs(cp - 0.5)*0.5 + offset;\n      vec4 a = texture2D(from, p);\n      vec4 b = texture2D(to, p);\n      \n      float s = step(abs(vec2(size).x * (q.x - delta) - 0.5), abs(cp - 0.5));\n      gl_FragColor = vec4(mix(b, a, step(cp, 0.5)).rgb * s, 1.0);\n    }\n  } else {\n    hideDivider(p);\n  }\n}",
  "uniforms" : {
    "size" : [ 4.0, 4.0 ],
    "pause" : 0.1,
    "dividerSize" : 0.05
  },
  "html_url" : "https://gist.github.com/714f095318834f4d2375de872c53af1e",
  "created_at" : "2016-06-10T13:20:09Z",
  "updated_at" : "2016-06-12T10:17:38Z",
  "stars" : 0.0
}, {
  "id" : "9b7cce648a1cd777c6a3206bce7cd814",
  "name" : "warpfade",
  "owner" : "peterekepeter",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  float x = progress;\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  x=smoothstep(.0,1.0,(x*2.0+p.x-1.0));\n  gl_FragColor = mix(texture2D(from, (p-.5)*(1.-x)+.5), texture2D(to, (p-.5)*x+.5), progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/9b7cce648a1cd777c6a3206bce7cd814",
  "created_at" : "2016-05-05T09:57:57Z",
  "updated_at" : "2016-05-05T09:58:11Z",
  "stars" : 0.0
}, {
  "id" : "ae64014bc78e4ed8cf05",
  "name" : "Film burn",
  "owner" : "AnastasiaDunbar",
  "glsl" : "/*paint.glsl\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nuniform sampler2D  a;\nconst int waves = 4;\nfloat random (float x) {\n    return fract(sin(x)*1e4);\n}\nfloat paint(vec2 p, float sharp) {\n  float f = 0.;\n  for (float i = 0.; i < float(waves); i++) {\n    f += sin((p.x*mix(1.,7.,random(i))*5.)+random(i+4.2)+(progress*8.)+cos(progress*i*2.))*random(i+.53);\n  }\n  f /= float(waves)+4.;\n  f = clamp((f+((p.y-2.)+(progress*3.)))*sharp,0.,1.);\n  return f;\n}\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  //mix(texture2D(from, p), texture2D(to, p), progress)\n  float esp = 0.01;\n  float s = (paint(p-esp,20.)-paint(p,15.))*.4;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), paint(p,50.))+s;\n}\n*/\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nuniform float FPS;\nuniform float Seed;\n#define progress (floor(progress*FPS)/(FPS+1.))\nfloat sigmoid(float x, float a) {\n    float b = pow(x*2.,a)/2.;\n    if (x > .5) {\n        b = 1.-pow(2.-(x*2.),a)/2.;\n    }\n\treturn b;\n}\nfloat rand(float co){\n    return fract(sin((co*24.9898)+Seed)*43758.5453);\n}\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\nfloat apow(float a,float b) { return pow(abs(a),b)*sign(b); }\nvec3 pow3(vec3 a,vec3 b) { return vec3(apow(a.r,b.r),apow(a.g,b.g),apow(a.b,b.b)); }\nfloat smooth_mix(float a,float b,float c) { return mix(a,b,sigmoid(c,2.)); }\nfloat random(vec2 co, float shft){\n    co += 10.;\n    return smooth_mix(fract(sin(dot(co.xy ,vec2(12.9898+(floor(shft)*.5),78.233+Seed))) * 43758.5453),fract(sin(dot(co.xy ,vec2(12.9898+(floor(shft+1.)*.5),78.233+Seed))) * 43758.5453),fract(shft));\n}\nfloat smooth_random(vec2 co, float shft) {\n\treturn smooth_mix(smooth_mix(random(floor(co),shft),random(floor(co+vec2(1.,0.)),shft),fract(co.x)),smooth_mix(random(floor(co+vec2(0.,1.)),shft),random(floor(co+vec2(1.,1.)),shft),fract(co.x)),fract(co.y));\n}\nvec4 texture(vec2 p) {\n    return mix(texture2D(from, p), texture2D(to, p), sigmoid(progress,10.));\n}\n#define pi 3.14159265358979323\n#define clamps(x) clamp(x,0.,1.)\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec3 f = vec3(0.);\n  for (float i = 0.; i < 13.; i++) {\n    f += sin(((p.x*rand(i)*6.)+(progress*8.))+rand(i+1.43))*sin(((p.y*rand(i+4.4)*6.)+(progress*6.))+rand(i+2.4));\n    f += 1.-clamps(length(p-vec2(smooth_random(vec2(progress*1.3),i+1.),smooth_random(vec2(progress*.5),i+6.25)))*mix(20.,70.,rand(i)));\n  }\n  f += 4.;\n  f /= 11.;\n  f = pow3(f*vec3(1.,0.7,0.6),vec3(1.,2.-sin(progress*pi),1.3));\n  f *= sin(progress*pi);\n  \n  p -= .5;\n  p *= 1.+(smooth_random(vec2(progress*5.),6.3)*sin(progress*pi)*.05);\n  p += .5;\n  \n  vec4 blurred_image = vec4(0.);\n  float bluramount = sin(progress*pi)*.03;\n  #define repeats 50.\n  for (float i = 0.; i < repeats; i++) { \n      vec2 q = vec2(cos(degrees((i/repeats)*360.)),sin(degrees((i/repeats)*360.))) *  (rand(vec2(i,p.x+p.y))+bluramount); \n      vec2 uv2 = p+(q*bluramount);\n      blurred_image += texture(uv2);\n  }\n  blurred_image /= repeats;\n  \n  gl_FragColor = blurred_image+vec4(f,0.);\n}",
  "uniforms" : {
    "FPS" : 40.0,
    "Seed" : 2.31
  },
  "html_url" : "https://gist.github.com/ae64014bc78e4ed8cf05",
  "created_at" : "2016-03-28T20:38:00Z",
  "updated_at" : "2016-04-04T05:00:09Z",
  "stars" : 0.0
}, {
  "id" : "e8c83080a16cd38781f7",
  "name" : "luminance melt",
  "owner" : "0gust1",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n//My own first transition — based on crosshatch code (from pthrasher), using  simplex noise formula (copied and pasted)\n//-> cooler with high contrasted images (isolated dark subject on light background f.e.)\n//TODO : try to rebase it on DoomTransition (from zeh)?\n//optimizations :\n//luminance (see http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color#answer-596241)\n// Y = (R+R+B+G+G+G)/6\n//or Y = (R+R+R+B+G+G+G+G)>>3 \n\nuniform bool direction; // direction of movement :  0 : up, 1, down\nuniform float l_threshold; //luminance threshold\nuniform bool above; // does the movement takes effect above or below luminance threshold ?\n\n\n//Random function borrowed from everywhere\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n\n// Simplex noise :\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n// \n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n\t\t+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n// Simplex noise -- end\n\nfloat luminance(vec4 color){\n  //(0.299*R + 0.587*G + 0.114*B)\n  return color.r*0.299+color.g*0.587+color.b*0.114;\n}\n\nvec2 center = vec2(1.0, direction);\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  if (progress == 0.0) {\n    gl_FragColor = texture2D(from, p);\n  } else if (progress == 1.0) {\n    gl_FragColor = texture2D(to, p);\n  } else {\n    float x = progress;\n    float dist = distance(center, p)- progress*exp(snoise(vec2(p.x, 0.0)));\n    float r = x - rand(vec2(p.x, 0.1));\n    float m;\n    if(above){\n     m = dist <= r && luminance(texture2D(from, p))>l_threshold ? 1.0 : (progress*progress*progress);\n    }\n    else{\n     m = dist <= r && luminance(texture2D(from, p))<l_threshold ? 1.0 : (progress*progress*progress);  \n    }\n    gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);    \n  }\n}",
  "uniforms" : {
    "direction" : true,
    "l_threshold" : 0.5,
    "above" : false
  },
  "html_url" : "https://gist.github.com/e8c83080a16cd38781f7",
  "created_at" : "2016-01-20T12:38:28Z",
  "updated_at" : "2017-03-10T19:28:03Z",
  "stars" : 0.0
}, {
  "id" : "948e99b1800e81ad909a",
  "name" : "Atmospheric Slideshow",
  "owner" : "dycm8009",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvec2 zoom(vec2 uv, float amount)\n{\n  return 0.5 + ((uv - 0.5) * amount);\t\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;\n  float pro = progress / 0.8;\n  float z = (pro) * 0.2;\n  float t = 0.0;\n  if (pro > 1.0)\n  {\n    z = 0.2 + (pro - 1.0) * 5.;\n    t = clamp((progress - 0.8) / 0.07,0.0,1.0);\n  }\n  if (length(r) < 0.5+z)\n  {\n      //uv = zoom(uv, 0.9 - 0.1 * pro);\n  }\n  else if (length(r) < 0.8+z*1.5)\n  {\n      uv = zoom(uv, 1.0 - 0.15 * pro);\n      t = t * 0.5;\n  }\n  else if (length(r) < 1.2+z*2.5)\n  {\n      uv = zoom(uv, 1.0 - 0.2 * pro);\n      t = t * 0.2;\n  }\n  else\n      uv = zoom(uv, 1.0 - 0.25 * pro);\n  gl_FragColor = mix(texture2D(from, uv), texture2D(to, uv), t);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/948e99b1800e81ad909a",
  "created_at" : "2016-01-15T03:10:25Z",
  "updated_at" : "2016-01-15T03:11:20Z",
  "stars" : 0.0
}, {
  "id" : "c08c1995cb370520f251",
  "name" : "Bounce",
  "owner" : "adrian-purser",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nuniform float bounce;\nuniform float shadow;\nuniform vec4  shadow_colour;\n\n\nvoid main() \n{\n  vec2  p = gl_FragCoord.xy / resolution.xy;\n\n  float phase = progress * 3.14159265358 * bounce;\n  \n  float y = (abs(cos(phase))) * (1.0-sin(progress * (3.14159265358/2.0)));\n\n  if(progress == 0.0)\n    gl_FragColor = texture2D(from,p);\n  else if(p.y < y)\n  {\n    float d = y - p.y;\n    if(d>shadow)\n      gl_FragColor = texture2D(from,p);\n    else\n    {\n      float a = ((d/shadow)*shadow_colour.a) + (1.0-shadow_colour.a);\n      gl_FragColor = mix(shadow_colour,texture2D(from,p),a);\n    }\n  }\n  else\n    gl_FragColor = texture2D(to,vec2(p.x,p.y-y));\n  \n}",
  "uniforms" : {
    "bounce" : 2.5,
    "shadow" : 0.075,
    "shadow_colour" : [ 0.0, 0.0, 0.0, 0.8 ]
  },
  "html_url" : "https://gist.github.com/c08c1995cb370520f251",
  "created_at" : "2015-12-18T16:30:58Z",
  "updated_at" : "2016-03-20T23:09:47Z",
  "stars" : 1.0
}, {
  "id" : "1f6e25d1075bb82e21db",
  "name" : "Blur",
  "owner" : "giangchau92",
  "glsl" : "// goto https://glsl.io/transition/206b96128ad6085f9911 and paste\n#ifdef GL_ES\nprecision highp float;\n#endif\n \n#define QUALITY 32\n#define N 20\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform float size;\n \nconst float GOLDEN_ANGLE = 2.399963229728653; // PI * (3.0 - sqrt(5.0))\n \nvec4 blur(sampler2D t, vec2 c, float radius) {\n  vec4 sum = vec4(0.0);\n  float q = float(QUALITY);\n  // Using a \"spiral\" to propagate points.\n  for (int i=0; i<QUALITY; ++i) {\n    float fi = float(i);\n    float a = fi * GOLDEN_ANGLE;\n    float r = sqrt(fi / q) * radius;\n    vec2 p = c + r * vec2(cos(a), sin(a));\n    sum += texture2D(t, p);\n  }\n  return sum / q;\n}\n\nvec4 blur2(sampler2D t, vec2 p)\n{\n  vec4 sum = vec4(0.0);\n  int count = 0;\n  vec2 delta = vec2(1.0, 1.0) / resolution.xy;\n  for (int i=-N; i < N; i++)\n  {\n    for (int j = -N; j < N; j++)\n    {\n      vec2 uv;\n      uv.x = p.x + float(i) * delta.x;\n      uv.y = p.y + float(j) * delta.y;\n      sum += texture2D(t, uv);\n      count ++;\n    }\n  }\n  return sum / float(count);\n}\n \nvoid main()\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  //gl_FragColor = blur(from, p, 0.01);\n  gl_FragColor = blur2(from, p);\n}",
  "uniforms" : {
    "size" : 0.0
  },
  "html_url" : "https://gist.github.com/1f6e25d1075bb82e21db",
  "created_at" : "2015-05-03T16:04:27Z",
  "updated_at" : "2015-08-29T14:20:28Z",
  "stars" : 0.0
}, {
  "id" : "1b4862e4e2050a3abebe",
  "name" : "glitch displace",
  "owner" : "mattdesl",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nhighp float random(vec2 co)\n{\n    highp float a = 12.9898;\n    highp float b = 78.233;\n    highp float c = 43758.5453;\n    highp float dt= dot(co.xy ,vec2(a,b));\n    highp float sn= mod(dt,3.14);\n    return fract(sin(sn) * c);\n}\nfloat voronoi( in vec2 x ) {\n    vec2 p = floor( x );\n    vec2 f = fract( x );\n    float res = 8.0;\n    for( float j=-1.; j<=1.; j++ )\n    for( float i=-1.; i<=1.; i++ ) {\n        vec2  b = vec2( i, j );\n        vec2  r = b - f + random( p + b );\n        float d = dot( r, r );\n        res = min( res, d );\n    }\n    return sqrt( res );\n}\n\nvec2 displace(vec4 tex, vec2 texCoord, float dotDepth, float textureDepth, float strength) {\n    float b = voronoi(.003 * texCoord + 2.0);\n    float g = voronoi(0.2 * texCoord);\n    float r = voronoi(texCoord - 1.0);\n    vec4 dt = tex * 1.0;\n    vec4 dis = dt * dotDepth + 1.0 - tex * textureDepth;\n\n    dis.x = dis.x - 1.0 + textureDepth*dotDepth;\n    dis.y = dis.y - 1.0 + textureDepth*dotDepth;\n    dis.x *= strength;\n    dis.y *= strength;\n    vec2 res_uv = texCoord ;\n    res_uv.x = res_uv.x + dis.x - 0.0;\n    res_uv.y = res_uv.y + dis.y;\n    return res_uv;\n}\n\nfloat ease1(float t) {\n  return t == 0.0 || t == 1.0\n    ? t\n    : t < 0.5\n      ? +0.5 * pow(2.0, (20.0 * t) - 10.0)\n      : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;\n}\nfloat ease2(float t) {\n  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);\n}\n\n\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 color1 = texture2D(from, p);\n  vec4 color2 = texture2D(to, p);\n  vec2 disp = displace(color1, p, 0.33, 0.7, 1.0-ease1(progress));\n  vec2 disp2 = displace(color2, p, 0.33, 0.5, ease2(progress));\n  vec4 dColor1 = texture2D(to, disp);\n  vec4 dColor2 = texture2D(from, disp2);\n  float val = ease1(progress);\n  vec3 gray = vec3(dot(min(dColor2, dColor1).rgb, vec3(0.299, 0.587, 0.114)));\n  dColor2 = vec4(gray, 1.0);\n  dColor2 *= 2.0;\n  color1 = mix(color1, dColor2, smoothstep(0.0, 0.5, progress));\n  color2 = mix(color2, dColor1, smoothstep(1.0, 0.5, progress));\n  gl_FragColor = mix(color1, color2, val);\n  //gl_FragColor = mix(gl_FragColor, dColor, smoothstep(0.0, 0.5, progress));\n  \n   //gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/1b4862e4e2050a3abebe",
  "created_at" : "2015-01-15T19:48:03Z",
  "updated_at" : "2016-10-06T09:25:19Z",
  "stars" : 2.0
}, {
  "id" : "04fd9a7de4012cbb03f6",
  "name" : "crosshatch",
  "owner" : "pthrasher",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nconst vec2 center = vec2(0.5, 0.5);\n\nfloat quadraticInOut(float t) {\n  float p = 2.0 * t * t;\n  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;\n}\n\n// borrowed from wind.\n// https://glsl.io/transition/7de3f4b9482d2b0bf7bb\nfloat rand(vec2 co) {\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  if (progress == 0.0) {\n    gl_FragColor = texture2D(from, p);\n  } else if (progress == 1.0) {\n    gl_FragColor = texture2D(to, p);\n  } else {\n    float x = progress;\n    float dist = distance(center, p);\n    float r = x - min(rand(vec2(p.y, 0.0)), rand(vec2(0.0, p.x)));\n    float m = dist <= r ? 1.0 : 0.0;\n    gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);    \n  }\n  \n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/04fd9a7de4012cbb03f6",
  "created_at" : "2014-12-17T03:04:51Z",
  "updated_at" : "2015-08-29T14:11:34Z",
  "stars" : 1.0
}, {
  "id" : "8e6226b215548ba12734",
  "name" : "undulating burn out",
  "owner" : "pthrasher",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n\n#define \tM_PI   3.14159265358979323846\t/* pi */\n\n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float smoothness;\nconst vec2 center = vec2(0.5, 0.5);\n\nfloat quadraticInOut(float t) {\n  float p = 2.0 * t * t;\n  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;\n}\n\nfloat linearInterp(vec2 range, vec2 domain, float x) {\n  return mix(range.x, range.y, smoothstep(domain.x, domain.y, clamp(x, domain.x, domain.y)));\n}\n\nfloat getGradient(float r, float dist) {\n  float grad = smoothstep(-smoothness, 0.0, r - dist * (1.0 + smoothness)); //, 0.0, 1.0);\n  if (r - dist < 0.005 && r - dist > -0.005) {\n    return -1.0;\n  } else if (r - dist < 0.01 && r - dist > -0.005) {\n   return -2.0;\n  }\n  return grad;\n}\n\nfloat round(float a) {\n  return floor(a + 0.5);\n}\n\nfloat getWave(vec2 p){\n  \n  // I'd really like to figure out how to make the ends meet on my circle.\n  // The left side is where the ends don't meet.\n  \n  vec2 _p = p - center; // offset from center\n  float rads = atan(_p.y, _p.x);\n  float degs = degrees(rads) + 180.0;\n  vec2 range = vec2(0.0, M_PI * 30.0);\n  vec2 domain = vec2(0.0, 360.0);\n  \n  float ratio = (M_PI * 30.0) / 360.0;\n  //degs = linearInterp(range, domain, degs);\n  degs = degs * ratio;\n  float x = progress;\n  float magnitude = mix(0.02, 0.09, smoothstep(0.0, 1.0, x));\n  float offset = mix(40.0, 30.0, smoothstep(0.0, 1.0, x));\n  float ease_degs = quadraticInOut(sin(degs));\n  \n  float deg_wave_pos = (ease_degs * magnitude) * sin(x * offset);\n  return x + deg_wave_pos;\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  if (progress == 0.0) {\n    gl_FragColor = texture2D(from, p);\n  } else if (progress == 1.0) {\n    gl_FragColor = texture2D(to, p);\n  } else {\n    float dist = distance(center, p);\n    float m = getGradient(getWave(p), dist);\n    if (m == -2.0) {\n      //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n      //gl_FragColor = mix(texture2D(from, p), texture2D(to, p), -1.0);\n      gl_FragColor = mix(texture2D(from, p), vec4(0.0, 0.0, 0.0, 1.0), 0.75);\n    } else {\n      gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);    \n    }\n  }\n  \n}",
  "uniforms" : {
    "smoothness" : 0.02
  },
  "html_url" : "https://gist.github.com/8e6226b215548ba12734",
  "created_at" : "2014-12-16T23:01:57Z",
  "updated_at" : "2015-08-29T14:11:34Z",
  "stars" : 2.0
}, {
  "id" : "d1f891c5585fc40b55ea",
  "name" : "Star Wipe",
  "owner" : "MemoryStomp",
  "glsl" : "// Why eat hamburger when you can have steak?\n// https://www.youtube.com/watch?v=lfgVMk36-Ek\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvec2 circlePoint( float ang )\n{\n  ang += 6.28318 * 0.15;\n  return vec2( cos(ang), sin(ang) );  \n}\n\nfloat cross2d( vec2 a, vec2 b )\n{\n  return ( a.x * b.y - a.y * b.x );\n}\n\n// quickly knocked together with some math from http://www.pixeleuphoria.com/node/30\nfloat star( vec2 p, float size )\n{\n  if( size <= 0.0 )\n  {\n    return 0.0;\n  }\n  p /= size;\n  \n  vec2 p0 = circlePoint( 0.0 );\n  vec2 p1 = circlePoint( 6.28318 * 1.0 / 5.0 );\n  vec2 p2 = circlePoint( 6.28318 * 2.0 / 5.0 );\n  vec2 p3 = circlePoint( 6.28318 * 3.0 / 5.0 );\n  vec2 p4 = circlePoint( 6.28318 * 4.0 / 5.0 );\n  \n  // are we on this side of the line\n  float s0 = ( cross2d( p1 - p0, p - p0 ) );\n  float s1 = ( cross2d( p2 - p1, p - p1 ) );\n  float s2 = ( cross2d( p3 - p2, p - p2 ) );\n  float s3 = ( cross2d( p4 - p3, p - p3 ) );\n  float s4 = ( cross2d( p0 - p4, p - p4 ) );\n  \n  // some trial and error math to get the star shape.  I'm sure there's some elegance I'm missing.\n  float s5 = min( min( min( s0, s1 ), min( s2, s3 ) ), s4 );\n  float s = max( 1.0 - sign( s0 * s1 * s2 * s3 * s4 ) + sign(s5), 0.0 );\n  s = sign( 2.6 - length(p) ) * s;\n  \n  return max( s, 0.0 );\n}\n\nvoid main() \n{\n  vec2 p = ( gl_FragCoord.xy / resolution.xy );\n  vec2 o = p * 2.0 - 1.0;\n  \n  float t = progress * 1.4;\n  \n  float c1 = star( o, t );\n  float c2 = star( o, t - 0.1 );\n  \n  float border = max( c1 - c2, 0.0 );\n  \n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), c1) + vec4( border, border, border, 0.0 );\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/d1f891c5585fc40b55ea",
  "created_at" : "2014-07-01T06:58:45Z",
  "updated_at" : "2015-08-29T14:03:17Z",
  "stars" : 0.0
}, {
  "id" : "5a4d1fb6711076d17e2e",
  "name" : "morph",
  "owner" : "paniq",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nconst float strength=0.1;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 ca = texture2D(from, p);\n  vec4 cb = texture2D(to, p);\n  \n  vec2 oa = (((ca.rg+ca.b)*0.5)*2.0-1.0);\n  vec2 ob = (((cb.rg+cb.b)*0.5)*2.0-1.0);\n  vec2 oc = mix(oa,ob,0.5)*strength;\n  \n  float w0 = progress;\n  float w1 = 1.0-w0;\n  gl_FragColor = mix(texture2D(from, p+oc*w0), texture2D(to, p-oc*w1), progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/5a4d1fb6711076d17e2e",
  "created_at" : "2014-07-01T04:52:25Z",
  "updated_at" : "2016-04-17T10:51:46Z",
  "stars" : 1.0
}, {
  "id" : "00973cee8e0353c73305",
  "name" : "LumaWipe",
  "owner" : "rectalogic",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform sampler2D lumaTex;\nuniform bool invertLuma;\nuniform float softness;\n\n// Port of rendermix wipe transition\n// https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Wipe/Wipe.frag\nvoid main() {\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n\n    float luma = texture2D(lumaTex, p).x;\n    if (invertLuma)\n        luma = 1.0 - luma;\n    vec4 fromColor = texture2D(from, p);\n    vec4 toColor = texture2D(to, p);\n    float time = mix(0.0, 1.0 + softness, progress);\n    if (luma <= time - softness)\n        gl_FragColor = toColor;\n    else if (luma >= time)\n        gl_FragColor = fromColor;\n    else {\n        float alpha = (time - luma) / softness;\n        gl_FragColor = mix(fromColor, toColor, alpha);\n    }\n}",
  "uniforms" : {
    "lumaTex" : "conical-asym.png",
    "invertLuma" : true,
    "softness" : 0.25
  },
  "html_url" : "https://gist.github.com/00973cee8e0353c73305",
  "created_at" : "2014-06-17T02:11:27Z",
  "updated_at" : "2015-08-29T14:02:38Z",
  "stars" : 0.0
}, {
  "id" : "0141a38779af3a652c22",
  "name" : "simple luma",
  "owner" : "gre",
  "glsl" : "// This template should ONLY be used for DEVELOPMENT\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform sampler2D luma;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(\n    texture2D(from, p),\n    texture2D(to, p),\n    step(texture2D(luma, p).r, progress)\n  );\n}",
  "uniforms" : {
    "luma" : "spiral-1.png"
  },
  "html_url" : "https://gist.github.com/0141a38779af3a652c22",
  "created_at" : "2014-06-13T08:16:10Z",
  "updated_at" : "2015-08-29T14:02:31Z",
  "stars" : 1.0
}, {
  "id" : "ee15128c2b87d0e74dee",
  "name" : "cube",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float persp;\nuniform float unzoom;\nuniform float reflection;\nuniform float floating;\n\nvec2 project (vec2 p) {\n  return p * vec2(1.0, -1.2) + vec2(0.0, -floating/100.);\n}\n\nbool inBounds (vec2 p) {\n  return all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));\n}\n\nvec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {\n  vec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n  pfr = project(pfr);\n  if (inBounds(pfr)) {\n    c += mix(vec4(0.0), texture2D(from, pfr), reflection * mix(1.0, 0.0, pfr.y));\n  }\n  pto = project(pto);\n  if (inBounds(pto)) {\n    c += mix(vec4(0.0), texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));\n  }\n  return c;\n}\n\n// p : the position\n// persp : the perspective in [ 0, 1 ]\n// center : the xcenter in [0, 1] \\ 0.5 excluded\nvec2 xskew (vec2 p, float persp, float center) {\n  float x = mix(p.x, 1.0-p.x, center);\n  return (\n    (\n      vec2( x, (p.y - 0.5*(1.0-persp) * x) / (1.0+(persp-1.0)*x) )\n      - vec2(0.5-distance(center, 0.5), 0.0)\n    )\n    * vec2(0.5 / distance(center, 0.5) * (center<0.5 ? 1.0 : -1.0), 1.0)\n    + vec2(center<0.5 ? 0.0 : 1.0, 0.0)\n  );\n}\n\nvoid main() {\n  vec2 op = gl_FragCoord.xy / resolution.xy;\n  float uz = unzoom * 2.0*(0.5-distance(0.5, progress));\n  vec2 p = -uz*0.5+(1.0+uz) * op;\n  vec2 fromP = xskew(\n    (p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0),\n    1.0-mix(progress, 0.0, persp),\n    0.0\n  );\n  vec2 toP = xskew(\n    p / vec2(progress, 1.0),\n    mix(pow(progress, 2.0), 1.0, persp),\n    1.0\n  );\n  if (inBounds(fromP)) {\n    gl_FragColor = texture2D(from, fromP);\n  }\n  else if (inBounds(toP)) {\n    gl_FragColor = texture2D(to, toP);\n  }\n  else {\n    gl_FragColor = bgColor(op, fromP, toP);\n  }\n}",
  "uniforms" : {
    "persp" : 0.7,
    "unzoom" : 0.3,
    "reflection" : 0.4,
    "floating" : 3.0
  },
  "html_url" : "https://gist.github.com/ee15128c2b87d0e74dee",
  "created_at" : "2014-06-12T17:13:17Z",
  "updated_at" : "2016-12-13T03:57:44Z",
  "stars" : 6.0
}, {
  "id" : "9b99fc01fd5705008a5b",
  "name" : "Glitch Memories",
  "owner" : "natewave",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid glitch_memories(sampler2D pic) {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 block = floor(gl_FragCoord.xy / vec2(16));\n  vec2 uv_noise = block / vec2(64);\n  uv_noise += floor(vec2(progress) * vec2(1200.0, 3500.0)) / vec2(64);\n  \n  float block_thresh = pow(fract(progress * 1200.0), 2.0) * 0.2;\n  float line_thresh = pow(fract(progress * 2200.0), 3.0) * 0.7;\n  vec2 red = p, green = p, blue = p, o = p;\n  vec2 dist = (fract(uv_noise) - 0.5) * 0.3;\n  red += dist * 0.1;\n  green += dist * 0.2;\n  blue += dist * 0.125;\n  \n  gl_FragColor.r = texture2D(pic, red).r;\n  gl_FragColor.g = texture2D(pic, green).g;\n  gl_FragColor.b = texture2D(pic, blue).b;\n  gl_FragColor.a = 1.0;\n\n}\n\nvoid main(void)\n{\n  float smoothed = smoothstep(0., 1., progress);\n  if( ( smoothed < 0.4 && smoothed > 0.1) ) {\n      glitch_memories(from);\n  } else if ((smoothed > 0.6 && smoothed < 0.9) ) {\n      glitch_memories(to);\n  } else {\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);\n  }\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/9b99fc01fd5705008a5b",
  "created_at" : "2014-05-29T19:32:52Z",
  "updated_at" : "2015-12-04T07:11:52Z",
  "stars" : 1.0
}, {
  "id" : "fe67b3b5149738069537",
  "name" : "potleaf",
  "owner" : "Flexi23",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n \nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec2 leaf_uv = (uv - vec2(0.5))/10./pow(progress,3.5);\n\tleaf_uv.y += 0.35;\n\tfloat r = 0.18;\n\tfloat o = atan(leaf_uv.y, leaf_uv.x);\n  gl_FragColor = mix(texture2D(from, uv), texture2D(to, uv), 1.-step(1. - length(leaf_uv)+r*(1.+sin(o))*(1.+0.9 * cos(8.*o))*(1.+0.1*cos(24.*o))*(0.9+0.05*cos(200.*o)), 1.));\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/fe67b3b5149738069537",
  "created_at" : "2014-05-28T09:58:30Z",
  "updated_at" : "2015-08-29T14:01:55Z",
  "stars" : 0.0
}, {
  "id" : "b86b90161503a0023231",
  "name" : "CrossZoom",
  "owner" : "rectalogic",
  "glsl" : "// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag\n// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js\n// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float strength;\n\nconst float PI = 3.141592653589793;\n\nfloat Linear_ease(in float begin, in float change, in float duration, in float time) {\n    return change * time / duration + begin;\n}\n\nfloat Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {\n    if (time == 0.0)\n        return begin;\n    else if (time == duration)\n        return begin + change;\n    time = time / (duration / 2.0);\n    if (time < 1.0)\n        return change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;\n    return change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;\n}\n\nfloat Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {\n    return -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;\n}\n\n/* random number between 0 and 1 */\nfloat random(in vec3 scale, in float seed) {\n    /* use the fragment position for randomness */\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvec3 crossFade(in vec2 uv, in float dissolve) {\n    return mix(texture2D(from, uv).rgb, texture2D(to, uv).rgb, dissolve);\n}\n\nvoid main() {\n    vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n    // Linear interpolate center across center half of the image\n    vec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);\n    float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);\n\n    // Mirrored sinusoidal loop. 0->strength then strength->0\n    float strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);\n\n    vec3 color = vec3(0.0);\n    float total = 0.0;\n    vec2 toCenter = center - texCoord;\n\n    /* randomize the lookup values to hide the fixed number of samples */\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    for (float t = 0.0; t <= 40.0; t++) {\n        float percent = (t + offset) / 40.0;\n        float weight = 4.0 * (percent - percent * percent);\n        color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;\n        total += weight;\n    }\n    gl_FragColor = vec4(color / total, 1.0);\n}",
  "uniforms" : {
    "strength" : 0.4
  },
  "html_url" : "https://gist.github.com/b86b90161503a0023231",
  "created_at" : "2014-05-25T01:24:39Z",
  "updated_at" : "2016-10-14T11:48:08Z",
  "stars" : 8.0
}, {
  "id" : "ce9279de351984f0ad27",
  "name" : "Slide",
  "owner" : "rectalogic",
  "glsl" : "// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Slide/Slide.frag\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Slide Down: translateX = 0, translateY = -1\n// Slide Left: translateX = -1, translateY = 0\n// Slide Right: translateX = 1, translateY = 0\n// Slide Up: translateX = 0, translateY = 1\nuniform float translateX;\nuniform float translateY;\n\nvoid main() {\n    vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n    float x = progress * translateX;\n    float y = progress * translateY;\n\n    if (x >= 0.0 && y >= 0.0) {\n        if (texCoord.x >= x && texCoord.y >= y) {\n            gl_FragColor = texture2D(from, texCoord - vec2(x, y));\n        }\n        else {\n            vec2 uv;\n            if (x > 0.0)\n                uv = vec2(x - 1.0, y);\n            else if (y > 0.0)\n                uv = vec2(x, y - 1.0);\n            gl_FragColor = texture2D(to, texCoord - uv);\n        }\n    }\n    else if (x <= 0.0 && y <= 0.0) {\n        if (texCoord.x <= (1.0 + x) && texCoord.y <= (1.0 + y))\n            gl_FragColor = texture2D(from, texCoord - vec2(x, y));\n        else {\n            vec2 uv;\n            if (x < 0.0)\n                uv = vec2(x + 1.0, y);\n            else if (y < 0.0)\n                uv = vec2(x, y + 1.0);\n            gl_FragColor = texture2D(to, texCoord - uv);\n        }\n    }\n    else\n        gl_FragColor = vec4(0.0);\n}",
  "uniforms" : {
    "translateX" : 1.0,
    "translateY" : 0.0
  },
  "html_url" : "https://gist.github.com/ce9279de351984f0ad27",
  "created_at" : "2014-05-25T01:13:20Z",
  "updated_at" : "2016-03-17T22:31:23Z",
  "stars" : 1.0
}, {
  "id" : "154a99fbe5300fb5c279",
  "name" : "pinwheel",
  "owner" : "mrspeaker",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  \n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  float circPos = atan(p.y - 0.5, p.x - 0.5) + progress;\n  float modPos = mod(circPos, 3.1415 / 4.);\n  float signed = sign(progress - modPos);\n  float smoothed = smoothstep(0., 1., signed);\n  \n  if (smoothed > 0.5){\n    gl_FragColor = texture2D(to, p);\n  } else {\n    gl_FragColor = texture2D(from, p);\n  }\n  \n}\n",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/154a99fbe5300fb5c279",
  "created_at" : "2014-05-23T21:56:59Z",
  "updated_at" : "2015-08-29T14:01:45Z",
  "stars" : 0.0
}, {
  "id" : "e54a807cdb66c8b16a34",
  "name" : "Kaleidoscope",
  "owner" : "nwoeanhinnogaehr",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float speed;\nuniform float angle;\nuniform float power;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 q = p;\n  float t = pow(progress, power)*speed;\n  p = p -0.5;\n  for (int i = 0; i < 7; i++) {\n    p = vec2(sin(t)*p.x + cos(t)*p.y, sin(t)*p.y - cos(t)*p.x);\n    t += angle;\n    p = abs(mod(p, 2.0) - 1.0);\n  }\n  abs(mod(p, 1.0));\n  gl_FragColor = mix(\n    mix(texture2D(from, q), texture2D(to, q), progress),\n    mix(texture2D(from, p), texture2D(to, p), progress), 1.0 - 2.0*abs(progress - 0.5));\n}",
  "uniforms" : {
    "speed" : 1.0,
    "angle" : 2.0,
    "power" : 2.0
  },
  "html_url" : "https://gist.github.com/e54a807cdb66c8b16a34",
  "created_at" : "2014-05-23T19:02:46Z",
  "updated_at" : "2016-04-17T11:03:48Z",
  "stars" : 1.0
}, {
  "id" : "408045772d255df97520",
  "name" : "SimpleFlip",
  "owner" : "nwoeanhinnogaehr",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 q = p;\n  p.x = (p.x - 0.5)/abs(progress - 0.5)*0.5 + 0.5;\n  vec4 a = texture2D(from, p);\n  vec4 b = texture2D(to, p);\n  gl_FragColor = vec4(mix(a, b, step(0.5, progress)).rgb * step(abs(q.x - 0.5), abs(progress - 0.5)), 1.0);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/408045772d255df97520",
  "created_at" : "2014-05-23T18:42:58Z",
  "updated_at" : "2015-08-29T14:01:44Z",
  "stars" : 0.0
}, {
  "id" : "a070cbd69e2535e757f1",
  "name" : "DoomScreenTransition",
  "owner" : "zeh",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n\n\n// Hardcoded parameters --------\n\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n\n// Transition parameters --------\n\n// default barWidth = 10\nuniform int barWidth; // Number of bars\n\n// default amplitude = 2\nuniform float amplitude; // 0 = no variation when going down, higher = some elements go much faster\n\n// default noise = 0.1\nuniform float noise; // 0 = no noise, 1 = super noisy\n\n// default frequency = 1\nuniform float frequency; // the bigger the value, the shorter the waves\n\n// The code proper --------\n\nfloat rand(int num) {\n  return fract(mod(float(num) * 67123.313, 12.0) * sin(float(num) * 10.3) * cos(float(num)));\n}\n\nfloat wave(int num) {\n  float fn = float(num) * frequency * 0.1  * float(barWidth);\n  return cos(fn * 0.5) * cos(fn * 0.13) * sin((fn+10.0) * 0.3) / 2.0 + 0.5;\n}\n\nfloat pos(int num) {\n  return noise == 0.0 ? wave(num) : mix(wave(num), rand(num), noise);\n}\n\nvoid main() {\n  int bar = int(gl_FragCoord.x) / barWidth;\n  float scale = 1.0 + pos(bar) * amplitude;\n  float phase = progress * scale;\n  float posY = gl_FragCoord.y / resolution.y;\n  vec2 p;\n  vec4 c;\n  if (phase + posY < 1.0) {\n    p = vec2(gl_FragCoord.x, gl_FragCoord.y + mix(0.0, resolution.y, phase)) / resolution.xy;\n    c = texture2D(from, p);\n  } else {\n    p = gl_FragCoord.xy / resolution.xy;\n    c = texture2D(to, p);\n  }\n\n  // Finally, apply the color\n  gl_FragColor = c;\n}\n",
  "uniforms" : {
    "barWidth" : 10.0,
    "noise" : 0.2,
    "amplitude" : 2.0,
    "frequency" : 1.0
  },
  "html_url" : "https://gist.github.com/a070cbd69e2535e757f1",
  "created_at" : "2014-05-23T18:00:18Z",
  "updated_at" : "2016-06-21T09:36:36Z",
  "stars" : 2.0
}, {
  "id" : "a830822b23e846e25d2d",
  "name" : "DreamyZoom",
  "owner" : "zeh",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n\n\n// Definitions --------\n#define DEG2RAD 0.03926990816987241548078304229099 // 1/180*PI\n\n\n// Hardcoded parameters --------\n\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n\n// Transition parameters --------\n\n// default rotation = 6\nuniform float rotation; // In degrees\n\n// default scale = 1.2\nuniform float scale; // Multiplier\n\n\n// The code proper --------\n\nvoid main() {\n  // Massage parameters\n  float phase = progress < 0.5 ? progress * 2.0 : (progress - 0.5) * 2.0;\n  float angleOffset = progress < 0.5 ? mix(0.0, rotation * DEG2RAD, phase) : mix(-rotation * DEG2RAD, 0.0, phase);\n  float newScale = progress < 0.5 ? mix(1.0, scale, phase) : mix(scale, 1.0, phase);\n  \n  vec2 center = vec2(0, 0);\n\n  // Calculate\n  float maxRes = max(resolution.x, resolution.y);\n  float resX = resolution.x / maxRes * 0.5;\n  float resY = resolution.y / maxRes * 0.5;\n  vec2 p = (gl_FragCoord.xy / maxRes - vec2(resX, resY)) / newScale;\n\n  // This can probably be optimized (with distance())\n  float angle = atan(p.y, p.x) + angleOffset;\n  float dist = distance(center, p);\n  p.x = cos(angle) * dist + resX;\n  p.y = sin(angle) * dist + resY;\n  vec4 c = progress < 0.5 ? texture2D(from, p) : texture2D(to, p);\n\n  // Finally, apply the color\n  gl_FragColor = c + (progress < 0.5 ? mix(0.0, 1.0, phase) : mix(1.0, 0.0, phase));\n}",
  "uniforms" : {
    "rotation" : 6.0,
    "scale" : 1.2
  },
  "html_url" : "https://gist.github.com/a830822b23e846e25d2d",
  "created_at" : "2014-05-23T15:27:25Z",
  "updated_at" : "2015-08-29T14:01:44Z",
  "stars" : 0.0
}, {
  "id" : "b6720916aa3f035949bc",
  "name" : "squareswipe",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform ivec2 squares;\nuniform vec2 direction;\nuniform float smoothness;\n\nconst vec2 center = vec2(0.5, 0.5);\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 v = normalize(direction);\n  if (v != vec2(0.0))\n    v /= abs(v.x)+abs(v.y);\n  float d = v.x * center.x + v.y * center.y;\n  float offset = smoothness;\n  float pr = smoothstep(-offset, 0.0, v.x * p.x + v.y * p.y - (d-0.5+progress*(1.+offset)));\n  vec2 squarep = fract(p*vec2(squares));\n  vec2 squaremin = vec2(pr/2.0);\n  vec2 squaremax = vec2(1.0 - pr/2.0);\n  float a = all(lessThan(squaremin, squarep)) && all(lessThan(squarep, squaremax)) ? 1.0 : 0.0;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), a);\n}",
  "uniforms" : {
    "squares" : [ 10.0, 10.0 ],
    "direction" : [ 1.0, -0.5 ],
    "smoothness" : 1.6
  },
  "html_url" : "https://gist.github.com/b6720916aa3f035949bc",
  "created_at" : "2014-05-23T12:09:38Z",
  "updated_at" : "2015-08-29T14:01:44Z",
  "stars" : 0.0
}, {
  "id" : "169781bb76f310e2bfde",
  "name" : "TilesWaveBottomLeftToTopRight",
  "owner" : "numb3r23",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform vec2 tileSize;// = vec2(64, 64);\n\nuniform float checkerDistance;// = 0.015;\n\nuniform bool flipX;// = true;\nuniform bool flipY;// = false;\n\nuniform bool preTileSingleColor;// = false; ///8bit ftw\nuniform bool postTileSingleColor;// = false; ///8bit ftw\n\nvec2 tile2Global(vec2 tex, vec2 tileNum, bool tileSingleColor) {\n    vec2 perTile = tileSize / resolution.xy;\n    return tileNum * perTile + (tileSingleColor ? vec2(0) : tex*perTile);\n}\n\nvoid main(void)\n{\n\tvec2 uv = gl_FragCoord.xy / resolution.xy;\n\n    vec4 fragColor = vec4(1, 1, 0, 1);\n\n    vec2 posInTile = mod(vec2(gl_FragCoord), tileSize);\n    vec2 tileNum = floor(vec2(gl_FragCoord)/ tileSize);\n    int num = int(tileNum.x);\n    vec2 totalTiles = ceil(resolution.xy / tileSize);\n    float countTiles = totalTiles.x * totalTiles.y;\n     \n\t  vec2 perTile = ceil(tileSize / resolution.xy);\n    float offset = 0.0;   //curtain\n\t  //   wave #1\n\t  offset = (tileNum.y + tileNum.x * perTile.y) / (sqrt(countTiles) * 2.0);\n\t  //   wave #2\n \t  //offset = (tileNum.x + tileNum.y * perTile.x) / (sqrt(countTiles) * 2.0);\n\n    float timeOffset = (progress - offset) * countTiles;\n    timeOffset = clamp(timeOffset, 0.0, 0.5);\n    \n    float sinTime = 1.0 - abs(cos(fract(timeOffset) * 3.1415926));\n    \n    fragColor.rg = uv;\n    fragColor.b = sinTime;\n    \n    vec2 texC = posInTile / tileSize;\n    \n    if (sinTime <= 0.5){\n    \n\n        if (flipX) {\n            if ((texC.x < sinTime) || (texC.x > 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.x < 0.5) {\n                texC.x = (texC.x - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.x = (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n        }\n\n        if (flipY) {\n            if ((texC.y < sinTime) || (texC.y > 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.y < 0.5) {\n                texC.y = (texC.y - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.y = (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n        }\n\n        fragColor = texture2D(from, tile2Global(texC, tileNum, preTileSingleColor));\n\n    } else {\n        if (flipX) {\n            if ((texC.x > sinTime) || (texC.x < 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.x < 0.5) {\n                texC.x = (texC.x - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.x = (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n            texC.x = 1.0 - texC.x;\n        }\n\n        if (flipY) {\n            if ((texC.y > sinTime) || (texC.y < 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.y < 0.5) {\n                texC.y = (texC.y - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.y = (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n            texC.y = 1.0 - texC.y;\n        }\n\n        fragColor.rgb = texture2D(to, tile2Global(texC, tileNum, postTileSingleColor)).rgb;\n\n    }\n    gl_FragColor = fragColor;\n  \n}\n",
  "uniforms" : {
    "tileSize" : [ 64.0, 64.0 ],
    "checkerDistance" : 0.0,
    "flipX" : false,
    "flipY" : false,
    "preTileSingleColor" : false,
    "postTileSingleColor" : false
  },
  "html_url" : "https://gist.github.com/169781bb76f310e2bfde",
  "created_at" : "2014-05-21T22:50:48Z",
  "updated_at" : "2015-08-29T14:01:42Z",
  "stars" : 0.0
}, {
  "id" : "5ebd3442a208861c7a8a",
  "name" : "TilesScanline",
  "owner" : "numb3r23",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nconst vec2 tileSize = vec2(64, 64);\n\nconst float checkerDistance = 0.015;\n\nconst bool flipX = true;\nconst bool flipY = false;\n\nconst bool preTileSingleColor = false; ///8bit ftw\nconst bool postTileSingleColor = false; ///8bit ftw\n\nvec2 tile2Global(vec2 tex, vec2 tileNum, bool tileSingleColor) {\n    vec2 perTile = tileSize / resolution.xy;\n    return tileNum * perTile + (tileSingleColor ? vec2(0) : tex*perTile);\n}\n\nvoid main(void)\n{\n\tvec2 uv = gl_FragCoord.xy / resolution.xy;\n\n    vec4 fragColor = vec4(1, 1, 0, 1);\n\n    vec2 posInTile = mod(vec2(gl_FragCoord), tileSize);\n    vec2 tileNum = floor(vec2(gl_FragCoord)/ tileSize);\n    int num = int(tileNum.x);\n    vec2 totalTiles = ceil(resolution.xy / tileSize);\n    float countTiles = totalTiles.x * totalTiles.y;\n     \n\tvec2 perTile = ceil(tileSize / resolution.xy);\n    float offset = 0.0;   //curtain\n    //   scanline horizontal\n    offset = (tileNum.x + tileNum.y * totalTiles.x) / countTiles;\n    //   and scanline vertical ofc\n    //offset = (tileNum.y + tileNum.x * totalTiles.y) / countTiles;\n\n    float timeOffset = (progress - offset) * countTiles;\n    timeOffset = clamp(timeOffset, 0.0, 0.5);\n    \n    float sinTime = 1.0 - abs(cos(fract(timeOffset) * 3.1415926));\n    \n    fragColor.rg = uv;\n    fragColor.b = sinTime;\n    \n    vec2 texC = posInTile / tileSize;\n    \n    if (sinTime <= 0.5){\n    \n\n        if (flipX) {\n            if ((texC.x < sinTime) || (texC.x > 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.x < 0.5) {\n                texC.x = (texC.x - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.x = (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n        }\n\n        if (flipY) {\n            if ((texC.y < sinTime) || (texC.y > 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.y < 0.5) {\n                texC.y = (texC.y - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.y = (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n        }\n\n        fragColor = texture2D(from, tile2Global(texC, tileNum, preTileSingleColor));\n\n    } else {\n        if (flipX) {\n            if ((texC.x > sinTime) || (texC.x < 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.x < 0.5) {\n                texC.x = (texC.x - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.x = (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n            texC.x = 1.0 - texC.x;\n        }\n\n        if (flipY) {\n            if ((texC.y > sinTime) || (texC.y < 1.0 - sinTime)){\n                discard;\n            }\n            if (texC.y < 0.5) {\n                texC.y = (texC.y - sinTime) * 0.5 / (0.5 - sinTime);\n            } else {\n                texC.y = (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;\n            }\n            texC.y = 1.0 - texC.y;\n        }\n\n        fragColor.rgb = texture2D(to, tile2Global(texC, tileNum, postTileSingleColor)).rgb;\n\n    }\n    gl_FragColor = fragColor;\n  \n}\n",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/5ebd3442a208861c7a8a",
  "created_at" : "2014-05-21T22:49:22Z",
  "updated_at" : "2015-08-29T14:01:42Z",
  "stars" : 0.0
}, {
  "id" : "9e86d2712e123542758b",
  "name" : "Dreamy",
  "owner" : "mikolalysenko",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvec2 offset(float progress, float x, float theta) {\n  float phase = progress*progress + progress + theta;\n  float shifty = 0.03*progress*cos(10.0*(progress+x));\n  return vec2(0, shifty);\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(texture2D(from, p + offset(progress, p.x, 0.0)), texture2D(to, p + offset(1.0-progress, p.x, 3.14)), progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/9e86d2712e123542758b",
  "created_at" : "2014-05-21T14:55:01Z",
  "updated_at" : "2015-08-29T14:01:39Z",
  "stars" : 0.0
}, {
  "id" : "21d2fdd24c706952dc8c",
  "name" : "AdvancedMosaic",
  "owner" : "corporateshark",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n/*\n   (C) Sergey Kosarevsky, 2014\n   \n   Available under the terms of MIT license\n   \n   http://www.linderdaum.com\n   http://blog.linderdaum.com\n*/\n\nvoid main(void)\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n\tfloat T = progress;\n\n\tfloat S0 = 1.0;\n\tfloat S1 = 50.0;\n\tfloat S2 = 1.0;\n\n\t// 2 segments, 1/2 each\n\tfloat Half = 0.5;\n\n\tfloat PixelSize = ( T < Half ) ? mix( S0, S1, T / Half ) : mix( S1, S2, (T-Half) / Half );\n\n\tvec2 D = PixelSize / resolution.xy;\n\n\t// remap UV from 0...1 to -0.5...+0.5 to make the mosaic pattern converge torwards the image center\n\tvec2 UV = ( p + vec2( -0.5 ) ) / D;\n\n\t// don't forget to remap coords back to 0...1 after ceil()\n\tvec2 Coord = clamp( D * ( ceil( UV + vec2( -0.5 ) ) ) + vec2( 0.5 ), vec2( 0.0 ), vec2( 1.0 ) );\n\n\tvec4 C0 = texture2D( from, Coord );\n\tvec4 C1 = texture2D( to, Coord );\n\n\tgl_FragColor = mix( C0, C1, T );\n}\n",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/21d2fdd24c706952dc8c",
  "created_at" : "2014-05-21T14:45:52Z",
  "updated_at" : "2015-08-29T14:01:39Z",
  "stars" : 0.0
}, {
  "id" : "cacfedb8cca0f5ce3f7c",
  "name" : "Swirl",
  "owner" : "corporateshark",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n/*\n  (C) Sergey Kosarevsky, 2014\n  \n  Available under the terms of MIT license\n  http://www.linderdaum.com\n*/\n\nvoid main(void)\n{\n\tfloat Radius = 1.0;\n\n\tfloat T = progress;\n\n\tvec2 UV = gl_FragCoord.xy / resolution.xy;\n\n\tUV -= vec2( 0.5, 0.5 );\n\n\tfloat Dist = length(UV);\n\n\tif ( Dist < Radius )\n\t{\n\t\tfloat Percent = (Radius - Dist) / Radius;\n\t\tfloat A = ( T <= 0.5 ) ? mix( 0.0, 1.0, T/0.5 ) : mix( 1.0, 0.0, (T-0.5)/0.5 );\n\t\tfloat Theta = Percent * Percent * A * 8.0 * 3.14159;\n\t\tfloat S = sin( Theta );\n\t\tfloat C = cos( Theta );\n\t\tUV = vec2( dot(UV, vec2(C, -S)), dot(UV, vec2(S, C)) );\n\t}\n\tUV += vec2( 0.5, 0.5 );\n\n\tvec4 C0 = texture2D( from, UV );\n\tvec4 C1 = texture2D( to, UV );\n\n\tgl_FragColor = mix( C0, C1, T );\n}\n",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/cacfedb8cca0f5ce3f7c",
  "created_at" : "2014-05-21T14:43:04Z",
  "updated_at" : "2015-08-29T14:01:39Z",
  "stars" : 0.0
}, {
  "id" : "b9f8e5675c647e615419",
  "name" : "DefocusBlur",
  "owner" : "corporateshark",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform float progress;\nuniform vec2 resolution;\n\nuniform sampler2D from;\nuniform sampler2D to;\n\n/*\n  Defocus blur\n  (C) Sergey Kosarevsky, 2014\n  http://www.linderdaum.com\n  \n  This source code is available under MIT license.\n*/\n\nvoid main(void)\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n\tfloat T = progress;\n\n\tfloat S0 = 1.0;\n\tfloat S1 = 50.0;\n\tfloat S2 = 1.0;\n\n\t// 2 segments, 1/2 each\n\tfloat Half = 0.5;\n\n\tfloat PixelSize = ( T < Half ) ? mix( S0, S1, T / Half ) : mix( S1, S2, (T-Half) / Half );\n\n\tvec2 D = PixelSize / resolution.xy;\n\n\tvec2 UV = (gl_FragCoord.xy / resolution.xy);\n\n\t// 12-tap Poisson disk coefficients: https://github.com/spite/Wagner/blob/master/fragment-shaders/poisson-disc-blur-fs.glsl\n\tconst int NumTaps = 12;\n\tvec2 Disk[NumTaps];\n\tDisk[0] = vec2(-.326,-.406);\n\tDisk[1] = vec2(-.840,-.074);\n\tDisk[2] = vec2(-.696, .457);\n\tDisk[3] = vec2(-.203, .621);\n\tDisk[4] = vec2( .962,-.195);\n\tDisk[5] = vec2( .473,-.480);\n\tDisk[6] = vec2( .519, .767);\n\tDisk[7] = vec2( .185,-.893);\n\tDisk[8] = vec2( .507, .064);\n\tDisk[9] = vec2( .896, .412);\n\tDisk[10] = vec2(-.322,-.933);\n\tDisk[11] = vec2(-.792,-.598);\n\n\tvec4 C0 = texture2D( from, UV );\n\tvec4 C1 = texture2D( to, UV );\n\n\tfor ( int i = 0; i != NumTaps; i++ )\n\t{\n\t\tC0 += texture2D( from, Disk[i] * D + UV );\n\t\tC1 += texture2D( to, Disk[i] * D + UV );\n\t}\n\tC0 /= float(NumTaps+1);\n\tC1 /= float(NumTaps+1);\n\n\tgl_FragColor = mix( C0, C1, T );\n}\n",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/b9f8e5675c647e615419",
  "created_at" : "2014-05-21T10:12:14Z",
  "updated_at" : "2016-01-28T00:11:08Z",
  "stars" : 2.0
}, {
  "id" : "2a5fa2f77c883dd661f9",
  "name" : "colourDistance",
  "owner" : "P-Seebauer",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// default interpolationPower = 5;\nuniform float interpolationPower;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 fTex = texture2D(from,p);\n  vec4 tTex = texture2D(to,p);\n  gl_FragColor = mix(distance(fTex,tTex)>progress?fTex:tTex,\n                     tTex,\n                     pow(progress,interpolationPower));\n}",
  "uniforms" : {
    "interpolationPower" : 5.0
  },
  "html_url" : "https://gist.github.com/2a5fa2f77c883dd661f9",
  "created_at" : "2014-05-21T07:10:21Z",
  "updated_at" : "2015-12-04T07:10:31Z",
  "stars" : 2.0
}, {
  "id" : "b93818de23d4511fde10",
  "name" : "Dissolve",
  "owner" : "nwoeanhinnogaehr",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float blocksize;\n\n// A simple PRNG\nfloat rand(vec2 co) {\n    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), step(rand(floor(gl_FragCoord.xy/blocksize)), progress));\n}\n",
  "uniforms" : {
    "blocksize" : 1.0
  },
  "html_url" : "https://gist.github.com/b93818de23d4511fde10",
  "created_at" : "2014-05-20T23:40:57Z",
  "updated_at" : "2015-08-29T14:01:38Z",
  "stars" : 0.0
}, {
  "id" : "b185145363d65751009b",
  "name" : "HSVfade",
  "owner" : "nwoeanhinnogaehr",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// HSV functions are from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl\n\nvec3 hsv2rgb(vec3 c) {\n    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec3 rgb2hsv(vec3 c) {\n    const vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 0.001)), d / (q.x + 0.001), q.x);\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec3 a = rgb2hsv(texture2D(from, p).rgb);\n  vec3 b = rgb2hsv(texture2D(to, p).rgb);\n  vec3 m = mix(a, b, progress);\n  gl_FragColor = vec4(hsv2rgb(m), 1.0);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/b185145363d65751009b",
  "created_at" : "2014-05-20T23:21:27Z",
  "updated_at" : "2015-12-04T07:14:09Z",
  "stars" : 1.0
}, {
  "id" : "f6fc39f4cfcbb97f96a6",
  "name" : "Fold",
  "owner" : "nwoeanhinnogaehr",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 a = texture2D(from, (p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0));\n  vec4 b = texture2D(to, p / vec2(progress, 1.0));\n  gl_FragColor = mix(a, b, step(p.x, progress));\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/f6fc39f4cfcbb97f96a6",
  "created_at" : "2014-05-20T23:14:23Z",
  "updated_at" : "2015-08-29T14:01:38Z",
  "stars" : 0.0
}, {
  "id" : "80c2d40cac3f98453176",
  "name" : "linearblur",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float intensity;\n\nconst int PASSES = 8;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 c1 = vec4(0.0), c2 = vec4(0.0);\n  float disp = intensity*(0.5-distance(0.5, progress));\n  for (int xi=0; xi<PASSES; ++xi) {\n    float x = float(xi) / float(PASSES) - 0.5;\n    for (int yi=0; yi<PASSES; ++yi) {\n      float y = float(yi) / float(PASSES) - 0.5;\n      vec2 v = vec2(x,y);\n      float d = disp;\n      c1 += texture2D(from, p + d*v);\n      c2 += texture2D(to, p + d*v);\n    }\n  }\n  c1 /= float(PASSES*PASSES);\n  c2 /= float(PASSES*PASSES);\n  gl_FragColor = mix(c1, c2, progress);\n}",
  "uniforms" : {
    "intensity" : 0.1
  },
  "html_url" : "https://gist.github.com/80c2d40cac3f98453176",
  "created_at" : "2014-05-20T22:02:35Z",
  "updated_at" : "2015-12-04T07:14:08Z",
  "stars" : 1.0
}, {
  "id" : "c528607361d90a072e98",
  "name" : "pixelize",
  "owner" : "benraziel",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n  float revProgress = (1.0 - progress);\n  float distFromEdges = min(progress, revProgress);\n  float squareSize = (50.0 * distFromEdges) + 1.0;  \n  \n  vec2 p = (floor((gl_FragCoord.xy + squareSize * 0.5) / squareSize) * squareSize) / resolution.xy;\n  vec4 fromColor = texture2D(from, p);\n  vec4 toColor = texture2D(to, p);\n  \n  gl_FragColor = mix(fromColor, toColor, progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/c528607361d90a072e98",
  "created_at" : "2014-05-20T19:32:42Z",
  "updated_at" : "2016-04-17T10:46:17Z",
  "stars" : 2.0
}, {
  "id" : "abd06f4d23ab2ff4ed7a",
  "name" : "random_squares",
  "owner" : "benraziel",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n  float revProgress = (1.0 - progress);\n  float distFromEdges = min(progress, revProgress);\n  \n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 fromColor = texture2D(from, p);\n  vec4 toColor = texture2D(to, p);\n  float squareSize = 20.0;\n  float flickerSpeed = 60.0;\n  \n  vec2 seed = floor(gl_FragCoord.xy / squareSize) * floor(distFromEdges * flickerSpeed);\n  gl_FragColor = mix(fromColor, toColor, progress) + rand(seed) * distFromEdges * 0.5;\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/abd06f4d23ab2ff4ed7a",
  "created_at" : "2014-05-20T19:07:25Z",
  "updated_at" : "2015-12-04T07:14:11Z",
  "stars" : 1.0
}, {
  "id" : "791d0f058ae6a83e0c15",
  "name" : "PolkaDotsCurtain",
  "owner" : "bobylito",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nconst float SQRT_2 = 1.414213562373;\nuniform float dots;// = 20.0;\n\nuniform vec2 center;// = vec2(0, 0);\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  float x = progress /2.0;\n \n  bool nextImage = distance(fract(p * dots), vec2(0.5, 0.5)) < (2.0 * x / distance(p, center)); \n  \n  if(nextImage) gl_FragColor = texture2D(to, p);\n  else gl_FragColor = texture2D(from, p);\n}\n",
  "uniforms" : {
    "center" : [ 1.0, 1.0 ],
    "dots" : 20.0
  },
  "html_url" : "https://gist.github.com/791d0f058ae6a83e0c15",
  "created_at" : "2014-05-20T16:55:46Z",
  "updated_at" : "2015-08-29T14:01:38Z",
  "stars" : 0.0
}, {
  "id" : "166e496a19a4fdbf1aae",
  "name" : "PageCurl",
  "owner" : "corporateshark",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Adapted by Sergey Kosarevsky from:\n// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html\n\n/*\nCopyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n   * Redistributions of source code must retain the above copyright\n     notice, this list of conditions and the following disclaimer.\n   * Redistributions in binary form must reproduce the above\n     copyright notice, this list of conditions and the following disclaimer\n     in the documentation and/or other materials provided with the\n     distribution.\n   * Neither the name of Hewlett-Packard nor the names of its\n     contributors may be used to endorse or promote products derived from\n     this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\nin vec2 texCoord;\n*/\n\nconst float MIN_AMOUNT = -0.16;\nconst float MAX_AMOUNT = 1.3;\nfloat amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;\n\nconst float PI = 3.141592653589793;\n\nconst float scale = 512.0;\nconst float sharpness = 3.0;\n\nfloat cylinderCenter = amount;\n// 360 degrees * amount\nfloat cylinderAngle = 2.0 * PI * amount;\n\nconst float cylinderRadius = 1.0 / PI / 2.0;\n\nvec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)\n{\n\tfloat hitPoint = hitAngle / (2.0 * PI);\n\tpoint.y = hitPoint;\n\treturn rrotation * point;\n}\n\nvec4 antiAlias(vec4 color1, vec4 color2, float distanc)\n{\n\tdistanc *= scale;\n\tif (distanc < 0.0) return color2;\n\tif (distanc > 2.0) return color1;\n\tfloat dd = pow(1.0 - distanc / 2.0, sharpness);\n\treturn ((color2 - color1) * dd) + color1;\n}\n\nfloat distanceToEdge(vec3 point)\n{\n\tfloat dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);\n\tfloat dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);\n\tif (point.x < 0.0) dx = -point.x;\n\tif (point.x > 1.0) dx = point.x - 1.0;\n\tif (point.y < 0.0) dy = -point.y;\n\tif (point.y > 1.0) dy = point.y - 1.0;\n\tif ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);\n\treturn min(dx, dy);\n}\n\nvec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)\n{\n\tfloat hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);\n\tvec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);\n\tif (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))\n\t{\n\t  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\treturn texture2D(to, texCoord);\n\t}\n\n\tif (yc > 0.0) return texture2D(from, p);\n\n\tvec4 color = texture2D(from, point.xy);\n\tvec4 tcolor = vec4(0.0);\n\n\treturn antiAlias(color, tcolor, distanceToEdge(point));\n}\n\nvec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)\n{\n\tfloat shadow = distanceToEdge(point) * 30.0;\n\tshadow = (1.0 - shadow) / 3.0;\n\n\tif (shadow < 0.0) shadow = 0.0; else shadow *= amount;\n\n\tvec4 shadowColor = seeThrough(yc, p, rotation, rrotation);\n\tshadowColor.r -= shadow;\n\tshadowColor.g -= shadow;\n\tshadowColor.b -= shadow;\n\n\treturn shadowColor;\n}\n\nvec4 backside(float yc, vec3 point)\n{\n\tvec4 color = texture2D(from, point.xy);\n\tfloat gray = (color.r + color.b + color.g) / 15.0;\n\tgray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));\n\tcolor.rgb = vec3(gray);\n\treturn color;\n}\n\nvec4 behindSurface(float yc, vec3 point, mat3 rrotation)\n{\n\tfloat shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;\n\tshado *= 1.0 - abs(point.x - 0.5);\n\n\tyc = (-cylinderRadius - cylinderRadius - yc);\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))\n\t{\n\t\tshado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0));\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t}\n\telse\n\t{\n\t\tshado = 0.0;\n\t}\n\t\n\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n\treturn vec4(texture2D(to, texCoord).rgb - shado, 1.0);\n}\n\nvoid main()\n{\n  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n  \n  const float angle = 30.0 * PI / 180.0;\n\tfloat c = cos(-angle);\n\tfloat s = sin(-angle);\n\n\tmat3 rotation = mat3( c, s, 0,\n\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t0.12, 0.258, 1\n\t\t\t\t\t\t\t\t);\n\tc = cos(angle);\n\ts = sin(angle);\n\n\tmat3 rrotation = mat3(\tc, s, 0,\n\t\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t\t0.15, -0.5, 1\n\t\t\t\t\t\t\t\t);\n\n\tvec3 point = rotation * vec3(texCoord, 1.0);\n\n\tfloat yc = point.y - cylinderCenter;\n\n\tif (yc < -cylinderRadius)\n\t{\n\t\t// Behind surface\n\t\tgl_FragColor = behindSurface(yc, point, rrotation);\n\t\treturn;\n\t}\n\n\tif (yc > cylinderRadius)\n\t{\n\t\t// Flat surface\n\t\tgl_FragColor = texture2D(from, texCoord);\n\t\treturn;\n\t}\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\n\tfloat hitAngleMod = mod(hitAngle, 2.0 * PI);\n\tif ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))\n\t{\n\t\tgl_FragColor = seeThrough(yc, texCoord, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)\n\t{\n\t\tgl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tvec4 color = backside(yc, point);\n\n\tvec4 otherColor;\n\tif (yc < 0.0)\n\t{\n\t\tfloat shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t\totherColor = vec4(0.0, 0.0, 0.0, shado);\n\t}\n\telse\n\t{\n\t\totherColor = texture2D(from, texCoord);\n\t}\n\n\tcolor = antiAlias(color, otherColor, cylinderRadius - abs(yc));\n\n\tvec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\tfloat dist = distanceToEdge(point);\n\n\tgl_FragColor = antiAlias(color, cl, dist);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/166e496a19a4fdbf1aae",
  "created_at" : "2014-05-20T12:37:15Z",
  "updated_at" : "2016-10-16T12:58:34Z",
  "stars" : 4.0
}, {
  "id" : "06450f79cab706705bf9",
  "name" : "Polka_dots",
  "owner" : "bobylito",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float dots;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  float x = progress;\n  \n  bool nextImage = distance(fract(p * dots), vec2(0.5, 0.5)) < x;\n  if(nextImage)\n    gl_FragColor = texture2D(to, p);\n  else\n    gl_FragColor = texture2D(from, p);\n}",
  "uniforms" : {
    "dots" : 5.0
  },
  "html_url" : "https://gist.github.com/06450f79cab706705bf9",
  "created_at" : "2014-05-20T12:09:38Z",
  "updated_at" : "2015-08-29T14:01:37Z",
  "stars" : 0.0
}, {
  "id" : "3da654388c3f3cd031c0",
  "name" : "burn",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform vec3 color;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(\n    texture2D(from, p) + vec4(progress*color, 1.0),\n    texture2D(to, p) + vec4((1.0-progress)*color, 1.0),\n    progress);\n}",
  "uniforms" : {
    "color" : [ 0.9, 0.4, 0.2 ]
  },
  "html_url" : "https://gist.github.com/3da654388c3f3cd031c0",
  "created_at" : "2014-05-20T09:06:02Z",
  "updated_at" : "2016-04-17T10:47:46Z",
  "stars" : 2.0
}, {
  "id" : "e5f807b5dffb09fc7527",
  "name" : "FinalGaussianNoise",
  "owner" : "mandubian",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nfloat Rand(vec2 v) {\n  return fract(sin(dot(v.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nfloat Gaussian(float p, float center, float c) {\n  return 0.75 * exp(- pow((p - center) / c, 2.));\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float c = cos(Gaussian(progress * (1. + Gaussian(progress * Rand(p), 0.5, 0.5)), 0.5, 0.25));\n  vec2 d = p * c;\n  \n  gl_FragColor = mix(texture2D(from, d), texture2D(to, d), progress);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/e5f807b5dffb09fc7527",
  "created_at" : "2014-05-19T21:34:07Z",
  "updated_at" : "2016-03-20T23:09:40Z",
  "stars" : 3.0
}, {
  "id" : "130bb7b7affedbda9df5",
  "name" : "Mosaic",
  "owner" : "Xaychru",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n#define PI 3.14159265358979323\n#define POW2(X) X*X\n#define POW3(X) X*X*X\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nuniform int endx;\nuniform int endy;\n\nfloat Rand(vec2 v) {\n  return fract(sin(dot(v.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\nvec2 Rotate(vec2 v, float a) {\n  mat2 rm = mat2(cos(a), -sin(a),\n                 sin(a), cos(a));\n  return rm*v;\n}\nfloat CosInterpolation(float x) {\n  return -cos(x*PI)/2.+.5;\n}\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy - .5;\n  vec2 rp = p;\n  float rpr = (progress*2.-1.);\n  float z = -(rpr*rpr*2.) + 3.;\n  float az = abs(z);\n  rp *= az;\n  rp += mix(vec2(.5, .5), vec2(float(endx) + .5, float(endy) + .5), POW2(CosInterpolation(progress)));\n  vec2 mrp = mod(rp, 1.);\n  vec2 crp = rp;\n  bool onEnd = int(floor(crp.x))==endx&&int(floor(crp.y))==endy;\n  if(!onEnd) {\n    float ang = float(int(Rand(floor(crp))*4.))*.5*PI;\n    mrp = vec2(.5) + Rotate(mrp-vec2(.5), ang);\n  }\n  if(onEnd || Rand(floor(crp))>.5) {\n    gl_FragColor = texture2D(to, mrp);\n  } else {\n    gl_FragColor = texture2D(from, mrp);\n  }\n}",
  "uniforms" : {
    "endx" : 0.0,
    "endy" : -1.0
  },
  "html_url" : "https://gist.github.com/130bb7b7affedbda9df5",
  "created_at" : "2014-05-19T16:51:58Z",
  "updated_at" : "2015-08-29T14:01:36Z",
  "stars" : 1.0
}, {
  "id" : "ce1d48f0ce00bb379750",
  "name" : "Radial",
  "owner" : "Xaychru",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n#define PI 3.141592653589\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 rp = p*2.-1.;\n  float a = atan(rp.y, rp.x);\n  float pa = progress*PI*2.5-PI*1.25;\n  vec4 fromc = texture2D(from, p);\n  vec4 toc = texture2D(to, p);\n  if(a>pa) {\n    gl_FragColor = mix(toc, fromc, smoothstep(0., 1., (a-pa)));\n  } else {\n    gl_FragColor = toc;\n  }\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/ce1d48f0ce00bb379750",
  "created_at" : "2014-05-19T15:18:28Z",
  "updated_at" : "2015-08-29T14:01:36Z",
  "stars" : 0.0
}, {
  "id" : "c3bc914de09227713787",
  "name" : "ButterflyWaveScrawler",
  "owner" : "mandubian",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n// default amplitude = 1.0\nuniform float amplitude;\n// default waves = 30.\nuniform float waves;\n// default colorSeparation = 0.3\nuniform float colorSeparation;\nfloat PI = 3.14159265358979323846264;\nfloat compute(vec2 p, float progress, vec2 center) {\nvec2 o = p*sin(progress * amplitude)-center;\n// horizontal vector\nvec2 h = vec2(1., 0.);\n// butterfly polar function (don't ask me why this one :))\nfloat theta = acos(dot(o, h)) * waves;\nreturn (exp(cos(theta)) - 2.*cos(4.*theta) + pow(sin((2.*theta - PI) / 24.), 5.)) / 10.;\n}\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float inv = 1. - progress;\n  vec2 dir = p - vec2(.5);\n  float dist = length(dir);\n  float disp = compute(p, progress, vec2(0.5, 0.5)) ;\n  vec4 texTo = texture2D(to, p + inv*disp);\n  vec4 texFrom = vec4(\n  texture2D(from, p + progress*disp*(1.0 - colorSeparation)).r,\n  texture2D(from, p + progress*disp).g,\n  texture2D(from, p + progress*disp*(1.0 + colorSeparation)).b,\n  1.0);\n  gl_FragColor = texTo*progress + texFrom*inv;\n}",
  "uniforms" : {
    "amplitude" : 1.0,
    "waves" : 30.0,
    "colorSeparation" : 0.3
  },
  "html_url" : "https://gist.github.com/c3bc914de09227713787",
  "created_at" : "2014-05-19T11:48:15Z",
  "updated_at" : "2015-08-29T14:01:36Z",
  "stars" : 0.0
}, {
  "id" : "4268c81d39bd4ca00ae2",
  "name" : "CrazyParametricFun",
  "owner" : "mandubian",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// default a = 4\nuniform float a;\n// default b = 1\nuniform float b;\n// default amplitude = 120\nuniform float amplitude;\n// default smoothness = 0.1\nuniform float smoothness;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 dir = p - vec2(.5);\n  float dist = length(dir);\n  float x = (a - b) * cos(progress) + b * cos(progress * ((a / b) - 1.) );\n  float y = (a - b) * sin(progress) - b * sin(progress * ((a / b) - 1.));\n  vec2 offset = dir * vec2(sin(progress  * dist * amplitude * x), sin(progress * dist * amplitude * y)) / smoothness;\n  gl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), smoothstep(0.2, 1.0, progress));\n}",
  "uniforms" : {
    "a" : 4.0,
    "b" : 1.0,
    "amplitude" : 120.0,
    "smoothness" : 0.1
  },
  "html_url" : "https://gist.github.com/4268c81d39bd4ca00ae2",
  "created_at" : "2014-05-19T08:04:52Z",
  "updated_at" : "2015-08-29T14:01:36Z",
  "stars" : 0.0
}, {
  "id" : "2bcfb59096fcaed82355",
  "name" : "powerdisformation",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float power;\nuniform bool powerDest;\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  vec2 p2 = mix(\n    p, \n    vec2(pow(p.x, power), pow(p.y, power)), \n    (powerDest ? 0.5 : 1.0)-distance(progress, powerDest ? 0.5 : 1.0));\n  \n  gl_FragColor = mix(\n    texture2D(from, p2), \n    texture2D(to, powerDest ? p2: p), \n    progress);\n}",
  "uniforms" : {
    "power" : 3.0,
    "powerDest" : true
  },
  "html_url" : "https://gist.github.com/2bcfb59096fcaed82355",
  "created_at" : "2014-05-17T10:58:29Z",
  "updated_at" : "2015-08-29T14:01:31Z",
  "stars" : 0.0
}, {
  "id" : "2a3f2e907e1c0a152e60",
  "name" : "swap",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float reflection;\nuniform float perspective;\nuniform float depth;\n \nconst vec4 black = vec4(0.0, 0.0, 0.0, 1.0);\nconst vec2 boundMin = vec2(0.0, 0.0);\nconst vec2 boundMax = vec2(1.0, 1.0);\n \nbool inBounds (vec2 p) {\n  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));\n}\n \nvec2 project (vec2 p) {\n  return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);\n}\n \nvec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {\n  vec4 c = black;\n  pfr = project(pfr);\n  if (inBounds(pfr)) {\n    c += mix(black, texture2D(from, pfr), reflection * mix(1.0, 0.0, pfr.y));\n  }\n  pto = project(pto);\n  if (inBounds(pto)) {\n    c += mix(black, texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));\n  }\n  return c;\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n \n  vec2 pfr, pto = vec2(-1.);\n \n  float size = mix(1.0, depth, progress);\n  float persp = perspective * progress;\n  pfr = (p + vec2(-0.0, -0.5)) * vec2(size/(1.0-perspective*progress), size/(1.0-size*persp*p.x)) + vec2(0.0, 0.5);\n \n  size = mix(1.0, depth, 1.-progress);\n  persp = perspective * (1.-progress);\n  pto = (p + vec2(-1.0, -0.5)) * vec2(size/(1.0-perspective*(1.0-progress)), size/(1.0-size*persp*(0.5-p.x))) + vec2(1.0, 0.5);\n \n  bool fromOver = progress < 0.5;\n \n  if (fromOver) {\n    if (inBounds(pfr)) {\n      gl_FragColor = texture2D(from, pfr);\n    }\n    else if (inBounds(pto)) {\n      gl_FragColor = texture2D(to, pto);\n    }\n    else {\n      gl_FragColor = bgColor(p, pfr, pto);\n    }\n  }\n  else {\n    if (inBounds(pto)) {\n      gl_FragColor = texture2D(to, pto);\n    }\n    else if (inBounds(pfr)) {\n      gl_FragColor = texture2D(from, pfr);\n    }\n    else {\n      gl_FragColor = bgColor(p, pfr, pto);\n    }\n  }\n}",
  "uniforms" : {
    "reflection" : 0.4,
    "perspective" : 0.2,
    "depth" : 3.0
  },
  "html_url" : "https://gist.github.com/2a3f2e907e1c0a152e60",
  "created_at" : "2014-05-16T13:59:07Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 1.0
}, {
  "id" : "94ffa2725b65aa8b9979",
  "name" : "ripple",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float amplitude;\nuniform float speed;\n \nvoid main()\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 dir = p - vec2(.5);\n  float dist = length(dir);\n  vec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30.;\n  gl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), smoothstep(0.2, 1.0, progress));\n}",
  "uniforms" : {
    "amplitude" : 100.0,
    "speed" : 50.0
  },
  "html_url" : "https://gist.github.com/94ffa2725b65aa8b9979",
  "created_at" : "2014-05-16T13:58:42Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 0.0
}, {
  "id" : "99bced7d9b5311fd166e",
  "name" : "flash",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float flashPhase; // if 0.0, the image directly turn grayscale, if 0.9, the grayscale transition phase is very important\nuniform float flashIntensity;\nuniform float flashZoomEffect;\n \nconst vec3 flashColor = vec3(1.0, 0.8, 0.3);\nconst float flashVelocity = 3.0;\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 fc = texture2D(from, p);\n  vec4 tc = texture2D(to, p);\n  float intensity = mix(1.0, 2.0*distance(p, vec2(0.5, 0.5)), flashZoomEffect) * flashIntensity * pow(smoothstep(flashPhase, 0.0, distance(0.5, progress)), flashVelocity);\n  vec4 c = mix(texture2D(from, p), texture2D(to, p), smoothstep(0.5*(1.0-flashPhase), 0.5*(1.0+flashPhase), progress));\n  c += intensity * vec4(flashColor, 1.0);\n  gl_FragColor = c;\n}",
  "uniforms" : {
    "flashPhase" : 0.3,
    "flashIntensity" : 3.0,
    "flashZoomEffect" : 0.5
  },
  "html_url" : "https://gist.github.com/99bced7d9b5311fd166e",
  "created_at" : "2014-05-16T13:58:17Z",
  "updated_at" : "2015-12-04T07:14:45Z",
  "stars" : 1.0
}, {
  "id" : "81c6f2e6fce88f9075d2",
  "name" : "flyeye",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform float size;\nuniform float zoom;\nuniform float colorSeparation;\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float inv = 1. - progress;\n  vec2 disp = size*vec2(cos(zoom*p.x), sin(zoom*p.y));\n  vec4 texTo = texture2D(to, p + inv*disp);\n  vec4 texFrom = vec4(\n    texture2D(from, p + progress*disp*(1.0 - colorSeparation)).r,\n    texture2D(from, p + progress*disp).g,\n    texture2D(from, p + progress*disp*(1.0 + colorSeparation)).b,\n    1.0);\n  gl_FragColor = texTo*progress + texFrom*inv;\n}",
  "uniforms" : {
    "size" : 0.04,
    "zoom" : 30.0,
    "colorSeparation" : 0.3
  },
  "html_url" : "https://gist.github.com/81c6f2e6fce88f9075d2",
  "created_at" : "2014-05-16T13:56:53Z",
  "updated_at" : "2016-01-28T00:11:53Z",
  "stars" : 2.0
}, {
  "id" : "979934722820b5e715fa",
  "name" : "doorway",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float reflection;\nuniform float perspective;\nuniform float depth;\n \nconst vec4 black = vec4(0.0, 0.0, 0.0, 1.0);\nconst vec2 boundMin = vec2(0.0, 0.0);\nconst vec2 boundMax = vec2(1.0, 1.0);\n \nbool inBounds (vec2 p) {\n  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));\n}\n \nvec2 project (vec2 p) {\n  return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);\n}\n \nvec4 bgColor (vec2 p, vec2 pto) {\n  vec4 c = black;\n  pto = project(pto);\n  if (inBounds(pto)) {\n    c += mix(black, texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));\n  }\n  return c;\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n \n  vec2 pfr = vec2(-1.), pto = vec2(-1.);\n \n  float middleSlit = 2.0 * abs(p.x-0.5) - progress;\n  if (middleSlit > 0.0) {\n    pfr = p + (p.x > 0.5 ? -1.0 : 1.0) * vec2(0.5*progress, 0.0);\n    float d = 1.0/(1.0+perspective*progress*(1.0-middleSlit));\n    pfr.y -= d/2.;\n    pfr.y *= d;\n    pfr.y += d/2.;\n  }\n \n  float size = mix(1.0, depth, 1.-progress);\n  pto = (p + vec2(-0.5, -0.5)) * vec2(size, size) + vec2(0.5, 0.5);\n \n  if (inBounds(pfr)) {\n    gl_FragColor = texture2D(from, pfr);\n  }\n  else if (inBounds(pto)) {\n    gl_FragColor = texture2D(to, pto);\n  }\n  else {\n    gl_FragColor = bgColor(p, pto);\n  }\n}",
  "uniforms" : {
    "reflection" : 0.4,
    "perspective" : 0.4,
    "depth" : 3.0
  },
  "html_url" : "https://gist.github.com/979934722820b5e715fa",
  "created_at" : "2014-05-16T13:54:38Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 1.0
}, {
  "id" : "731fcad4f8956866f34a",
  "name" : "randomsquares",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform ivec2 size;\nuniform float smoothness;\n \nfloat rand (vec2 co) {\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float r = rand(floor(vec2(size) * p));\n  float m = smoothstep(0.0, -smoothness, r - (progress * (1.0 + smoothness)));\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n}",
  "uniforms" : {
    "size" : [ 10.0, 10.0 ],
    "smoothness" : 0.5
  },
  "html_url" : "https://gist.github.com/731fcad4f8956866f34a",
  "created_at" : "2014-05-16T13:52:46Z",
  "updated_at" : "2016-04-17T10:50:07Z",
  "stars" : 2.0
}, {
  "id" : "df8797fd112e8e429064",
  "name" : "squeeze",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float colorSeparation;\n \nfloat progressY (float y) {\n  return 0.5 + (y-0.5) / (1.0-progress);\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n \n  float y = progressY(p.y);\n  if (y < 0.0 || y > 1.0) {\n    gl_FragColor = texture2D(to, p);\n  }\n  else {\n    vec2 fp = vec2(p.x, y);\n    vec3 c = vec3(\n      texture2D(from, fp - progress*vec2(0.0, colorSeparation)).r,\n      texture2D(from, fp).g,\n      texture2D(from, fp + progress*vec2(0.0, colorSeparation)).b\n    );\n    gl_FragColor = vec4(c, 1.0);\n  }\n}",
  "uniforms" : {
    "colorSeparation" : 0.02
  },
  "html_url" : "https://gist.github.com/df8797fd112e8e429064",
  "created_at" : "2014-05-16T13:51:39Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 0.0
}, {
  "id" : "90000743fedc953f11a4",
  "name" : "directionalwipe",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform vec2 direction;\nuniform float smoothness;\n \nconst vec2 center = vec2(0.5, 0.5);\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 v = normalize(direction);\n  v /= abs(v.x)+abs(v.y);\n  float d = v.x * center.x + v.y * center.y;\n  float m = smoothstep(-smoothness, 0.0, v.x * p.x + v.y * p.y - (d-0.5+progress*(1.+smoothness)));\n  gl_FragColor = mix(texture2D(to, p), texture2D(from, p), m);\n}",
  "uniforms" : {
    "direction" : [ 1.0, -1.0 ],
    "smoothness" : 0.5
  },
  "html_url" : "https://gist.github.com/90000743fedc953f11a4",
  "created_at" : "2014-05-16T13:50:51Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 0.0
}, {
  "id" : "7de3f4b9482d2b0bf7bb",
  "name" : "wind",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform float size;\n \nfloat rand (vec2 co) {\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float r = rand(vec2(0, p.y));\n  float m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n}",
  "uniforms" : {
    "size" : 0.2
  },
  "html_url" : "https://gist.github.com/7de3f4b9482d2b0bf7bb",
  "created_at" : "2014-05-16T13:49:36Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 0.0
}, {
  "id" : "d9f8b4df19584f1f0474",
  "name" : "fadegrayscale",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float grayPhase; // if 0.0, the image directly turn grayscale, if 0.9, the grayscale transition phase is very important\n \nvec3 grayscale (vec3 color) {\n  return vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b);\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec4 fc = texture2D(from, p);\n  vec4 tc = texture2D(to, p);\n  gl_FragColor = mix(\n    mix(vec4(grayscale(fc.rgb), 1.0), texture2D(from, p), smoothstep(1.0-grayPhase, 0.0, progress)),\n    mix(vec4(grayscale(tc.rgb), 1.0), texture2D(to,   p), smoothstep(    grayPhase, 1.0, progress)),\n    progress);\n}",
  "uniforms" : {
    "grayPhase" : 0.3
  },
  "html_url" : "https://gist.github.com/d9f8b4df19584f1f0474",
  "created_at" : "2014-05-16T13:49:13Z",
  "updated_at" : "2015-12-04T07:14:52Z",
  "stars" : 1.0
}, {
  "id" : "206b96128ad6085f9911",
  "name" : "dispersionblur",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n#define QUALITY 32\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform float size;\n \nconst float GOLDEN_ANGLE = 2.399963229728653; // PI * (3.0 - sqrt(5.0))\n \nvec4 blur(sampler2D t, vec2 c, float radius) {\n  vec4 sum = vec4(0.0);\n  float q = float(QUALITY);\n  // Using a \"spiral\" to propagate points.\n  for (int i=0; i<QUALITY; ++i) {\n    float fi = float(i);\n    float a = fi * GOLDEN_ANGLE;\n    float r = sqrt(fi / q) * radius;\n    vec2 p = c + r * vec2(cos(a), sin(a));\n    sum += texture2D(t, p);\n  }\n  return sum / q;\n}\n \nvoid main()\n{\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float inv = 1.-progress;\n  gl_FragColor = inv*blur(from, p, progress*size) + progress*blur(to, p, inv*size);\n}",
  "uniforms" : {
    "size" : 0.6
  },
  "html_url" : "https://gist.github.com/206b96128ad6085f9911",
  "created_at" : "2014-05-16T13:47:09Z",
  "updated_at" : "2016-03-25T08:12:23Z",
  "stars" : 2.0
}, {
  "id" : "d71472a550601b96d69d",
  "name" : "heartwipe",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nbool inHeart (vec2 p, vec2 center, float size) {\n  if (size == 0.0) return false;\n  vec2 o = (p-center)/(1.6*size);\n  return pow(o.x*o.x+o.y*o.y-0.3, 3.0) < o.x*o.x*pow(o.y, 3.0);\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float m = inHeart(p, vec2(0.5, 0.4), progress) ? 1.0 : 0.0;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n}",
  "uniforms" : { },
  "html_url" : "https://gist.github.com/d71472a550601b96d69d",
  "created_at" : "2014-05-16T13:46:31Z",
  "updated_at" : "2015-08-29T14:01:30Z",
  "stars" : 0.0
}, {
  "id" : "f24651a01bf574e90122",
  "name" : "fadecolor",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform vec3 color;\nuniform float colorPhase; // if 0.0, there is no black phase, if 0.9, the black phase is very important\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(\n    mix(vec4(color, 1.0), texture2D(from, p), smoothstep(1.0-colorPhase, 0.0, progress)),\n    mix(vec4(color, 1.0), texture2D(to,   p), smoothstep(    colorPhase, 1.0, progress)),\n    progress);\n}",
  "uniforms" : {
    "color" : [ 0.0, 0.0, 0.0 ],
    "colorPhase" : 0.4
  },
  "html_url" : "https://gist.github.com/f24651a01bf574e90122",
  "created_at" : "2014-05-16T13:45:46Z",
  "updated_at" : "2015-12-04T07:08:36Z",
  "stars" : 1.0
}, {
  "id" : "35e8c18557995c77278e",
  "name" : "circleopen",
  "owner" : "gre",
  "glsl" : "#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform float smoothness;\nuniform bool opening;\n \nconst vec2 center = vec2(0.5, 0.5);\nconst float SQRT_2 = 1.414213562373;\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float x = opening ? progress : 1.-progress;\n  float m = smoothstep(-smoothness, 0.0, SQRT_2*distance(center, p) - x*(1.+smoothness));\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), opening ? 1.-m : m);\n} \n",
  "uniforms" : {
    "smoothness" : 0.3,
    "opening" : true
  },
  "html_url" : "https://gist.github.com/35e8c18557995c77278e",
  "created_at" : "2014-05-16T13:40:51Z",
  "updated_at" : "2015-12-19T09:32:03Z",
  "stars" : 0.0
} ];
