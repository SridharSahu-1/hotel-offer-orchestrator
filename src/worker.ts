import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run(): Promise<void> {
  const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'hotel-offer-task-queue',
    workflowsPath: require.resolve('./workflow'),
    activities,
  });
  console.log('Temporal worker started');
  await worker.run();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
