'use strict';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var d3 = require('d3');

// var router = express.Router();

app.use(express.static(__dirname + '/inclusion/app'));
app.use('/bower_components', express.static(__dirname + '/inclusion/bower_components'));
app.use(express.static(__dirname + '/Political Influence Data Visualization D3.js_files'));
app.use('/', express.static(__dirname + '/inclusion/app/index.html'));

app.set('views', './views');
app.set('view engine', 'jade');
// app.get('*', '/inclusion/app/index.html');

var initiatives = [];
var graph = {
  nodes: [],
  links: [],
};

var sourceCategories = {};
var links = {};

var richInitiativeData = {};
var sourceCategoryNames = ['Inclusive Excellence area', 'constituent group', 'College or VP'];

function splitAndTrim (sourceStr) {
  if (sourceStr) {
    return sourceStr.split(';').map(function (item) {
      return item.trim().replace(/:/g,'');
    });
  } else {
    return [];
  }
}

function splitTrimAndAccumulateUniqueValues (property, initiative) { //property: area or const group or sponsor
  var results = splitAndTrim(initiative[property]);
  results.forEach(function (value) { // e.g. a list of areas 
    value = value.replace(/Dialogue/, 'Relations'); //normalize the area
    if (sourceCategories[property].hasOwnProperty(value)) { //if we already know about this (e.g.) area, 
      sourceCategories[property][value].initiatives.push(initiative);
    } else {
      var idx = graph.nodes.length;
      graph.nodes.push({
        name: value,
        type: property,
        nodeIdx: idx,
      });
      sourceCategories[property][value] = {nodeIdx: idx, initiatives:[initiative], name: value};
    }
    graph.links.push([sourceCategories[property][value].nodeIdx, initiative.nodeIdx]);
  });
  return results;
}

// d3.csv('College-VP_Program_List.csv', function (initiativesFromCSV) {
//   initiatives = initiativesFromCSV;
//   console.log(initiatives);
//   initiatives.forEach(function (initiative) {
//     initiative.nodeIdx = graph.nodes.length;
//     graph.nodes.push(initiative);
//     initiative['Inclusive Excellence area'] = splitTrimAndAccumulateUniqueValues('Inclusive Excellence area', initiative);
//     initiative['constituent group'] = splitTrimAndAccumulateUniqueValues('constituent group', initiative);
//     initiative['College or VP'] = splitTrimAndAccumulateUniqueValues('College or VP', initiative);
//     initiative.name = initiative['Program Name'];
//     initiative.type = 'Program';
//     richInitiativeData[initiative['Program Name']] = initiative;
//   });
//   // window.graph = graph;
//   // window.initiatives = initiatives;
//   sourceCategoryNames.forEach(function (name) { // name might be "areas"
//     Object.keys(sourceCategories[name]).forEach(function (value) {
//       richInitiativeData[value] = {
//         name: value,
//         type: name,
//         nodeIdx: graph.nodes.length
//       };
//     });
//   });
// });

var PORT = process.argv[2];
http.listen(PORT, function() {
  console.log('listening on *:', PORT);
});