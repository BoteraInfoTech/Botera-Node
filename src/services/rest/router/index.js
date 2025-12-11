import openPoints from './openEndPoints';
import user from './user';
import dashboard from './dashboard';
import auth from './auth';
import misc from './misc';

const allValidRoutes = {
  '/': openPoints,
  '/user': user,
  '/dashboard': dashboard,
  '/auth': auth,
  '/misc': misc,
};

export default (app) => {
  Object.keys(allValidRoutes).forEach((prefix) => {
    app.use(prefix, allValidRoutes[prefix]);
  });
};
