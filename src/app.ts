import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { dbConnection } from './configs/db';
import ErrorResponseHandler from './handlers/ErrorResponse';
import activityRoutes from './routes/activity.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import expensesRoutes from './routes/expenses.routes';
import friendsRoutes from './routes/friends.routes';
import groupsRoutes from './routes/groups.routes';
import settlementRoutes from './routes/settlement.routes';
// const authRoutes = require('./routes/auth.routes');
dotenv.config();

interface IApp {
  app: Express;
}

function App(params: IApp): Express {
  const { app } = params;
  dbConnection();
  app.use(express.json());
  app.use(
    cors({
      origin: 'http://localhost:3000', // replace with your frontend origin
      methods: ['GET', 'POST', 'PUT', 'PATCH'],
      credentials: true,
    }),
  );
  
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/groups', groupsRoutes);
  app.use('/api/expenses', expensesRoutes);
  app.use('/api/friends', friendsRoutes);
  app.use('/api/settlements', settlementRoutes);

  // app.get('/', (req: Request, res: Response) => {
  //     res.success('Hello', { foo: 'bar' });
  //     return res;
  // });

  app.use(ErrorResponseHandler);
  return app;
}
export default App;
