// wvs.js
jQuery(function($) {
    // Node Class
    function Node(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.animal = null;
        this.neighbours = [];
        this._lineDrawed = [];
    }
    // Map Class
    function Map(gridDistance) {
        this.Container_constructor();
        gridDistance = gridDistance || 80;
        this.gridDistance = gridDistance;

        // chessman positions
        this.wolfPositionIndice = [12, 32];
        this.sheepPositionIndice = [
            16, 17, 18,
            21, 23,
            26, 27, 28
        ];

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
        
        // add lines
        var that = this;
        this.nodes.forEach(function(currNode, index, nodes) {
            if (currNode) {
                currNode.neighbours.forEach(function(neighbourSerial) {
                    var neighbour = nodes[neighbourSerial];
                    if (neighbour) {
                        if (neighbour._lineDrawed.indexOf(currNode.id) > -1) {
                            console.log('skip');
                            return;
                        }
                        var line = new createjs.Shape();
                        line.graphics.
                            beginStroke('orange').
                            setStrokeStyle(2).
                            moveTo(currNode.x, currNode.y).
                            lineTo(neighbour.x, neighbour.y).
                            endStroke();
                        that.addChild(line);

                        // Record to avoid drawing the line twice.
                        currNode._lineDrawed.push(neighbour.id);

                        ////// debug
                        var text = new createjs.Text(currNode.id, "20px Arial", "#ff7700");
                        text.x = currNode.x;
                        text.y = currNode.y;

                        that.addChild(text);
                        //////
                    }
                });
            }
        });
    }
    var p = createjs.extend(Map, createjs.Container);
    p.draw = function(ctx) {
        this.Container_draw(ctx);
    }
    p.isVisible = function() {
        return this.nodes.length > 0;
    }
    window.Map = createjs.promote(Map, 'Container');

    // Wolf Class
    function Wolf() {
        this.super_constructor();
        // temp shape
        var star = new createjs.Shape();
        star.graphics.beginFill("red").drawPolyStar(0, 0, 30, 5, 0.6, -90);
        this.addChild(star);

        var that = this;
        this._lastPos = {};
        this.on('mousedown', function(evt) {
            that._lastPos = {x: that.x, y: that.y };
            console.log('mousedown trigger');
            console.log(that._lastPos);
        });
        this.on('pressmove', function(evt) {
            var parent = that.parent;
            parent.setChildIndex(that, parent.children.length - 1);
            evt.target.x = evt.localX;
            evt.target.y = evt.localY;
        });
        this.on('pressup', function(evt) {
            //evt.target.x = that._lastPos.x;
            //evt.target.y = that._lastPos.y;
            //return true;
            console.log('up');
            that.reset();
        });
    }
    var wolfPrototype = createjs.extend(Wolf, createjs.Container);
    wolfPrototype.draw = function(ctx) {
        this.super_draw(ctx);
    };
    wolfPrototype.isVisible = function() {
        return true;
    }
    wolfPrototype.reset = function() {
        if (this._lastPos) {
            console.log('up');
            console.log(this._lastPos);
            this.x = this._lastPos.x;
            this.y = this._lastPos.y;
        }
    }
    window.Wolf = createjs.promote(Wolf, 'super');

    // Sheep Class
    function Sheep() {
        this.super_constructor();
        // temp shape
        var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 10);
        this.addChild(circle);

        var that = this;
        this.on('pressmove', function(evt) {
            var parent = that.parent;
            parent.setChildIndex(that, parent.children.length - 1);
            evt.target.x = evt.localX;
            evt.target.y = evt.localY;
        });
    }
    var sheepPrototype = createjs.extend(Sheep, createjs.Container);
    sheepPrototype.draw = function(ctx) {
        this.super_draw(ctx);
    };
    // TODO: figure out why visible is a method, not a property.
    sheepPrototype.isVisible = function() {
        return true;
    }
    window.Sheep = createjs.promote(Sheep, 'super');

    // Game Class
    function Game(stage) {
        var map = new Map(80);
        map.x = 80; 
        map.y = 140;
        stage.addChild(map);
        this.map = map;

        var wolf = new Wolf();
        this.wolf = wolf;

        var wolf2 = new Wolf();
        this.wolf2 = wolf2;
        this.wolves = [wolf, wolf2];

        this.sheeps = [];
        for (var i = 0; i < 24; i++) {
            this.sheeps.push(new Sheep());
        }

        this.round = 0;

        // game status 
        // 0-not start
        // 1-game playing
        // 2-wolves win
        // 3-sheeps win
        this.status = 0;
        this.stage = stage;
    }

    Game.prototype = {
        start: function() {
            this.status = 1;
            var that = this;

            this.map.wolfPositionIndice.forEach(function(id, index) {
                var wolf = that.wolves[index];
                wolf.x = that.map.nodes[id].x;
                wolf.y = that.map.nodes[id].y;
                that.map.addChild(wolf);
            });
            this.map.sheepPositionIndice.forEach(function(id, index) {
                var sheep = that.sheeps[index];
                sheep.x = that.map.nodes[id].x;
                sheep.y = that.map.nodes[id].y;
                that.map.addChild(sheep);
            });
            this.nextRound();
        },
        nextRound: function() {
            if (this.status != 1) return;

            this.round++;
            if (this.round % 2 == 1) {
                // wolf turn
            } else {
                // sheep turn
            }
        },
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

    var game = new Game(stage);
    game.start();

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

