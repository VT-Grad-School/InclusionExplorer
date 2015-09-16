'use strict';

/**
 * @ngdoc function
 * @name inclusionApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the inclusionApp
 */
angular.module('inclusionApp')
  .controller('MainCtrl', function($scope, $http) {
    // this.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];
    $scope.header1 = '';
    $scope.head = '';
    $scope.header2 = '';

    var toolTip = d3.select(document.getElementById('toolTip'));
    var width = 960,
      height = 500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
      .linkDistance(10)
      .linkStrength(2)
      .size([width, height]);

    var svg = d3.select('#initiatives-vis').append('svg')
      .attr('width', width)
      .attr('height', height);

    function splitAndTrim (sourceStr) {
      if (sourceStr) {
        return sourceStr.split(';').map(function (item) {
          return item.trim().replace(/:/g,'');
        });
      } else {
        return [];
      }
    }


    $scope.sourceCategories = {};
    $scope.links = {};
    // $scope.nodes = {};

    $scope.sourceCategoryNames = ['College or VP', 'Inclusive Excellence area', 'constituent group'];
    $scope.sourceCategoryNames.forEach(function (name) {
      $scope.sourceCategories[name] = {};
      $scope.links[name] = {};
    });
    
    $scope.graph = {
      nodes: [],
      links: [],
    };

    $scope.splitTrimAndAccumulateUniqueValues = function (property, initiative) { //property: area or const group or sponsor
      var results = splitAndTrim(initiative[property]);
      results.forEach(function (value) { // e.g. a list of areas 
        value = value.replace(/Dialogue/, 'Relations'); //normalize the area
        if ($scope.sourceCategories[property].hasOwnProperty(value)) { //if we already know about this (e.g.) area, 
          $scope.sourceCategories[property][value].initiatives.push(initiative);
        } else {
          var idx = $scope.graph.nodes.length;
          $scope.graph.nodes.push({
            name: value,
            type: property,
            nodeIdx: idx,
          });
          $scope.sourceCategories[property][value] = {nodeIdx: idx, initiatives:[initiative]};
        }
        $scope.graph.links.push([$scope.sourceCategories[property][value].nodeIdx, initiative.nodeIdx]);
      });
      return results;
    };


    $scope.richInitiativeData = {};

    d3.csv('/College-VP_Program_List.csv', function (initiatives) {
      $scope.initiatives = initiatives;
      console.log($scope.initiatives);
      $scope.initiatives.forEach(function (initiative) {
        initiative.nodeIdx = $scope.graph.nodes.length;
        $scope.graph.nodes.push(initiative);
        initiative['Inclusive Excellence area'] = $scope.splitTrimAndAccumulateUniqueValues('Inclusive Excellence area', initiative);
        initiative['constituent group'] = $scope.splitTrimAndAccumulateUniqueValues('constituent group', initiative);
        initiative['College or VP'] = $scope.splitTrimAndAccumulateUniqueValues('College or VP', initiative);
        initiative.name = initiative['Program Name'];
        initiative.type = 'Program';
        $scope.richInitiativeData[initiative['Program Name']] = initiative;
      });
      window.graph = $scope.graph;
      window.initiatives = $scope.initiatives;
      window.richInitiativeData = $scope.richInitiativeData;
      // var graph = initiatives;

      // already have nodes for
      //    all programs
      //        with many details

      // create nodes for:
      //    all colleges/entities
      //    all areas
      //    all constituent groups

      $scope.sourceCategoryNames.forEach(function (name) { // name might be "areas"
        console.log(Object.keys($scope.sourceCategories[name])); //the obj.keys would be all the areas

        Object.keys($scope.sourceCategories[name]).forEach(function (value) {
          $scope.richInitiativeData[value] = {
            name: value,
            type: name,
            nodeIdx: $scope.graph.nodes.length
          };
          // $scope.graph.nodes.push($scope.richInitiativeData[value]);
        });
        // $scope.graph.nodes = $scope.graph.nodes.concat(Object.keys($scope.sourceCategories[name]));
      });

      // create links between these higher-level nodes and the associated program nodes

      console.log($scope.graph);
      var nodes = $scope.graph.nodes.slice(),
        links = [],
        bilinks = [];

      // $scope.graph.links.forEach(function(link) {
      //   // console.log(nodes[link.source]);
      //   var s = nodes[link.source],
      //     t = nodes[link.target],
      //     i = {}; // intermediate node
      //   s.id = link.source;
      //   t.id = link.target;
      //   nodes.push(i);
      //   links.push({
      //     source: s,
      //     target: i
      //   }, {
      //     source: i,
      //     target: t
      //   });
      //   bilinks.push([s, i, t]);
      // });

      // force
      //   .nodes(nodes)
      //   .links(links)
      //   .start();

      // var link = svg.selectAll('.link')
      //   .data(bilinks)
      //   .enter().append('path')
      //   .attr('class', function(currentLink) {
      //     var classes = ['link'];
      //     // console.log(currentLink);
      //     classes.push('n' + currentLink[0].id);
      //     classes.push('n' + currentLink[2].id);
      //     return classes.join(' ');
      //   });

      // var node = svg.selectAll('.node')
      //   .data(graph.nodes)
      //   .enter().append('circle')
      //   .attr('class', 'node')
      //   .attr('r', 5)
      //   .style('fill', function(d) {
      //     return color(d.group);
      //   })
      //   .call(force.drag);

      // node.append('title')
      //   .text(function(d) {
      //     // console.log(d);
      //     return d.name;
      //   });


      // // node.on('click', function (clicked) {
      // node.on('mouseover', function(clicked) {
      //   $scope.$apply(function () {
      //     console.log('clicked', clicked);
      //     toolTip.transition()
      //       .duration(200)
      //       .style('opacity', '.9');

      //     $scope.header1 = 'Congress';
      //     $scope.head = clicked.name;
      //     console.log($scope.head);
      //     $scope.header2 = 'Total Recieved: ' + clicked.group;
      //     toolTip.style('left', (d3.event.pageX + 15) + 'px')
      //       .style('top', (d3.event.pageY - 75) + 'px')
      //       .style('height', '100px');

      //     // console.log(d3.selectAll('.link.n'+clicked.id));
      //     console.log(d3.selectAll('.link.n' + clicked.id));
      //     d3.selectAll('.link.n' + clicked.id).classed('connected-link', true);
      //     // highlightLinks(clicked,true);
          
      //   });
      // });

      // node.on('mouseout', function() {
      //   toolTip.transition() // declare the transition properties to fade-out the div
      //     .duration(500) // it shall take 500ms
      //     .style('opacity', '0'); // and go all the way to an opacity of nil
      //   d3.selectAll('.link.connected-link').classed('connected-link', false);
      // });

      // force.on('tick', function() {
      //   link.attr('d', function(d) {
      //     return 'M' + d[0].x + ',' + d[0].y + 'S' + d[1].x + ',' + d[1].y + ' ' + d[2].x + ',' + d[2].y;
      //   });
      //   node.attr('transform', function(d) {
      //     return 'translate(' + d.x + ',' + d.y + ')';
      //   });
      // });
    });

  });
