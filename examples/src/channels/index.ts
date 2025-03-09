import * as channel from 'ciorent/channel';
import * as cio from 'ciorent';

const c = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await cio.sleep(10);
    channel.send(c, i);
    console.log('Sent', i);
  }

  // Resolve all waiting promises with `undefined`
  // This is a way to tell the reciever to not listen to more data
  channel.flush(c);
};

const log = async () => {
  while (true) {
    // Block until x is recieved
    const x = await channel.recieve(c);
    if (x == null) break;

    console.log('Recieved', x);
  };
}

run();
log();

// This runs first
console.log('Starting...');
