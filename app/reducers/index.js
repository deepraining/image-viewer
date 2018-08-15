// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import albums from './albums';

const rootReducer = combineReducers({
  albums,
  router
});

export default rootReducer;
