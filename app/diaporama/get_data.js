// @flow
import random from 'lodash/random';
import { imageType } from '../reducers/types';
import transitions from './transitions';
import generator from './generator';
import getFromTo from './get_from_to';
import { easingValues } from './easing';

export default (images: Array<imageType>): {} => {
  const timeline = [];

  images.forEach(item => {
    const fromTo = getFromTo();

    timeline.push({
      kenburns: {
        easing: easingValues[random(easingValues.length - 1)],
        ...fromTo
      },
      image: item.path,
      duration: 4000,
      transitionNext: {
        name: 'directionalwipe',
        duration: 1000
      }
    });
  });

  return {
    generator,
    timeline,
    transitions
  };
};
