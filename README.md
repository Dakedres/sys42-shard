# sys42-shard

A utility to shard the Windows93 sys42.js file. Please note this package only works in *NIX operating systems, if there's enough demand for it I'll add functionality for Windows.

## Installation

    git clone https://github.com/Dakedres/sys42-shard.git
    cd sys42-shard
    npm install
    npm run init

Then go ahead and run `./cli --help`, you can go onto [usage](#usage) for more details.

If for some reason you want to be able to use sys42-shard globally (although I wouldn't recommend it) you can do so by running `npm link` in the package's directory. And to put it back in it's place you can use `npm unlink` (while in it's directory mind you).

## Usage

  If you go ahead and run `./cli help` you'll get this nifty little menu:

    Options:
      --help             Show help [boolean]
      --version          Show version number [boolean]
      --source, -s       A path pointing to the sys42.js file to shard. [required]
      --destination, -d  A path pointing to the directory in which to place the sharded files.
      --isolate, -i      Whether or not to create a directory in the destination directory to place the sharded files in. [boolean]
      --verbose, -v      Print everything the sharder is doing to the console. [boolean]

  If you don't have time for reading, essentially it's just:

    ./cli --source <path to sys42.js> --destination <output folder>

## Programmatic Usage

`sys24-shard` can be used programmatically, but I am honestly too lazy to write any documentation for it. If you really want it place an issue containing approximately 152 Latin Capital "A"s, and I'll think about it