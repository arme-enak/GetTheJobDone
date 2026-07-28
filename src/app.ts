import express from 'express';
import userRoutes from './modules/user/user.routes';
import taskRoutes from './modules/task/task.routes';
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import { notFound } from './middleware/notFound';
import { appError } from './middleware/errorHandler';
import { yoga } from './graphql/server';

//app.use(cors());
const app = express();

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', taskRoutes);
app.use('/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/graphql', yoga);

app.get('/healthCheck', (req, res) => {
    res.send('Hello World!');
});

app.use(notFound);
app.use(appError);

export default app;