import * as channel from 'ciorent/channel';
import * as co from 'ciorent';

const chan = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 5; i++) {
    await co.sleep(100);
    channel.send(chan, i);
    console.log('Sent', i);
  }

  // Resolve all waiting promises with `undefined`
  // This is a way to tell the reciever to not listen to more data
  channel.flush(chan);
};

const log = async () => {
  while (true) {
    // Wait until a value is sent to the channel
    const x = await channel.recieve(chan);
    if (x == null) break;

    console.log('Recieved', x);
  };
}

log();
run();

// This runs first
console.log('Starting...');
