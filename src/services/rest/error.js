import Bluebird from 'bluebird';

export const formatError = (err) => {
  if (err.status && err.status < 500) {
    return {
      status: err.status,
      message: err.message,
      reasons: err.reasons || null,
    };
  }

  return {
    status: 500,
    message: 'Internal Server Error',
  };
};

export const validatorError = (validators) => {
  return async (req, res, next) => {
    const errors = [];
    let havePrevError = false;
    await Bluebird.mapSeries(validators, async (validator) => {
      const result = await validator(req, havePrevError); // pass req if validator needs it
      if (result) {
        errors.push(result);
        havePrevError = true;
      }
    });

    if (errors.length) {
      return res.status(400).send({
        msg: 'Validation failed',
        reason: errors,
      });
    }

    next();
  };
};

export const err = (message, symbol) => {
  return {
    message,
    field: symbol,
  };
};
