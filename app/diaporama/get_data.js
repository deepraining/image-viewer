// @flow
import { remote } from 'electron';
import random from 'lodash/random';
import { imageType } from '../reducers/types';
import transitions from './transitions';
import generator from './generator';
import getFromTo from './get_from_to';
import easing, { easingValues } from './easing';

export default (images: Array<imageType>): {} => {
  const config = remote.require('./config');

  const timeline = [];

  let easingFunc;

  if (config.easing === 'random')
    easingFunc = easingValues[random(easingValues.length - 1)];
  else easingFunc = easing[config.easing];

  images.forEach(item => {
    const fromTo = getFromTo();

    timeline.push({
      kenburns: {
        easing: easingFunc,
        ...fromTo
      },
      image: item.path,
      duration: config.duration || 4000,
      transitionNext: {
        name: 'directionalwipe',
        duration: config.transitionDuration || 1000
      }
    });
  });

  return {
    generator,
    timeline,
    transitions
  };
};
