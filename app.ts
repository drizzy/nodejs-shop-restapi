import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes'

const app: Application = express();

app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  allowedHeaders: "X-Requested-With, Content-Type, x-token"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
routes(app);

export default app;