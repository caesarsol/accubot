const botkit = require('botkit')
const figlet = require('figlet')
const express = require('express')
const fetch = require('isomorphic-fetch')

const app = express()
app.listen(1234)

////

const botCtl = botkit.slackbot({
  debug: false,
  log: true,
})

let webAddressToPing = ''
botCtl.spawn({ token: process.env.ACCUBOT_SLACK_TOKEN }).startRTM((err, bot, payload) => {
  if (err) throw err

  bot.say({
    text: `connected ${new Date()}`,
    channel: '@caesarsol',
  })

  app.get('/', function (req, res) {
    console.log('# Pong')

    bot.say({
      text: 'pong',
      channel: '@caesarsol',
    })
    res.send(`Hello, I'm accubot!`)
  })

  setInterval(() => {
    console.log('# Ping...')
    if (!webAddressToPing) return

    bot.say({
      text: 'ping...',
      channel: '@caesarsol',
    })

    fetch(webAddressToPing)
      .then(() => {
        console.log('# Ping succeeded')
      })
      .catch((err) => {
        bot.say({
          text: `failed ping to ${webAddressToPing}:\n> ${err}`,
          channel: '@caesarsol',
        })
      })
  }, 1000 * 60)
})

botCtl.hears('hello', 'direct_message', (bot, message) => {
  bot.reply(message, 'Hello human.')
})

botCtl.hears(['figlet (.*)'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const text = message.match[1]

  figlet(text, { font: 'Big Money-nw' }, (err, fig) => {
    if (err) return bot.reply(message, '`!!! Error:' + err + '`')
    console.log(fig)
    bot.reply(message, '```\n\n' + fig + '```')
  })
})

botCtl.hears(['^ping (.*)'], ['direct_message'], (bot, message) => {
  const text = message.match[1]

  webAddressToPing = text === 'disabled' ? '' : text

  bot.say({
    text: `ok, ping is ${text}`,
    channel: '@caesarsol',
  })
})

botCtl.on('rtm_close', (bot) => {
  bot.say({
    text: `bye`,
    channel: '@caesarsol',
  })
})
