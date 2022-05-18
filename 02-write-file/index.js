const fs = require('fs');
const path = require('path');

const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const writableStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));

rl.write('Введите ваш текст, пожалуйста!\n');

rl.on('line', (text) => {
  if (text === 'exit') rl.close();

  writableStream.write(`${text}\n`, error => {
    if (error) throw error;
  });
});

rl.on('close', () => {
  process.exit();
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', code => {
  if (code === 0) {
    console.log('Спасибо за уделенное время на проверку!');
  } else {
    console.log(`Ууупс, ошибка с кодом ${code}`);
  }
});