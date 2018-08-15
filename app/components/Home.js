// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  onClick = () => {
    ipcRenderer.send('openDirectory');
  };

  render() {
    return (
      <div className={styles.container}>
        <button type="button" className={`clean ${styles.content}`} onClick={this.onClick}>Click to select an album!</button>
      </div>
    );
  }
}
