import { pause } from 'ciorent';

const task1 = async () => {
  for (let i = 0; i < 10; i++) {
    await pause;
    console.log('Task 1:', i);
  }
};

const task2 = async () => {
  for (let i = 0; i < 10; i++) {
    await Bun.sleep(0);
    console.log('Task 2:', i);
  }
};

task1();
task2();
