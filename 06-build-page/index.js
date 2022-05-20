const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const pathCreateFolder = path.join(__dirname, 'project-dist');
const pathNewAssets = path.join(pathCreateFolder, 'assets');
const pathNewCss = path.join(pathCreateFolder, 'style.css');
const pathNewHtml = path.join(pathCreateFolder, 'index.html');


const pathComponents = path.join(__dirname, 'components');
const pathAssets = path.join(__dirname, 'assets');
const pathCss = path.join(__dirname, 'styles');
const pathTemplateHtml = path.join(__dirname, 'template.html');

async function createFolder(inputPath) {
  fs.access(pathCreateFolder, (error) => {
    if (error) {
      fsPromises.mkdir(inputPath);
    }
  });
}

async function createFile(inputPath, content) {
  return await fsPromises.writeFile(inputPath, content);
}

async function mergeFiles() {
  let arrOfStyles = [];
  const filesNameArr = await fsPromises.readdir(pathCss, { withFileTypes: true });

  for (let item of filesNameArr) {
    const pathToCurrentFile = path.join(pathCss, item.name);
    const fileType = path.extname(pathToCurrentFile);

    if (fileType === '.css') {
      const cssContent = await fsPromises.readFile(pathToCurrentFile, 'utf8');
      arrOfStyles.push(cssContent);
    }
  }

  createFile(pathNewCss, arrOfStyles);
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
      await fsPromises.copyFile(currentItemPath, copyItemPath);
    }
  }
}

async function pasteComponents() {
  const rs = fs.createReadStream(pathTemplateHtml);

  let data = '';
  rs.on('data', chunk => data += chunk);
  rs.on('end', () => {
    let templates = data.match(/{{[A-z]*}}/g);

    templates.forEach(item => {
      let template = item.replace(/([^A-z]*)/g, '');

      fsPromises.readFile(path.join(pathComponents, `${template}.html`), 'utf-8')
        .then(componentContent => {
          data = data.replace(item, componentContent);
          createFile(pathNewHtml, data);
        });
    });
  });
}

function buildPage() {
  createFolder(pathCreateFolder);
  mergeFiles();
  copyDir(pathAssets, pathNewAssets);
  pasteComponents();
}

buildPage();