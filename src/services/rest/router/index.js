import openPoints from './openEndPoints';
import user from './user';
import dashboard from './dashboard';

const allValidRoutes = {
  '/': openPoints,
  '/user': user,
  '/dashboard': dashboard,
};

export default (app) => {
  Object.keys(allValidRoutes).forEach((prefix) => {
    app.use(prefix, allValidRoutes[prefix]);
  });
};
