// @flow
import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import Intro from './Intro';

const store = remote.require('./store');

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  onClick = () => {
    ipcRenderer.send('openDirectory');
  };

  render() {
    return (
      <Intro/>
    );
  }
}
