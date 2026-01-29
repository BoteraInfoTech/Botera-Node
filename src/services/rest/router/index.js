import openPoints from './openEndPoints';
import user from './user';
import dashboard from './dashboard';
import auth from './auth';
import misc from './misc';
import account from './account';

const allValidRoutes = {
  '/': openPoints,
  '/user': user,
  '/dashboard': dashboard,
  '/auth': auth,
  '/misc': misc,
  '/account': account,
};

export default (app) => {
  Object.keys(allValidRoutes).forEach((prefix) => {
    app.use(prefix, allValidRoutes[prefix]);
  });
};
