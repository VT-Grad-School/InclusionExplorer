'use strict';

/**
 * @ngdoc function
 * @name inclusionApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the inclusionApp
 */
angular.module('inclusionApp')
  .controller('MainCtrl', function($scope, $http, $location) {
    // this.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];
    $scope.header1 = '';
    $scope.head = '';
    $scope.header2 = '';

    var toolTip = d3.select(document.getElementById('toolTip'));
    var width = 800,
      height = 600;

    var color = d3.scale.category10();

    var force = d3.layout.force()
      .linkDistance(2)
      .linkStrength(2)
      .size([width, height]);

    $scope.unSetSelectedNode = function () {
      d3.selectAll('.clicked-node').classed('clicked-node', false);
      d3.selectAll('.connected-link-clicked').classed('connected-link-clicked', false);
      $scope.selectedNode = {};
    };

    var svg = d3.select('#initiatives-vis').append('svg')
      .attr('width', width)
      .attr('height', height)
      .on('click', function () {
        console.log('clicked svg');
        $scope.$apply(function () {
          $location.search('node', null);
        });
        $scope.unSetSelectedNode();
      });

    function splitAndTrim (sourceStr) {
      if (sourceStr) {
        return sourceStr.split(';').map(function (item) {
          return item.trim().replace(/:/g,'');
        });
      } else {
        return [];
      }
    }

    $scope.clickedInitiative = function (initiative, event) {
      $scope.setSelectedNode(initiative, event);
      $scope.hoverNode = {};
      $scope.onNodeMouseLeave();
    };


    $scope.sourceCategories = {};
    $scope.links = {};
    // $scope.nodes = {};

    $scope.types = {
      'Program': 0,
      'College or VP': 1,
      'Inclusive Excellence area': 2,
      'constituent group': 3,
    };

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
    $scope.selectedNode = {};
    $scope.hoverNode = {};

    d3.csv('College-VP_Program_List.csv', function (initiatives) {
      $scope.initiatives = initiatives;
      // console.log($scope.initiatives);
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
      $scope.sourceCategoryNames.forEach(function (name) { // name might be "areas"
        Object.keys($scope.sourceCategories[name]).forEach(function (value) {
          $scope.richInitiativeData[value] = {
            name: value,
            type: name,
            nodeIdx: $scope.graph.nodes.length
          };
        });
      });
      window.richInitiativeData = $scope.richInitiativeData;
      window.ctgs = $scope.sourceCategories;

      // create links between these higher-level nodes and the associated program nodes

      // console.log($scope.graph);
      $scope.nodes = $scope.graph.nodes.slice();
      var links = [],
        bilinks = [];

      $scope.graph.links.forEach(function(link) {
        // console.log(nodes[link[0]]);
        var s = $scope.nodes[link[0]],
          t = $scope.nodes[link[1]],
          i = {}; // intermediate node
        s.id = link[0];
        t.id = link[1];
        $scope.nodes.push(i);
        links.push({
          source: s,
          target: i
        }, {
          source: i,
          target: t
        });
        bilinks.push([s, i, t]);
      });

      force
        .nodes($scope.nodes)
        .links(links)
        .start();

      var link = svg.selectAll('.link')
        .data(bilinks)
        .enter().append('path')
        .attr('class', function(currentLink) {
          var classes = ['link'];
          // console.log(currentLink);
          classes.push('n' + currentLink[0].id);
          classes.push('n' + currentLink[2].id);
          return classes.join(' ');
        });

      var node = svg.selectAll('.node')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('id', function (d) {
          return 'node-'+d.nodeIdx;
        })
        .style('fill', function(d) {
          return color($scope.types[d.type]);
        })
        .call(force.drag);

      node.append('title')
        .text(function(d) {
          // console.log(d);
          return d.name;
        });

      $scope.setSelectedNode = function (selected, evt) {
        if (evt) {
          evt.stopPropagation();
        }

        $scope.selectedNode = selected;
        d3.selectAll('.clicked-node').classed('clicked-node', false);
        d3.select('#node-'+$scope.selectedNode.id).classed('clicked-node', true);
        d3.selectAll('.connected-link-clicked').classed('connected-link-clicked', false);
        d3.selectAll('.link.n' + $scope.selectedNode.id).classed('connected-link-clicked', true);
      };

      node.on('click', function (clicked) {
        console.log(clicked);
        $location.search('node', clicked.id);
        $scope.$apply(function () {
          $scope.setSelectedNode(clicked, d3.event);
        });
      });

      $scope.onNodeMouseEnter = function (clicked, evt) {
        $scope.hoverNode = clicked;
        d3.selectAll('.hover-node').classed('hover-node', false);
        d3.select('#node-'+clicked.id).classed('hover-node', true);
        toolTip.transition()
          .duration(200)
          .style('opacity', '.9');

        $scope.head = clicked.name;
        $scope.header2 = clicked;
        var event = d3.event;
        if (event === null) {
          event = {
            pageX: clicked.x,
            pageY: clicked.y,
          };
        }
        toolTip.style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 75) + 'px')
          .style('height', '100px');

        d3.selectAll('.link.n' + clicked.id).classed('connected-link', true);
      };

      node.on('mouseover', function(clicked) {
        $scope.$apply(function () {
          $scope.onNodeMouseEnter(clicked);
        });
      });

      $scope.onNodeMouseLeave = function () {
        d3.selectAll('.hover-node').classed('hover-node', false);
        toolTip.transition() // declare the transition properties to fade-out the div
          .duration(500) // it shall take 500ms
          .style('opacity', '0'); // and go all the way to an opacity of nil
        d3.selectAll('.link.connected-link').classed('connected-link', false);
      };

      node.on('mouseout', function() {
        $scope.onNodeMouseLeave();
      });

      force.on('tick', function() {
        link.attr('d', function(d) {
          return 'M' + d[0].x + ',' + d[0].y + 'S' + d[1].x + ',' + d[1].y + ' ' + d[2].x + ',' + d[2].y;
        });
        node.attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
      });

      console.log('done setting up?');
      if ($location.search().hasOwnProperty('node')) {
        console.log($location.search());
        console.log($location.search().node);
        console.log($scope.nodes[$location.search().node]);
        $scope.clickedInitiative($scope.nodes[$location.search().node]);
      }

    });

  });
