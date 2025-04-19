import * as topic from 'ciorent/topic';
import * as co from 'ciorent';

const numbers = topic.init();

co.spawn(3, async (id) => {
  const subscriber = topic.subscribe(numbers);

  while (true) {
    const msg = await topic.dispatch(subscriber);
    if (msg == null) return;
    console.log('Task', id, 'recieved:', msg);
  }
});

for (let i = 0; i < 3; i++) {
  topic.publish(numbers, i);
  await co.nextTick;
}
