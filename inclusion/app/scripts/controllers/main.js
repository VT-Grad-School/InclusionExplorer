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

    $http.get('/initiatives.json')
      .success(function(graph) {
        console.log(graph);
        var nodes = graph.nodes.slice(),
          links = [],
          bilinks = [];

        graph.links.forEach(function(link) {
          // console.log(nodes[link.source]);
          var s = nodes[link.source],
            t = nodes[link.target],
            i = {}; // intermediate node
          s.id = link.source;
          t.id = link.target;
          nodes.push(i);
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
          .nodes(nodes)
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
          .attr('r', 5)
          .style('fill', function(d) {
            return color(d.group);
          })
          .call(force.drag);

        node.append('title')
          .text(function(d) {
            // console.log(d);
            return d.name;
          });


        // node.on('click', function (clicked) {
        node.on('mouseover', function(clicked) {
          $scope.$apply(function () {
            console.log('clicked', clicked);
            toolTip.transition()
              .duration(200)
              .style('opacity', '.9');

            $scope.header1 = 'Congress';
            $scope.head = clicked.name;
            console.log($scope.head);
            $scope.header2 = 'Total Recieved: ' + clicked.group;
            toolTip.style('left', (d3.event.pageX + 15) + 'px')
              .style('top', (d3.event.pageY - 75) + 'px')
              .style('height', '100px');

            // console.log(d3.selectAll('.link.n'+clicked.id));
            console.log(d3.selectAll('.link.n' + clicked.id));
            d3.selectAll('.link.n' + clicked.id).classed('connected-link', true);
            // highlightLinks(clicked,true);
            
          });
        });

        node.on('mouseout', function() {
          toolTip.transition() // declare the transition properties to fade-out the div
            .duration(500) // it shall take 500ms
            .style('opacity', '0'); // and go all the way to an opacity of nil
          d3.selectAll('.link.connected-link').classed('connected-link', false);
        });

        force.on('tick', function() {
          link.attr('d', function(d) {
            return 'M' + d[0].x + ',' + d[0].y + 'S' + d[1].x + ',' + d[1].y + ' ' + d[2].x + ',' + d[2].y;
          });
          node.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          });
        });
      });

  });
