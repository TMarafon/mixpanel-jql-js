const https = require('https')
const moment = require('moment')
const _ = require('underscore')

function init (id) {
  process.env.mixpanelId = id
}

function executeQuery (query) {
  return new Promise(function (resolve, reject) {

    if (!process.env.mixpanelId) {
      reject('Before querying, you need to call the mixpanel.init(key) function, passing your MixPanel key')
      return
    }

    var url = 'mixpanel.com'
    var path = '/api/2.0/jql'

    var postBody = encodeURI('script=' + query.toString()).split('&').join('%26')
    var options = getConnectionOptions(url, path, postBody)
    const req = https.request(options, (res) => {
      var returnFromServer = ''

      res.on('data', function (data) {
        returnFromServer += String(data)
      })

      res.on('end', function () {
        var result = {}
        result.data = JSON.parse(returnFromServer)
        result.query = query
        resolve(result)
      })
    })

    req.on('error', (e) => {
      reject(e)
    })

    req.write(postBody)
    req.end()
  })
}

function getConnectionOptions (url, path, body) {
  return {
    hostname: url,
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    },
    auth: process.env.mixpanelId + ': '
  }
}

let queries = {

  Query: function (query) {
    if (!query) query = queries.queryPool.template
    this.query = query.toString().split('\n').join('')

    this.setPeriod = function (period) {
      var periodString = JSON.stringify(period).split('"').join("\'")
      this.query = this.query.split('$period').join(periodString)
    }

    this.setMap = function (map) {
      var mapString = JSON.stringify(map).split('"').join('')
      this.query = this.query.split('$map').join(mapString)
    }

    this.setFilter = function (filter) {
      var filterString = JSON.stringify(filter).split('"').join('')
      this.query = this.query.split('$filter').join(filterString)
    }

    this.setEvent = function (event) {
      this.query = this.query.split('$event').join(event)
    }

    this.toString = function () {
      return this.query
    }

    return _.clone(this)
  },

  queryPool: {
    template: function main () {
      return join(
        Events($period)
        , People(),
        {
          type:"inner",
          selectors:[
            { event: '$event'}
          ]
        }
      ).filter(function(item) {
        return $filter
      }).map(function(item) {
        return $map
      })
    }
  },

  periods: {
    today: {
      from_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      to_date: moment().format('YYYY-MM-DD')
    },
    last7Days: {
      from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      to_date: moment().format('YYYY-MM-DD')
    },
    last30Days: {
      from_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
      to_date: moment().format('YYYY-MM-DD')
    },
    last1Year: {
      from_date: moment().subtract(1, 'years').format('YYYY-MM-DD'),
      to_date: moment().format('YYYY-MM-DD')
    },
    custom: function (start, end) {
      return {
        from_date: start.format('YYYY-MM-DD'),
        to_date: end.format('YYYY-MM-DD')
      }
    }
  },

  getPeriod: function (string) {
    var period = this.periods[string]
    if (!period) period = this.periods.last30Days
    return period
  },

  getEventProperty : function (name) {
    return "item.event.properties['" + name + "']"
  },

  getUserProperty : function (name) {
    return "item.user.properties['" + name + "']"
  }

}

module.exports = {
  executeQuery,
  init,
  queries
}
