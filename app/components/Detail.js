// @flow
import React, {Component} from 'react';
import ImageZoom from 'react-medium-image-zoom';
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

    const {match} = this.props;
    const {id} = match.params;
    const {albums} = share.store.getState();

    this.id = id;
    this.album = albums.find(item => item.id === id);
  }

  itemsJsx() {
    const {images} = this.album;

    return images.map(item => (
      <div className={styles.item} key={item.name}>
        <div className={styles.inner}>
          <ImageZoom
            image={{
              src: item.path,
              alt: item.name,
              className: styles.image
            }}
            zoomImage={{
              src: item.path,
              alt: item.name
            }}
          />
          {/* <img className={styles.image} src={item.path} alt="cover"/> */}
        </div>
      </div>
    ));
  }

  back = () => {
    window.history.back();
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button type="button" className={`clean ${styles.action} fa fa-less-than fl-left`} title="go back"
          onClick={this.back}/>
          <div className={styles.title}>{this.album.name}</div>
        </div>
        <div className={styles.content}>{this.itemsJsx()}</div>
      </div>
    );
  }
}
