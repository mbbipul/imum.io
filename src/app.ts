import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use('/hello',async (req,res) => {
	res.send('Hello World');
});

app.all('*', async (req, res) => {
  	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
