// @flow
import React, { Component } from 'react';
import find from 'lodash/find';
import type { albumType } from '../reducers/types';
import styles from './Detail.scss';
import share from '../share_in_renderer';

type Props = {
  match: {},
  location: {},
  history: {}
};

export default class Home extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    const { match } = this.props;
    const { id } = match.params;
    const { albums } = share.store.getState();

    this.id = id;
    this.album = albums.find(item => item.id === id);
  }

  itemsJsx() {
    const { images } = this.album;

    return images.map(item => (
      <div className={styles.item}>
        <div className={styles.inner}>
          <img className={styles.image} src={item.path} alt="cover"/>
        </div>
      </div>
    ));
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button type="button" className={`clean ${styles.action} fa fa-less-than`} title="go back"/>
        </div>
        <div className={styles.content}>{this.itemsJsx()}</div>
      </div>
    );
  }
}
