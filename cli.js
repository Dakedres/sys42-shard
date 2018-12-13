#!/usr/bin/env node

const fs = require('fs'),
      path = require('path'),
      { promisify } = require('util')

      yargs = require('yargs'),
      colors = require('colors')

const mkdirAsync = promisify(fs.mkdir)

const ShardingWatcher = require('./index.js')

const fixedLength = (string, length) => string.length > length ? `${string.slice(0, -3)}...` : string.padEnd(length),
      fileArg = file => path.isAbsolute(file) ? file : path.resolve(process.cwd(), file)

let {source, destination, isolate, verbose} = yargs
  .alias('source', 's')
  .describe('source', 'A path pointing to the sys42.js file to shard.')
  .coerce('source', fileArg)
  .demandOption('source')

  .alias('destination', 'd')
  .describe('destination', 'A path pointing to the directory in which to place the sharded files.')
  .coerce('destination', fileArg)
  .demandOption('source')

  .alias('isolate', 'i')
  .describe('isolate', 'Whether or not to create a directory in the destination directory to place the sharded files in.')
  .boolean('isolate')

  .alias('verbose', 'v')
  .describe('verbose', 'Print everything the sharder is doing to the console.')
  .boolean('verbose')

  .argv

;(async () => {
  console.log('Sharding sys42.js!'.green)

  if(isolate) {
    destination = path.join(destination, 'sys42')

    console.log('Creating directory to place files in...'.dim)
    await mkdirAsync(destination)
  }

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

  const shards = await new Promise((resolve, reject) => 
    new ShardingWatcher(source, destination, verbose)
      .on('error', console.error)
      .on('ready', () => console.log(`Sharding ${source}...`))
      .on('log', (name, value) => ({
        'startShardSearching': newOperation('Finding shards...'),
        'shardFound': log,
        'startDirCreation': newOperation('Creating directories...'),
        'dirCreation': log,
        'startFileCreation': newOperation('Creating files...'),
        'fileCreation': log
      })[name](value))
      .on('close', resolve)
  )

  console.log(`Created ${shards.size} shards!`.dim)
  console.log('Done!'.green)
})()