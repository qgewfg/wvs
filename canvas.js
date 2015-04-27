// draw
jQuery(function($) {
    // Node Class
    function Node(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.animal = null;
        this.neighbours = [];
    }
    // Map Class
    function Map(gridDistance) {
        this.Container_constructor();
        gridDistance = gridDistance || 80;
        this.gridDistance = gridDistance;

        // init the nodes
        this.nodes = [];
        var shouldContinue = function(i, j) {
            return (
                (i < 0 || i > 8 || j < 0 || j > 4) ||
                (0 == i && j != 2) ||
                (1 == i && (j == 0 || j == 4)) ||
                (7 == i && (j == 0 || j == 4)) ||
                (8 == i && j != 2)
            );
        };
        var serial2coor = function(serialNumber) {
            return {
                x: Math.floor(serialNumber / 5),
                y: serialNumber % 5
            };
        };
        var fourDirection = {
            up: function(i, j) {
                return {
                    serial: 5 * i + j - 1,
                    i: i,
                    j: j - 1
                };
            },
            down: function(i, j) {
                return {
                    serial: 5 * i + j + 1,
                    i: i,
                    j: j + 1
                };
            },
            left: function(i, j) {
                return {
                    serial: 5 * (i - 1) + j,
                    i: i - 1,
                    j: j
                };
            },
            right: function(i, j) {
                return {
                    serial: 5 * (i + 1) + j,
                    i: i + 1,
                    j: j
                };
            }
        };
        var eightDirection = {
            leftUp: function(i, j) {
                return {
                    serial: 5 * (i - 1) + j - 1,
                    i: i - 1,
                    j: j - 1
                };
            },
            leftDown: function(i, j) {
                return {
                    serial: 5 * (i - 1) + j + 1,
                    i: i - 1,
                    j: j + 1
                };
            },
            rightUp: function(i, j) {
                return {
                    serial: 5 * (i + 1) + j - 1,
                    i: i + 1,
                    j: j - 1
                };
            },
            rightDown: function(i, j) {
                return {
                    serial: 5 * (i + 1) + j + 1,
                    i: i + 1,
                    j: j + 1
                };
            }
        };
        $.extend(eightDirection, fourDirection);

        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 5; j++) {
                if (shouldContinue(i, j)) continue;
                var id = 5 * i + j;
                var newnode = new Node(id, i * gridDistance, j * gridDistance);

                // Init the neighbour relationship
                if ( (i % 2 == 0 && j % 2 == 1) || (i % 2 == 1 && j % 2 == 0) ) { // most 4 neighbours
                    var directions = fourDirection;
                } else {    // most 8 neighbours
                    directions = eightDirection;
                }
                for (var key in directions) {
                    // Special skip
                    if (6 == id || 8 == id) {
                        if ('right' == key) continue;
                        if (6 == id && 'rightUp' == key) continue;
                        if (8 == id && 'rightDown' == key) continue;
                    }

                    var coor = directions[key](i, j);
                    var serialNumber = coor.serial;

                    // Special skip
                    if (6 == serialNumber || 8 == serialNumber) {
                        if (this.nodes[serialNumber] && this.nodes[serialNumber].neighbours.indexOf(id) == -1) {
                            continue;
                        }
                    }
                    if (36 == id || 38 == id) {
                        if ('left' == key || (36 == id && 'leftUp' == key) || (38 == id && 'leftDown' == key) ) {
                            var tempNeighbours = this.nodes[serialNumber].neighbours;
                            tempNeighbours && tempNeighbours.splice(tempNeighbours.indexOf(id), 1);
                            continue;
                        }
                    }

                    if (serialNumber > 0 && serialNumber < 45) {
                        if (!shouldContinue(coor.i, coor.j)) {
                            newnode.neighbours.push(serialNumber);
                        }
                    }
                }

                this.nodes[id] = newnode;
            }
        }
    }
    var p = createjs.extend(Map, createjs.Container);
    p.draw = function(ctx) {
        var that = this;
        this.Container_draw(ctx);
        this.nodes.forEach(function(currNode, index, nodes) {
            if (currNode) {
                currNode.neighbours.forEach(function(neighbourSerial) {
                    var neighbour = nodes[neighbourSerial];
                    if (neighbour) {
                        var line = new createjs.Shape();
                        line.graphics.
                            beginStroke('orange').
                            setStrokeStyle(2).
                            moveTo(currNode.x, currNode.y).
                            lineTo(neighbour.x, neighbour.y).
                            endStroke();
                        //var text = new createjs.Text(currNode.id, "20px Arial", "#ff7700");
                        //text.x = currNode.x;
                        //text.y = currNode.y;

                        //that.addChild(text);
                        that.addChild(line);
                    }
                });
            }
        });
    }
    p.isVisible = function() {
        return this.nodes.length > 0;
    }
    window.Map = createjs.promote(Map, 'Container');

    // Wolf Class
    function Wolf() {
        this.Sprite_constructor();
        // temp shape
        var star = new createjs.Shape();
        star.graphics.beginFill("red").drawPolyStar(100, 100, 30, 5, 0.6, -90);
        this.addChild(star);
    }
    var wolfProtoType = createjs.extend(Wolf, createjs.Container);
    wolfProtoType.draw = function(ctx) {
        this.Sprite_draw(ctx);
    };
    wolfProtoType.isVisible = function() {
        return true;
    }
    window.Wolf = createjs.promote(Wolf, 'Sprite');

    // Sheep Class

    function getDistance(p1, p2) {
    }

    function drawSheep(point) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.arc(point.x, point.y, 10, 0 , Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function drawWolf(point) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
        ctx.moveTo(point.x, point.y - 30);
        ctx.lineTo(point.x + 30, point.y + 15);
        ctx.lineTo(point.x - 30, point.y + 15);
        ctx.closePath();
        ctx.fill();
    }

    var points = [
        { x: 240, y: 140 },{ x: 320, y: 140 },{ x: 400, y: 140 },{ x: 480, y: 140 },{ x: 560, y: 140 },
        { x: 240, y: 220 },{ x: 320, y: 220 },{ x: 400, y: 220 },{ x: 480, y: 220 },{ x: 560, y: 220 },
        { x: 240, y: 300 },{ x: 320, y: 300 },{ x: 400, y: 300 },{ x: 480, y: 300 },{ x: 560, y: 300 },
        { x: 240, y: 380 },{ x: 320, y: 380 },{ x: 400, y: 380 },{ x: 480, y: 380 },{ x: 560, y: 380 },
        { x: 240, y: 460 },{ x: 320, y: 460 },{ x: 400, y: 460 },{ x: 480, y: 460 },{ x: 560, y: 460 },

        { x: 80, y: 300 },{ x: 160, y: 220 },{ x: 160, y: 300 },{ x: 160, y: 380 },
        { x: 720, y: 300 },{ x: 640, y: 220 },{ x: 640, y: 300 },{ x: 640, y: 300 }
    ];

    var stage = new createjs.Stage("canvas");

    createjs.Touch.enable(stage);

    //var circle = new createjs.Shape();
    //circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    //circle.x = 100;
    //circle.y = 100;
    //stage.addChild(circle);

    var map = new Map(80);
    map.x = 80; 
    map.y = 140;
    stage.addChild(map);

    var wolf = new Wolf();
    wolf.x = 100;
    wolf.y = 100;
    stage.addChild(wolf);

    stage.update();

    //drawWolf({x: 240, y: 300});
    //drawWolf({x: 560, y: 300});

    //for (var i = 6; i < 19; i++) {
    //    if ( i == 9 || i == 14 ) {
    //        i++;
    //        continue;
    //    }
    //    if ( i == 12 ) continue;
    //    drawSheep(points[ i ]);
    //}
    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick(event) {
        stage.update();
    }
});

