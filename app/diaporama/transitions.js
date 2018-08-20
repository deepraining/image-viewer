// @flow
import fs from 'fs';
import path from 'path';
import trimEnd from 'lodash/trimEnd';

export type transitionType = {
  glsl: string,
  uniforms: {},
  name: string
};

const validTypes: Array<string> = ['int', 'float', 'bool', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4'];

const makeUniform = (str: string): { success: boolean, key?: string, value?: mixed } => {
  // uniform float startingAngle; // = 90; // description.
  const arr = str.split('//');

  if (arr.length < 2) return {success: !1};

  const expression = trimEnd(arr[0].trim(), ';'); // uniform float startingAngle
  const defaultValueExpression = trimEnd(arr[1].trim(), ';'); // = 90

  // expression
  const expressionArray = expression.split(/\s+/);
  const type = expressionArray[1];
  const name = expressionArray[2];

  if (validTypes.indexOf(type) < 0) return {success: !1};

  // default value
  const defaultValue = defaultValueExpression.split('=')[1].trim();
  let value;
  if (type === 'int') value = parseInt(defaultValue, 10);
  else if (type === 'float') value = parseFloat(defaultValue);
  else if (type === 'bool') value = defaultValue === 'false' ? false : !!defaultValue;
  else if (type === 'vec2') {
    // vec2(1.0), vec2(1.0, 2.0)
    const tmpValue = defaultValue.replace('vec2(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    value = [parseFloat(value1), parseFloat(value2)];
  }
  else if (type === 'vec3') {
    // vec3(1.0), vec3(1.0, 2.0, 3.0)
    const tmpValue = defaultValue.replace('vec3(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    const value3 = typeof tmpValue[2] === 'undefined' ? tmpValue[0] : tmpValue[2];
    value = [parseFloat(value1), parseFloat(value2), parseFloat(value3)];
  }
  else if (type === 'vec4') {
    // vec4(1.0), vec4(1.0, 2.0, 3.0, 4.0)
    const tmpValue = defaultValue.replace('vec4(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    const value3 = typeof tmpValue[2] === 'undefined' ? tmpValue[0] : tmpValue[2];
    const value4 = typeof tmpValue[3] === 'undefined' ? tmpValue[0] : tmpValue[3];
    value = [parseFloat(value1), parseFloat(value2), parseFloat(value3), parseFloat(value4)];
  }
  else if (type === 'ivec2') {
    // ivec2(1), ivec2(1, 2)
    const tmpValue = defaultValue.replace('ivec2(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    value = [parseInt(value1, 10), parseInt(value2, 10)];
  }
  else if (type === 'ivec3') {
    // ivec3(1), ivec3(1, 2, 3)
    const tmpValue = defaultValue.replace('ivec3(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    const value3 = typeof tmpValue[2] === 'undefined' ? tmpValue[0] : tmpValue[2];
    value = [parseInt(value1, 10), parseInt(value2, 10), parseInt(value3, 10)];
  }
  else if (type === 'ivec4') {
    // ivec4(1), ivec4(1, 2, 3, 4)
    const tmpValue = defaultValue.replace('ivec4(', '').replace(')', '').split(',');
    const value1 = tmpValue[0];
    const value2 = typeof tmpValue[1] === 'undefined' ? tmpValue[0] : tmpValue[1];
    const value3 = typeof tmpValue[2] === 'undefined' ? tmpValue[0] : tmpValue[2];
    const value4 = typeof tmpValue[3] === 'undefined' ? tmpValue[0] : tmpValue[3];
    value = [parseInt(value1, 10), parseInt(value2, 10), parseInt(value3, 10), parseInt(value4, 10)];
  }

  return {success: !0, key: name, value};
};

const transitions: Array<transitionType> = [];

const transitionsDirPath = path.join(__dirname, '../../transitions');

fs.readdirSync(transitionsDirPath).forEach(file => {
  const name = file.split('.')[0];
  const content = fs.readFileSync(path.join(transitionsDirPath, file));
  const uniforms = {};

  const uniformsMatchRegExp = /\n(\s*uniform\s+[^\n]+)\n/g;
  let result;
  while (result = uniformsMatchRegExp.exec(content)) {
    if (result[1]) {
      const uniformResult = makeUniform(result[1]);
      // Has invalid uniform.
      if (!uniformResult.success) return;

      uniforms[uniformResult.key] = uniformResult.value;
    }
  }

  transitions.push({
    name,
    uniforms,
    glsl: content
  });
});

export default transitions;
