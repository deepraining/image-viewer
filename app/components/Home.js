// @flow
import React, { Component } from 'react';
import { notification } from 'antd';
import Intro from './Intro';
import type { albumType } from '../reducers/types';
import styles from './Home.scss';

type Props = {
  albums?: Array<albumType>,
  clear: () => void,
  del: (id: number) => void
};

export default class Home extends Component<Props> {
  props: Props;

  static defaultProps = {
    albums: []
  };

  constructor(props) {
    super(props);

    this.deleteAllAlbums = this.deleteAllAlbums.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
  }

  deleteAllAlbums() {
    const { clear } = this.props;

    clear();

    notification.success({
      message: 'Delete',
      description: 'Delete all albums successfully.'
    });
  }

  onClickDelete(e) {
    const { del } = this.props;
    const id: string = e.target.getAttribute('data-id');

    del(id);

    notification.success({
      message: 'Delete',
      description: 'Delete album successfully.'
    });
  }

  itemsJsx() {
    const { albums } = this.props;

    return albums.map(item => (
      <div className={styles.item} key={item.id}>
        <div className={styles.inner}>
          <div
            className={styles.cover}
            style={{ backgroundImage: `url("${item.cover}")` }}
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={`clean ${styles.action} fa fa-ban fl-right`}
              title="delete"
              onClick={this.onClickDelete}
              data-id={item.id}
            />
            <button
              type="button"
              className={`clean ${styles.action} fa fa-sync-alt fl-right`}
              title="refresh"
            />
          </div>
        </div>
      </div>
    ));
  }

  render() {
    const { albums = [] } = this.props;

    if (!albums || !albums.length) return <Intro />;

    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          {/* <button type="button" className={`clean ${styles.action} fa fa-less-than`} title="go back"/> */}
          <button
            type="button"
            className={`clean ${styles.action} fa fa-ban fl-right`}
            title="delete all albums"
            onClick={this.deleteAllAlbums}
          />
          <button
            type="button"
            className={`clean ${styles.action} fa fa-sync-alt fl-right`}
            title="refresh all albums"
          />
        </div>
        <div className={styles.content}>{this.itemsJsx()}</div>
      </div>
    );
  }
}
