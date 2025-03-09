import * as topic from 'ciorent/topic';
import * as cio from 'ciorent';

const messages = topic.init<number>();

// A task that publish messages
const publisher = async () => {
  for (let i = 0; i < 5; i++) {
    await cio.sleep(50);
    topic.pub(messages, i);
  }
}

// Spawn 5 tasks that recieve messages
cio.concurrent(5, async (id: number) => {
  const sub = topic.sub(messages);

  while (true) {
    const x = await topic.next(sub);
    if (x == null) break;
    console.log(`Task ${id}: ${x}`);
  }
});

publisher();
