import * as topic from 'ciorent/topic';
import * as co from 'ciorent';

const numbers = topic.init<number>();

// Spawn 3 tasks that subscribe to the topic
co.spawn(3, async (id) => {
  const subscriber = topic.subscribe(numbers);

  while (true) {
    const msg = await topic.dispatch(subscriber);
    if (msg == null) return;
    console.log('Task', id, 'recieved:', msg);
  }
});

// Publish messages to the topic
for (let i = 0; i < 3; i++) {
  topic.publish(numbers, i);
  await co.nextTick;
}

// Send undefined to every topic
topic.flush(numbers);
