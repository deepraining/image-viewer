import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';
import * as AlbumsActions from '../actions/albums';

function mapStateToProps(state) {
  return {
    albums: state.albums
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AlbumsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
