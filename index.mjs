import fs from 'fs'
import srtParser2 from "srt-parser-2";
import util from 'util'
import dotenv from 'dotenv'
dotenv.config({ path: "./.env" })

const token = process.env.TOKEN
//promisify the utils functions
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const parser = new srtParser2();


const parts = [];
async function readSrtFile(filePath, partNumber = 8) {
  try {
    const srtFile = await readFile(filePath, { encoding: 'utf-8' });
    const parsFile = parser.fromSrt(srtFile);
    const eachPart = Math.ceil(parsFile.length / partNumber);
    for (let i = 0; i < partNumber; i++) {
      const start = i * eachPart;
      const end = start + eachPart;
      const file = parsFile.slice(start, end)
      parts.push(file);
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

async function translate_part(index) {
  try {
    const text = parser.toSrt(parts[index]);
    const query = `i will give you a string,this string is a part of subtitle, i need to translate the text to Farsi translate good and good for unerstand of this subtitle text,and replace the new text 
    to oldest text, please follow this role, dont change anything,dont send any message like ok,just translate text not any elsem,dont change indent like added space enter anyone else ,just translate text and return with new text with that format,just do your work subtitle file this =>${encodeURI(text)}`
    const url = `https://one-api.ir/chatgpt/?token=${token}&action=gpt4-turbo&q=${query}`
    const response = await fetch(url, { method: "get" });
    let { result } = await response.json()
    // const newText = parser.fromSrt(result[0])
    parts[index] = result[0]
  } catch (error) {
    throw new Error(error.message)
  }
}



async function main() {
  await readSrtFile('filepath.srt');
  await Promise.all([translate_part(0), translate_part(1), translate_part(2), translate_part(3), translate_part(4), translate_part(5), translate_part(6), translate_part(7)])
  await writeFile('.destFile.srt', parts.join(''), 'utf8')
}

main();
