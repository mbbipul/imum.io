import { app } from './app';
import 'dotenv/config'

const PORT = process.env.PORT || 5000;
if(!process.env.INITIAL_URL){
	throw new Error('Initial URL is not defined');
}

const start = async () => {
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}!!!!!!!!`);
	});
};

start();
