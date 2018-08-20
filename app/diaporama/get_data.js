// @flow
import { remote } from 'electron';
import random from 'lodash/random';
import transitions from './transitions';
import { imageType } from '../reducers/types';
import generator from './generator';
import getFromTo from './get_from_to';
import easing, { easingValues } from './easing';

export default (images: Array<imageType>): {} => {
  const config = remote.require('./config');

  const timeline = [];

  images.forEach(item => {
    const fromTo = getFromTo();

    let easingFunc;

    if (config.easing === 'random')
      easingFunc = easingValues[random(easingValues.length - 1)];
    else easingFunc = easing[config.easing];

    let transitionName;
    if (config.transition === 'none') transitionName = undefined;
    else if (config.transition === 'random')
      transitionName = transitions[random(transitions.length - 1)].name;
    else if (
      !transitions.find(
        transitionItem => transitionItem.name === config.transition
      )
    )
      transitionName = undefined;
    else transitionName = config.transition;

    timeline.push({
      kenburns: {
        easing: easingFunc,
        ...fromTo
      },
      image: item.path,
      duration: config.duration || 4000,
      transitionNext: {
        name: transitionName,
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
