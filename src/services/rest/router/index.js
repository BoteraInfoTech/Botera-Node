import openPoints from './openEndPoints';
import user from './user';

const allValidRoutes = {
  '/': openPoints,
  '/user': user,
};

export default (app) => {
  Object.keys(allValidRoutes).forEach((prefix) => {
    app.use(prefix, allValidRoutes[prefix]);
  });
};
