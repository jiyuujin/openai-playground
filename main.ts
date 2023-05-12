import { Configuration, OpenAIApi } from 'openai'
import ytdl from 'ytdl-core'
import * as fs from 'fs'

const configuration = new Configuration({
  apiKey: '',
})
const openai = new OpenAIApi(configuration)

// Chat Model: gpt-3.5-turbo, whisper-1
const OPENAI_MODEL = {
  CHATGPT: 'gpt-3.5-turbo',
  WHISPER: 'whisper-1',
}

function initialize(link) {
  const videoStream = fs.createWriteStream('video.mp4')
  ytdl(link, { quality: 'lowest' }).pipe(videoStream)

  videoStream.on('finish', async () => {
    const transcribe = await openai.createTranscription(
      fs.createReadStream('./video.mp4'),
      OPENAI_MODEL.CHATGPT,
    )

    getSummary(transcribe.data.text)
  })
}

async function getSummary(text) {
  const summaryStream = fs.createWriteStream('summary.txt');

  const prompt = `Please summary this text: ${text}`

  const completion = await openai.createChatCompletion({
    model: OPENAI_MODEL.WHISPER,
    messages: [{ role: 'user', content: prompt }],
  })

  summaryStream.write(completion.data.choices[0].message.content)
}

initialize('https://youtu.be/77Wu-FoL0BY')
