import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import responseTime from 'response-time';
import zlib from 'zlib';
import registerRoutes from './router/index';
import '../../mongoDB/index';

const app = express();

// Add middlewares
app.use(responseTime());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json()); // Parse JSON
app.use(bodyParser.text()); // Parse plain text
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(422).json({ error: 'Invalid Body' });
  }
  next();
});

app.use(
  compression({
    filter: (req, res) => {
      if (/text/i.test(res.getHeader('Content-Type'))) {
        return true;
      }
      return false;
    },
    threshold: 2097152, // 2MB
    flush: zlib.Z_SYNC_FLUSH,
  })
);
// Setup REST APIs
registerRoutes(app);

export default app;
