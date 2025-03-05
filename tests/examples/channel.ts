import * as channel from 'ciorent/channel';

const c = channel.init<number>();
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await sleep(10);
    channel.send(c, i);
    console.log('Sent', i);
  }

  // Send the closed signal to the reciever
  // Or else channel.recieve will block forever
  channel.close(c);
};

const log = async () => {
  do {
    // Non-blocking
    const x = await channel.recieve(c);
    if (x === channel.closed) break;
    console.log('Recieved', x);
  } while (true);
}

run();
log();

// This runs first
console.log('Starting...');
