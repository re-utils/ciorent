import * as topic from 'ciorent/topic';
import * as co from 'ciorent';

const messages = topic.init<number>();

// A task that publish messages
const publisher = async () => {
  for (let i = 0; i < 3; i++) {
    await co.sleep(100);
    topic.publish(messages, i);
  }

  // Resolve all waiting promises
  // And clear the value queue
  topic.flush(messages);
}

// Spawn 3 tasks that recieve messages
co.spawn(3, async (id: number) => {
  const sub = topic.subscribe(messages);

  while (true) {
    // Block until the value is sent
    const x = await topic.dispatch(sub);
    if (x == null) break;
    console.log(`Task ${id} recieved: ${x}`);
  }
});

publisher();
