// @flow
import React, { Component } from 'react';
import Play from '../components/Play';

type Props = {
  match: {},
  location: {},
  history: {}
};

export default class PlayPage extends Component<Props> {
  props: Props;

  render() {
    return <Play {...this.props} />;
  }
}
