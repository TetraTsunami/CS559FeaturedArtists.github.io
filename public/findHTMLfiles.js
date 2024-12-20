import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import process from 'process';

function getHtmlFiles(dir, fileList = []) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            getHtmlFiles(filePath, fileList);
        } else if (extname(file) === '.html') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function formatHtmlFiles(fileList) {
    return fileList.map(file => ({
        link: file.replace(/\\/g, '/'),
        title: "a"
    }));
}

const currentDir = process.cwd();
const htmlFiles = getHtmlFiles(currentDir);
const formattedHtmlFiles = formatHtmlFiles(htmlFiles); 

console.log(JSON.stringify(formattedHtmlFiles, null, 2));