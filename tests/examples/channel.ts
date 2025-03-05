import { pause } from 'ciorent';
import * as channel from 'ciorent/channel';

const c = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await pause;
    channel.send(c, i);
  }
  channel.close(c);
};

const log = async () => {
  do {
    const x = await channel.recieve(c);
    if (x === channel.closed) break;
    console.log(x);
  } while (true);
}

run();
log();

// Non-blocking
console.log('x');
