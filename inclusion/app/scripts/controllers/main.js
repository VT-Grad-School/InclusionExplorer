'use strict';

/**
 * @ngdoc function
 * @name inclusionApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the inclusionApp
 */
angular.module('inclusionApp')
  .controller('MainCtrl', function($scope, $http, $location, $rootScope, $q, $compile) {
    // this.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];
    $scope.header1 = '';
    $scope.head = '';
    $scope.header2 = '';
    $scope.selectedNode = {};

    $scope.queryObj = {
      query: ''
    };

    $scope.clearSearch = function () {
      $scope.initiatives.forEach(function (init) {
        init.nonResult = false;
      });
      $scope.sourceCategoryNames.forEach(function (ctNm) {
        Object.keys($scope.sourceCategories[ctNm]).forEach(function (k) {
          $scope.sourceCategories[ctNm][k].nonResult = false;
        });
      });
      d3.selectAll('.node').classed('search-result search-non-result', false)
        .attr('class', 'node');
      $scope.queryObj = {
        query: ''
      };
    }

    $scope.typeAsClassName = function (val) {
      if (val) {
        return val.replace(/\s/g, '');
      } else {
        return '';
      }
    };

    $scope.legend = [];
    // window.selectedNode = $scope.selectedNode;
    // console.log(window.selectedNode === new Object());

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
      $scope.clearSearch();
      $location.search('node', null);
    };

    var svg = d3.select('#initiatives-vis').append('svg')
      .attr('width', width)
      .attr('height', height)
      .on('click', function () {
        console.log('clicked svg');
        $scope.$apply(function () {
          $location.search('node', null);
          $scope.unSetSelectedNode();
        });
      });

    // var legend = d3.select('#initiatives-vis').insert('div', ':first-child')
    //   .

    

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
    $scope.objLen = function (obj) {
      return Object.keys(obj).length;
    };
    // $scope.nodes = {};

    $scope.sourceCategoryNames = ['Inclusive Excellence area', 'constituent group', 'College or VP'];
    window.ctgyNames = $scope.sourceCategoryNames;

    $scope.hovering = {};

    // var legend = '';//'<li class="legend-item legend-item-Program"><i class="fa fa-stop"></i>Programs and Initiatives</li>';
    $scope.sourceCategoryNames.forEach(function (ctNm) {
      $scope.legend.push(ctNm);
      $scope.hovering[ctNm] = false;
      // legend = legend + '<li class="legend-item legend-item-' + $scope.typeAsClassName(ctNm) + '"><i class="fa fa-stop"></i>' + ctNm + '</li>';
    });
    $scope.legend.push('Program');
    // legend = legend + '<li class="legend-item legend-item-Program"><i class="fa fa-stop"></i>Programs and Initiatives</li>';

    // ng-mouseenter="onNodeMouseEnter(graph.nodes[item.nodeIdx], $event)" ng-mouseleave="onNodeMouseLeave()"
    
    // angular.element('#initiatives-vis').append('<ul class="legend">' + legend + '</ul>');


    $scope.types = {};
    $scope.types[$scope.sourceCategoryNames[0]] = 3;
    $scope.types[$scope.sourceCategoryNames[1]] = 1;
    $scope.types[$scope.sourceCategoryNames[2]] = 2;
    $scope.Program = 0;

    $scope.tabOpen = {};
    $scope.resetTabOpen = function (selectedNode) {
      Object.keys($scope.types).forEach(function (property) {
        $scope.tabOpen[property] = false;
        if (selectedNode && (!selectedNode[property] || selectedNode[property].length === 0)) {
          $scope.tabOpen[property] = false;
        }
      });
      $scope.tabOpen.Program = false;

    };
    $scope.resetTabOpen();

    $scope.homeTabOpen = {};
    $scope.resetHomeTabOpen = function (selectedNode) {
      Object.keys($scope.types).forEach(function (property) {
        $scope.homeTabOpen[property] = false;
        if (selectedNode && (!selectedNode[property] || selectedNode[property].length === 0)) {
          $scope.homeTabOpen[property] = false;
        }
      });
      $scope.homeTabOpen.Program = false;

    };
    $scope.resetHomeTabOpen();
    

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
          $scope.sourceCategories[property][value] = {initiatives:[initiative], name: value, nonResult: false};
          $scope.graph.nodes.push({
            name: value,
            type: property,
            nodeIdx: idx,
            entity: $scope.sourceCategories[property][value],
          });
          $scope.sourceCategories[property][value].nodeIdx = idx;
        }
        $scope.graph.links.push([$scope.sourceCategories[property][value].nodeIdx, initiative.nodeIdx]);
      });
      return results;
    };


    $scope.richInitiativeData = {};
    $scope.selectedNode = {};
    $scope.hoverNode = {};

    d3.csv('College-VP_Program_List.csv', function (initiatives) {
      $scope.$apply(function () {
        $scope.initiatives = initiatives;
        window.initiatives = $scope.initiatives;
        // console.log($scope.initiatives);
        $scope.initiatives.forEach(function (initiative) {
          initiative.nodeIdx = $scope.graph.nodes.length;
          $scope.graph.nodes.push(initiative);
          initiative.nonResult = false;
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
        window.nodes = $scope.nodes;
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
          .attr('class', function (d) {
            return 'node '+$scope.typeAsClassName(d.type);
          })
          .attr('popover','I appeared on mouse enter!')
          .attr('popover-trigger', 'mouseenter')
          .attr('r', 10)
          .attr('id', function (d) {
            return 'node-'+d.nodeIdx;
          })
          .style('fill', function(d) {
            return color($scope.types[d.type]);
          })
          .call(force.drag);

        // node.append('title')
        //   .text(function(d) {
        //     // console.log(d);
        //     return d.name;
        //   });
        // angular.element('.node').each(function (i, elem) {
        //   // console.log(elem);
        //   $compile(elem)($scope);
        // });

        $scope.haveSelectedNode = function () {
          return Object.keys($scope.selectedNode).length > 0;
        };

        $scope.setSelectedNode = function (selected, evt) {
          if (evt) {
            evt.stopPropagation();
          }

          $scope.queryObj = {
            query: ''
          };

          $scope.resetTabOpen(selected);

          $scope.selectedNode = selected;

          window.selectedNode = $scope.selectedNode;
          d3.selectAll('.clicked-node').classed('clicked-node', false);
          d3.selectAll('.connected-link-clicked').classed('connected-link-clicked', false);

          $scope.clickNeighbors = $scope.nodeNeighborIndices(selected);
          $scope.clickNeighbors.forEach(function (nodeId) {
            d3.select('#node-'+nodeId).classed('clicked-node', true);
          });

          d3.select('#node-'+$scope.selectedNode.id).classed('clicked-node', true);
          d3.selectAll('.link.n' + $scope.selectedNode.id).classed('connected-link-clicked', true);
        };

        node.on('click', function (clicked) {
          console.log(clicked);
          $location.search('node', clicked.id);
          // $location.path('/node/'+clicked.id);
          $scope.$apply(function () {
            $scope.setSelectedNode(clicked, d3.event);
          });
        });

        $scope.visibleInitiatives = function () {
          return $scope.initiatives.reduce(function (prev, curr, i) {
            if ($scope.initiatives[i].nonResult) {
              return prev;
            } else {
              return prev+1;
            }
          }, 0);
        };

        $scope.visibleEntities = function (ctgyName) {
          return Object.keys($scope.sourceCategories[ctgyName]).reduce(function (prev, curr, i, arr) {
            // console.log($scope.sourceCategories[ctgyName][arr[i]]);
            if ($scope.sourceCategories[ctgyName][arr[i]].nonResult) {
              return prev;
            } else {
              return prev+1;
            }
          }, 0);
        };

        $scope.nodeNeighborIndices = function (node) {
          var results = [];
          if (node.type === 'Program') {
            results = $scope.sourceCategoryNames.map(function (ctgyName) {
              return node[ctgyName].map(function (ctgyValueName) {
                if ($scope.sourceCategories.hasOwnProperty(ctgyName) && 
                  $scope.sourceCategories[ctgyName].hasOwnProperty(ctgyValueName) && 
                  $scope.sourceCategories[ctgyName][ctgyValueName].hasOwnProperty('nodeIdx')) {
                    return $scope.sourceCategories[ctgyName][ctgyValueName].nodeIdx;
                }
              });
            })
              .reduce(function (prev, curr) {
                return prev.concat(curr);
              });
          } else if ($scope.hasOwnProperty('sourceCategories') && 
              node.hasOwnProperty('type') && 
              node.hasOwnProperty('name') && 
              $scope.sourceCategories.hasOwnProperty(node.type) &&
              $scope.sourceCategories[node.type].hasOwnProperty(node.name) &&
              $scope.sourceCategories[node.type][node.name].hasOwnProperty('initiatives')) {
                // console.log('elseif');
                results = $scope.sourceCategories[node.type][node.name].initiatives.map(function (init) {
                  return init.id;
                });
          }
          // console.log(results);
          return results;
        };

        $scope.onNodeMouseEnter = function (clicked, evt) {
          // console.log(clicked);
          if (clicked.hasOwnProperty('nonResult') && clicked.nonResult || !clicked.hasOwnProperty('nonResult') && clicked.entity.nonResult) {
            // console.log('hovered on nonResult');
            return;
          }
          $scope.hoverNode = clicked;

          // maybe we want to style the connected nodes as well
          // for everything other than programs/initiatives, there would only be initiatives as connected nodes, 
          //    while the initiatives could be connected to all other types

          $scope.hoverNeighbors = [];
          d3.selectAll('.hover-node').classed('hover-node', false);

          $scope.hoverNeighbors = $scope.nodeNeighborIndices(clicked);

          d3.select('#node-'+clicked.id).classed('hover-node', true);
          $scope.hoverNeighbors.forEach(function (neighborNodeId) {
            d3.select('#node-'+neighborNodeId).classed('hover-node', true);
          });

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
          toolTip.style('left', (event.pageX + 0) + 'px')
            .style('top', (event.pageY - 0) + 'px')
            .style('height', '200px');

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

        if ($location.search().hasOwnProperty('q')) {
          $scope.searchAllNodes($location.search().q);
        }

        if ($location.search().hasOwnProperty('node')) {
          // console.log($location.search());
          // console.log($location.search().node);
          // console.log($scope.nodes[$location.search().node]);
          $scope.clickedInitiative($scope.nodes[$location.search().node]);
        }

      });
    });

    $rootScope.$on('searchNodes', function (evt, queryObj) {
      return $scope.searchNodes(queryObj.query);
    });

    $scope.searchNodes = function (query) { // change all of these to map so they return an array instead of t/f
      var queryRegex = new RegExp('\\w*'+query+'\\w*', 'gi');
      d3.selectAll('.node').classed('search-result search-non-result', false)
        .attr('class', 'node');

      if (query.trim().length === 0) {
        $location.search('q', null);
        // console.log('empty');
        $rootScope.$emit('nodeSearchResults', {
          query: query,
          results: {},
        });
        $scope.clearSearch();
        return;
      } else {
        // console.log('query', query);
      }
      var allMatches = {};
      $scope.initiatives.forEach(function (initiative) {
        var initResults = {};
        // var result = Object.keys(initiative).forEach(function (property) {
        Object.keys(initiative).forEach(function (property) {
          if (property === 'name' || 'Description') {
            // debugger;
            // console.log(initiative[property]);
            // var matchesForProp = {};
            if (initiative[property] instanceof Array) {
              initiative[property].forEach(function (item) {
                var matches = item.match(queryRegex);
                if (matches) {
                  matches.forEach(function (match) {
                    if (!allMatches.hasOwnProperty(match)) {
                      allMatches[match] = [];
                    }
                    allMatches[match].push({match: item, key: property, entity:initiative});

                    if (!initResults.hasOwnProperty(match)) {
                      initResults[match] = [];
                    }
                    initResults[match].push({match: item, key: property, entity:initiative});
                  });
                }
                // var result = item.toUpperCase().indexOf(query.toUpperCase()) > -1;
                // console.log('innermost result', result);
                // return result;
                // return matches;
              }); 
              // console.log('if result', result);
              // return matchesForProp;
            } else {
              if (initiative[property] && typeof initiative[property].toUpperCase === 'function') {
                // var result = initiative[property].toUpperCase().indexOf(query.toUpperCase()) > -1;
                // console.log('else result', result);
                // return result;
                var matches = initiative[property].match(queryRegex)
                if (matches) {
                  matches.forEach(function (match) {
                    if (!allMatches.hasOwnProperty(match)) {
                      allMatches[match] = [];
                    }
                    allMatches[match].push({match: initiative[property], key: property, entity:initiative});

                    if (!initResults.hasOwnProperty(match)) {
                      initResults[match] = [];
                    }
                    initResults[match].push({match: initiative[property], key: property, entity:initiative});
                  });
                }
                // return matches;
              } else {
                // console.log('nonarray false');
                // return [];
              }
            }
            // return matchesForProp;
          }
        });
        // console.log('outermost result', result);
        
        // console.log('allMatches', allMatches);
        // console.log(result);
        if (Object.keys(initResults).length > 0) {
          initiative.nonResult = false;
          // console.log('if', d3.select('#node-'+initiative.nodeIdx));
          d3.select('#node-'+initiative.nodeIdx)
            .attr('class', 'node search-result')
            .classed('search-result', true);
        } else {
          initiative.nonResult = true;
          // console.log(initiative);
          d3.select('#node-'+initiative.nodeIdx)
            .attr('class', 'node search-non-result')
            .classed('search-non-result', true);
        }
        // return result;
      });

      Object.keys($scope.sourceCategories).forEach(function (ctgyName) {
        Object.keys($scope.sourceCategories[ctgyName]).forEach(function (entityName) {
          var matches = entityName.match(queryRegex);
          if (matches && matches.length > 0) {
            matches.forEach(function (match) {
              if (!allMatches.hasOwnProperty(match)) {
                allMatches[match] = [];
              }
              allMatches[match].push({
                match: entityName, 
                key: 'name', 
                entity: $scope.sourceCategories[ctgyName][entityName]
              });
            });
            $scope.sourceCategories[ctgyName][entityName].nonResult = false;
            d3.select('#node-'+$scope.sourceCategories[ctgyName][entityName].nodeIdx)
              .attr('class', 'node search-result')
              .classed('search-result', true);
          } else {
            $scope.sourceCategories[ctgyName][entityName].nonResult = true;
            d3.select('#node-'+$scope.sourceCategories[ctgyName][entityName].nodeIdx)
              .attr('class', 'node search-non-result')
              .classed('search-non-result', true);
          }
        });
      });

      // console.log(allMatches);

      // d3.selectAll('.node:not(.search-result)').classed('search-non-result', true)
      //   .attr('class', 'node search-non-result'); //this is why non program nodes gray out even thoguh they're not being searched.

      // $rootScope.$emit('nodeSearchResults', {
      //   query: query,
      //   results: results,
      // });
      // return results;

      d3.selectAll('.node').sort(function (a, b) {
        if ((a.hasOwnProperty('nonResult') && a.nonResult || 
            !a.hasOwnProperty('nonResult') && a.entity.nonResult) &&
            (b.hasOwnProperty('nonResult') && !b.nonResult || 
            !b.hasOwnProperty('nonResult') && !b.entity.nonResult)) { //if a is NOT a result, but b IS:
          return -1;
        } else if ((a.hasOwnProperty('nonResult') && !a.nonResult || 
                  !a.hasOwnProperty('nonResult') && !a.entity.nonResult) &&
                  (b.hasOwnProperty('nonResult') && b.nonResult || 
                  !b.hasOwnProperty('nonResult') && b.entity.nonResult)) { //if a IS a result, but b is NOT:
          return 1;
        } else {
          return 0;
        }
      });

      $location.search('q', query);

      $rootScope.$emit('nodeSearchResults', {
        query: query,
        results: allMatches,
      });
    };

    $scope.hoverType = function (typeName) {
      console.log('hoverType', $scope.typeAsClassName(typeName));
      d3.selectAll('.'+$scope.typeAsClassName(typeName))
        .classed('hover-node', true);
      $scope.hovering[typeName] = true;
    };

    $scope.unHoverType = function (typeName) {
      console.log('unHoverType', $scope.typeAsClassName(typeName));
      // d3.selectAll('.'+typeName)
      d3.selectAll('.hover-node')
        .classed('hover-node', false);
        $scope.hovering[typeName] = false;
    };

    $scope.hovering = function (ctNm) {
      return $scope.hovering[ctNm];
    };

    $scope.searchAllNodes = function (query) {
      $scope.query = query;
      // console.log('searchNode', query.length);
      $scope.deferred = $q.defer();
      $rootScope.$emit('searchNodes', {
        query: query,
      });
      return $scope.deferred.promise;
    };

    $scope.legendClass = function (typeName) {
      var classVal = $scope.typeAsClassName(typeName);
      if ($scope.hovering(typeName)) {
        classVal = classVal + ' hover-legend';
      }
      return classVal;
    };

    $rootScope.$on('nodeSearchResults', function (evt, results) {
      // console.log(results);
      $scope.deferred.resolve(Object.keys(results.results));
    });

  });
