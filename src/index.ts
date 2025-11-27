import dotenv from 'dotenv';
import express from 'express';
import App from './app';
import { envConfiguration } from './configs/env.config';
import './configs/global.config';

dotenv.config();

let app = express();

const port = envConfiguration.PORT || 3500;

app = App({ app });

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
