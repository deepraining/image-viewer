// @flow
import React, { Component, createRef } from 'react';
import Diaporama from 'diaporama';
import styles from './Play.scss';
import share from '../share_in_renderer';
import getDiaporamaData from '../diaporama/get_data';

type Props = {
  match: {},
  location: {},
  history: {}
};

export default class Home extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.contentElement = createRef();
    this.closeElement = createRef();

    const { match } = this.props;
    const { id } = match.params;
    const { albums } = share.store.getState();

    this.id = id;
    this.album = albums.find(item => item.id === id);

    this.resize = this.resize.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {
    const { images } = this.album;

    this.diaporama = Diaporama(
      this.contentElement.current,
      getDiaporamaData(images),
      {
        autoplay: true,
        loop: true
      }
    );

    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
    if (this.hideCloseTimer) clearTimeout(this.hideCloseTimer);

    this.diaporama.destroy();
    this.diaporama = null;
  }

  resize() {
    const threshold = 1024 * 512;

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.diaporama.width = w;
    this.diaporama.height = h;
    // heuristic to degrade
    this.diaporama.resolution = Math.min(
      window.devicePixelRatio || 1,
      Math.ceil(threshold / (w * h))
    );
  }

  mouseMove() {
    if (this.hideCloseTimer) clearTimeout(this.hideCloseTimer);
    this.closeElement.current.classList.add(styles.active);

    this.hideCloseTimer = setTimeout(() => {
      this.closeElement.current.classList.remove(styles.active);
    }, 3000);
  }

  keyDown(e) {
    switch (e.which) {
      case 38: // Up
        this.diaporama.playbackRate *= 1.5;
        break;
      case 40: // Down
        this.diaporama.playbackRate /= 1.5;
        break;
      case 37: // Left
        this.diaporama.prev();
        break;
      case 39: // Right
        this.diaporama.next();
        break;
      case 32: // Space
        this.diaporama.paused = !this.diaporama.paused;
        break;
      default:
        break;
    }
  }

  addListeners() {
    window.addEventListener('resize', this.resize);
    this.resize();

    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('keydown', this.keyDown);
  }

  removeListeners() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('keydown', this.keyDown);
  }

  back = () => {
    window.history.back();
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.content} ref={this.contentElement} />
        <button
          type="button"
          className={`clean ${styles.close} fa fa-times`}
          onClick={this.back}
          ref={this.closeElement}
        />
      </div>
    );
  }
}
