'use strict'

const fetch = require('node-fetch');

module.exports = async(event, context) => {
  const ruleNames = event.body.rules || [
    'date',
    'description',
    'image',
    'logo',
    'publisher',
    'title',
  ];

  const metascraper = require('metascraper')(
    ruleNames.map(ruleName =>
      require(`metascraper-${ruleName}`)()
    )
  );

  const url = event.body.url;
  const response = await fetch(url);
  const body = await response.text();
  
  if (!response.ok) {
    return context
      .status(500)
      .fail(`Failed to retrieve url. Status: ${response.status}, body: ${body}`);
  }

  const result = await metascraper({
    url,
    html: body,
  });

  return context
    .status(200)
    .succeed(result)
}; 
