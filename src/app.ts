import { type PrismaClient } from '@prisma/client';
import cors from 'cors';
import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';
import { UsersRepo } from './repositories/users.repo.js';
import { UsersRouter } from './routers/users.router.js';
import { UsersController } from './controllers/users.controller.js';

const debug = createDebug('TFD:app');
export const createApp = () => {
  debug('Creating app');
  return express();
};

export const startApp = (app: Express, prisma: PrismaClient) => {
  debug('Starting app');
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cors());

  const usersRepo = new UsersRepo(prisma);
  const usersController = new UsersController(usersRepo);
  const usersRouter = new UsersRouter(usersController);
  app.use('/users', usersRouter.router);
};
