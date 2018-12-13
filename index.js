const fs = require('fs'),
      path = require('path'),
      EventEmitter = require('events'),
      { promisify } = require('util')

const readFileAsync = promisify(fs.readFile),
      mkdirAsync = promisify(fs.mkdir),
      writeFileAsync = promisify(fs.writeFile),

      { posix } = path,

      isFilePath = /^([a-zA-Z\d\.\-_]+\/)*[a-zA-Z\d\.\-_]+\.[a-zA-Z]+$/

class ShardingWatcher extends EventEmitter {
  constructor(source, destination, verbose) {
    super()

    this.handler = new Promise(async (resolve, reject) => {
      this.close = resolve

      const contents = (await readFileAsync(source, 'utf8')).split('\n'),
            shards = new Map()
      
      let currentFile

      super.emit('ready')

      if(verbose) super.emit('log', 'startShardSearching', contents.length)

      for(let i = 0; i < contents.length; i++) {
        const line = contents[i]

        if(line.startsWith('//') && isFilePath.test(line.slice(2))) {
          if(currentFile) shards.set(currentFile.path, currentFile.contents.join('\n'))
          
          currentFile = {
            path: line.slice(2),
            contents: []
          }

          if(verbose) super.emit('log', 'shardFound', currentFile.path)
        } else {
          currentFile.contents.push(line)
        }
      }

      const directories = Array.from(shards)
        .map(([ file ]) => file)
        .reduce((directories, dir) => {
          posix.dirname(dir)
            .split(posix.sep)
            .map((v, i, dir) => dir.slice(0, i + 1).join(path.sep))
            .forEach(dir => directories.indexOf(dir) === -1 ? directories.push(dir) : null)

          return directories
        }, [])

      if(verbose) super.emit('log', 'startDirCreation', directories.length)

      for(let i = 0; i < directories.length; i++) {
        const dir = directories[i]

        if(verbose) super.emit('log', 'dirCreation', dir)

        await mkdirAsync(path.join(destination, dir))
      }

      if(verbose) super.emit('log', 'startFileCreation', shards.size)

      const entries = shards.entries()

      for(let i = 0; i < shards.size; i++) {
        const [file, content] = entries.next().value

        if(verbose) super.emit('log', 'fileCreation', file)

        await writeFileAsync(path.join(destination, file), content, 'utf8')
      }

      this.close(shards)
    })
      .catch(err => super.emit('error', err))
      .then(data => {
        super.emit('close', data)
        this.handler = null
      })
  }
}

module.exports = ShardingWatcher