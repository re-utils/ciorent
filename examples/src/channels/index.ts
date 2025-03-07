import * as channel from 'ciorent/channel';
import * as cio from 'ciorent';

const c = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await cio.sleep(10);
    channel.send(c, i);
    console.log('Sent', i);
  }

  // Send the closed signal to the reciever
  // Or else channel.recieve will block forever
  channel.close(c);
};

const log = async () => {
  while (true) {
    // Non-blocking
    const x = await channel.recieve(c);

    // 'recieve' returns undefined if
    // The channel has been closed
    if (x == null) break;

    console.log('Recieved', x);
  };
}

run();
log();

// This runs first
console.log('Starting...');
