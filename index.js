const fs = require('fs'),
      path = require('path'),

      yargs = require('yargs'),
      colors = require('colors')

const fixedLength = (string, length) => string.length > length ? `${string.slice(0, -3)}...` : string.padEnd(length),
      fileArg = file => path.isAbsolute(file) ? file : path.resolve(proces.cwd(), file)

const {source, destination, verbose} = yargs
  .alias('source', 's')
  .describe('source', 'A path pointing to the sys42.js file to shard.')
  .coerce('source', fileArg)

  .alias('destination', 'd')
  .describe('destination', 'A path pointing to the directory in which to place the sharded files.')
  .coerce('destination', fileArg)

  .alias('verbose', 'v')
  .describe('verbose', 'Print everything the sharder is doing to the console.')
  .boolean('verbose')

  .argv

let progress
  
const log = value => {
  message = fixedLength(progress.title, 24).bold
          + ` ${parseInt((progress.current / progress.total) * 100).toString()}% `.padEnd(5).yellow
          + ` [ ${fixedLength(value, 24)} ]`

  console.log(message)

  progress.current++
}

const newOperation = title => value => {
  progress = {
    total: value,
    current: 0,
    title
  }
}

new ModulizerWatcher(source, destination, verbose)
  .on('error', console.error)
  .on('ready', () => console.log(`Sharding ${source}...`))
  .on('log', (name, value) => [
    newOperation('Finding shards...'),
    log,
    newOperation('Creating directories...'),
    log,
    newOperation('Creating files...')
  ][name](value))
  .on('close', () => console.log('Done!'.brightGreen))