import * as stream from 'ciorent/stream';
import * as co from 'ciorent';

const numbers = stream.init<number>();

// Spawn 3 tasks that read from the stream
co.spawn(3, async (id) => {
  while (true) {
    const msg = await stream.read(numbers);
    if (msg == null) return;
    console.log('Task', id, 'recieved:', msg);
  }
});

// Write messages to the stream
for (let i = 0; i < 3; i++) {
  stream.write(numbers, i);
  await co.nextTick;
}

// Send undefined to every stream
stream.flush(numbers);
