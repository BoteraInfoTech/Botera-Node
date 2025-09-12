import openPoints from './openEndPoints';

const allValidRoutes = [openPoints];

export default (app) => {
  allValidRoutes.forEach((router) => {
    app.use(router);
  });
};
