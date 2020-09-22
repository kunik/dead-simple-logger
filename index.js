"use strict"

const util = require('util')

class Logger {
  constructor(namespace, level=1, gcloudJson=false) {
    this.namespace  = namespace
    this.level      = level
    this.outputJson(gcloudJson)
  }

  setLevel(level='DEBUG') {
    return this.level = Logger[`_${(level || 'DEBUG').toUpperCase()}`] || Logger._DEBUG
  }

  outputJson(enable=true) {
    this.gcloudJson = enable

    if (this.gcloudJson) {
      this._write = this._writeJson.bind(this)
    } else {
      this._write = this._writeString.bind(this)
    }
  }

  child(namespace) {
    return new Logger(`${this.namespace}:${namespace}`, this.level, this.gcloudJson)
  }

  trace(...args) {
    if (this.level > Logger._TRACE) return
    return this._write(process.stdout, args)
  }

  debug(...args) {
    if (this.level > Logger._DEBUG) return
    return this._write(process.stdout, args)
  }

  info(...args) {
    if (this.level > Logger._INFO) return
    return this._write(process.stdout, args)
  }

  warn(...args) {
    if (this.level > Logger._WARN) return
    return this._write(process.stderr, args)
  }

  error(...args) {
    if (this.level > Logger._ERROR) return
    return this._write(process.stderr, args)
  }

  timer(...args) {
    let startTime = new Date

    return {
      end: (...endArgs) => {
        let diff = (new Date) - startTime
        args = args.concat(endArgs)

        if (args.length && args[length - 1].timerLimit) {
          let timerLimit = (args.pop()).timerLimit
          if (diff < timerLimit && this.level >= Logger._INFO) return
        } else if (this.level > Logger._INFO) {
          return
        }

        this._write(process.stdout, ['%s [%dms]', format(args), (new Date) - startTime])
      }
    }
  }

  shorten(str, max_length = 5) {
    return (str && str.substring) ? `${str.substr(0, max_length)}...` : str
  }

  _writeJson(stream, args) {
    return stream.write(JSON.stringify({
      message: `[ ${this.namespace} ] ${format(args)}`,
      application: this.namespace,
      severity: 'INFO',
      timestamp: new Date().toISOString()
    }) + "\n")
  }

  _writeString(stream, args) {
    return stream.write(`${new Date().toISOString()} [ ${this.namespace} ] ${format(args)}\n`)
  }
}

Logger._TRACE = 1
Logger._DEBUG = 2
Logger._INFO  = 3
Logger._WARN  = 4
Logger._ERROR = 5

module.exports = Logger

function format(args) {
  return util.format.apply(util, args)
}
