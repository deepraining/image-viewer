// @flow
import React, { Component } from 'react';
import Detail from '../components/Detail';

type Props = {
  match: {},
  location: {},
  history: {}
};

export default class DetailPage extends Component<Props> {
  props: Props;

  render() {
    return <Detail {...this.props}/>;
  }
}
