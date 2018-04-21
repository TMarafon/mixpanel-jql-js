# mixpanel-jql-js

#How to install
```javascript
npm install mixpanel-jql-js --save
```

#How to use it: 

## Initialization
```javascript
let mixpanel = require('mixpanel-jql-js')

mixpanel.init('sfh78hsfsdfh030h5i3398fh9f8') //MixPanel key
```

## Complete example
```javascript
let mixpanel = require('mixpanel-jql-js')
mixpanel.init('sfh78hsfsdfh030h5i3398fh9f8')

let queries = mixpanel.queries

let moment = require('moment')


let queryMap = {
  "'userId'": queries.getUserProperty('userId'),
  "'eventId'": queries.getEventProperty("eventId"),
  "'createdAt'": queries.getEventProperty('createdAt')
}

var query = queries.Query()
query.setPeriod(queries.periods.custom(moment().subtract(1, 'days'), moment()))
query.setEvent("Event Name")
query.setMap(queryMap)
query.setFilter(queries.getUserProperty('user_id') + "== '9FDH893H989A913D3F143927'")

mixpanel.executeQuery(query).then(function (result) {
  console.log(result.data)
}).catch(function (err) {
  console.log(err)
})
```
