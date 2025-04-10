import * as channel from 'ciorent/channel';
import * as cio from 'ciorent';

const c = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 5; i++) {
    await cio.sleep(100);
    channel.send(c, i);
    console.log('Sent', i);
  }

  // Resolve all waiting promises with `undefined`
  // This is a way to tell the reciever to not listen to more data
  channel.flush(c);
};

const log = async () => {
  while (true) {
    // Wait until a value is sent to the channel
    const x = await channel.recieve(c);
    if (x == null) break;

    console.log('Recieved', x);
  };
}

log();
run();

// This runs first
console.log('Starting...');
