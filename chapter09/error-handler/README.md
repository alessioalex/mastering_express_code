- Run the following commands in the project root to generate the timezones JSON file:

  chmod +x lib/get-data
  ./lib/get-data
  node node_modules/timezone-js/src/node-preparse.js tz/ > all_cities.json
