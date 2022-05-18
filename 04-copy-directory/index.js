const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const pathFromCopyFolder = path.join(__dirname, 'files');
const pathToCopyFolder = path.join(__dirname, 'files-copy');

fs.access(pathToCopyFolder, (error) => {
  if (error) {
    fsPromises.mkdir(pathToCopyFolder);
    console.log('Папка files-copy создана');
  } else {
    console.log('Папка files-copy уже существует');
  }
});

function createCopyFile(pathWhere, content) {
  fs.writeFile(pathWhere, content, (error) => {
    if (error) throw error;
  });
}

async function copyDir(fromPath, toPath) {
  await fsPromises.rm(toPath, { force: true, recursive: true });
  await fsPromises.mkdir(toPath, { recursive: true });

  const filesNameArr = await fsPromises.readdir(fromPath, { withFileTypes: true });

  for (let item of filesNameArr) {
    const currentItemPath = path.join(fromPath, item.name);
    const copyItemPath = path.join(toPath, item.name);

    if (item.isDirectory()) {
      await fsPromises.mkdir(copyItemPath, { recursive: true });
      await copyDir(currentItemPath, copyItemPath);
    } else if (item.isFile()) {
      const rs = fs.createReadStream(currentItemPath);

      let data = '';
      rs.on('data', chunk => data += chunk);
      rs.on('end', () => createCopyFile(copyItemPath, data));
      rs.on('error', err => console.log('Erroооr: ', err.message));
    }
  }
}

copyDir(pathFromCopyFolder, pathToCopyFolder);


