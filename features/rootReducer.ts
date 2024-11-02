import { combineReducers } from "redux";

// import RtkQueryService from '@/services/RtkQueryService'
import base from "./slices/base";

const staticReducers = {
  base,
  // [RtkQueryService.reducerPath]: RtkQueryService.reducer,
};

const rootReducer = (asyncReducers: any) => (state: any, action: any) => {
  const combinedReducer = combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
  return combinedReducer(state, action);
};

export default rootReducer;
