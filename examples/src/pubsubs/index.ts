import * as topic from 'ciorent/topic';
import * as cio from 'ciorent';

const messages = topic.init<number>();

// A task that publish messages
const publisher = async () => {
  for (let i = 0; i < 3; i++) {
    await cio.sleep(100);
    topic.pub(messages, i);
  }

  // Resolve all waiting promises
  // And clear the value queue
  topic.flush(messages);
}

// Spawn 3 tasks that recieve messages
cio.concurrent(3, async (id: number) => {
  const sub = topic.sub(messages);

  while (true) {
    // Block until the value is sent
    const x = await topic.recieve(sub);
    if (x == null) break;
    console.log(`Task ${id} recieved: ${x}`);
  }
});

publisher();
