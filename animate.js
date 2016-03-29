(function(win, document){
    "use strict";

    function Vector(x, y){
        this.x = x;
        this.y = y;
    }
    Vector.prototype.add = function(vector){
        return new Vector(this.x + vector.x, this.y + vector.y);
    };
    Vector.prototype.times = function(factor){
        return new Vector(this.x * factor, this.y * factor);
    };

    function elt(name, className){
        var elt = document.createElement(name);
        if(className){
            elt.className = className;
        }
        return elt;
    }

    //  cloud
    function Cloud(prop){
        this.htmlElement = null;
        var p = prop || {};
        this.size = new Vector(p.size[0], p.size[1]);
        this.speed = new Vector(p.speed[0], p.speed[1]);
        this.dateCreated = new Date().getTime();
        this.orgPos = this.pos = new Vector(p.pos[0], p.pos[1]);
        this.showTime = (screen.bottom - this.orgPos.y)/this.speed.y;
    }
    Cloud.prototype.actorType = 'cloud';
    Cloud.prototype.step = function(stamp){
        this.pos = this.pos.add(this.speed.times(stamp));
    };
    Cloud.prototype.isOut = function(){
        var passedTime = (new Date().getTime() - this.dateCreated)/1000;
        return passedTime > this.showTime;
    };

    //  dot
    function Dot(prop){
        this.htmlElement = null;
        var p = prop || {};
        this.size = new Vector(p.size[0], p.size[1]);
        this.orgPos = this.pos = new Vector(p.pos[0], p.pos[1]);
        this.speed = new Vector(p.speed[0], p.speed[1]);
        this.dateCreated = new Date().getTime();
        this.showTime = (screen.bottom - this.orgPos.y)/this.speed.y;
    }
    Dot.prototype.actorType = 'dot';
    Dot.prototype.step = function(stamp){
        this.pos = this.pos.add(this.speed.times(stamp));
    };
    Dot.prototype.isOut = function(){
        var passedTime = (new Date().getTime() - this.dateCreated)/1000;
        return passedTime > this.showTime;
    };

    //  logo
    function Logo(prop){
        this.htmlElement = null;
        var p = prop || {};
        this.size = new Vector(p.size[0], p.size[1]);
        this.pos = new Vector(p.pos[0], p.pos[1]);
        this.speed = new Vector(p.speed[0], p.speed[1]);
        this.minLimit = new Vector(screen.center.x - 1.5*this.size.x, screen.center.y);
        this.maxLimit = new Vector(screen.center.x + 0.5*this.size.x, screen.center.y);
    }
    Logo.prototype.actorType = 'logo';
    Logo.prototype.step = function(stamp){
        if(this.pos.x > this.maxLimit.x || this.pos.x < this.minLimit.x){
            this.speed = this.speed.times(-1);
        }
        this.pos = this.pos.add(this.speed.times(stamp));
    };
    Logo.prototype.isOut = function(){
        return false;
    };

    //  静态太阳
    function StaticSun(prop){
        this.htmlElement = null;
        var p = prop || {};
        this.size = new Vector(p.size[0], p.size[1]);
        this.pos = new Vector(p.pos[0], p.pos[1]);
        this.speed = new Vector(p.speed[0], p.speed[1]);
    }
    StaticSun.prototype.actorType = 'sun';
    StaticSun.prototype.step = function(stamp){
    };
    StaticSun.prototype.isOut = function(){
        return false;
    };

    function Sun(prop){
        this.htmlElement = null;
        var p = prop || {};
        this.size = new Vector(p.size[0], p.size[1]);
        this.orgPos = this.pos = new Vector(p.pos[0], p.pos[1]);
        this.speed = new Vector(p.speed[0], p.speed[1]);

        this.shadowSize = [prop.shadowSize[0], prop.shadowSize[1], prop.shadowSize[2]];
        this.shadowFactor = prop.shadowFactor;
        this.shadowSpeedBase = prop.shadowSpeedBase;
        this.shadowSpeed2 = this.shadowSpeedBase * this.shadowFactor;
        this.shadowSpeed3 = this.shadowSpeedBase * this.shadowFactor * this.shadowFactor;

        this.minLimit = this.orgPos;
        this.maxLimit = new Vector(this.orgPos.x + 18, this.orgPos.y + 18);
    }
    Sun.prototype.actorType = 'sunInner';
    Sun.prototype.step = function(stamp){

        if(this.pos.x > this.maxLimit.x || this.pos.x < this.minLimit.x){
            this.speed = this.speed.times(-1);
            this.shadowSpeedBase = -this.shadowSpeedBase;
            this.shadowSpeed2 = -this.shadowSpeed2;
            this.shadowSpeed3 = -this.shadowSpeed3;
        }

        this.pos = this.pos.add(this.speed.times(stamp));

        this.shadowSize[0] = this.shadowSize[0] + this.shadowSpeedBase * stamp;
        this.shadowSize[1] = this.shadowSize[1] + this.shadowSpeed2 * stamp;
        this.shadowSize[2] = this.shadowSize[2] + this.shadowSpeed3 * stamp;

    };
    Sun.prototype.isOut = function(){
        return false;
    };


    /**
     * screen
     * @param window (required) 浏览器的window对象或者window的代理。
     * @param prop.element (required) screen html元素，HTMLElement类型，不接受直接的jQUery对象
     * @constructor
     */
    function Screen(window, prop){
        var p = prop || {};
        this.window = window;
        this.element = prop.element;

        //  screen size
        this.left = 0;
        this.top = 0;
        this.right = this.element.offsetWidth;
        this.bottom = this.element.offsetHeight;
        this.center = new Vector(this.left + this.right/2, this.top + this.bottom/2);

        this.lastTimeStamp = null;
    }
    Screen.prototype.init = function(elementArray){
        this.elementArray = elementArray;
        this.elementArray.forEach(function(ele){

            var htmlEle = this.makeDisplayNode(ele);
            this.element.appendChild(htmlEle);
            ele.htmlElement = htmlEle;
        }, this);
    };
    Screen.prototype.makeDisplayNode = function(ele){
        var htmlElement = elt('div', 'actor ' + ele.actorType);

        htmlElement.style.left = ele.pos.x + 'px';
        htmlElement.style.top = ele.pos.y + 'px';
        htmlElement.style.width = ele.size.x + 'px';
        htmlElement.style.height = ele.size.y + 'px';

        return htmlElement;
    };
    Screen.prototype.step = function(mills){

        if(this.lastTimeStamp){
            var stamp = Math.min(mills - this.lastTimeStamp, 100) / 1000;
            this.redraw(stamp);
        }
        this.lastTimeStamp = mills;

        var self = this;
        this.window.requestAnimationFrame(function(mills){
            self.step(mills);
        });
    };
    Screen.prototype.redraw = function(stamp){
        this.elementArray.forEach(function(ele){
            ele.step(stamp);
            this.drawElement(ele);
        }, this);
    };
    Screen.prototype.drawElement = function(element){
        if(element.isOut()){
            return this.handleOut(element);
        }

        var htmlElement = element.htmlElement;

        if(htmlElement){
            htmlElement.style.left = element.pos.x + 'px';
            htmlElement.style.top = element.pos.y + 'px';
            if(element.shadowSize){

                var s1 = element.shadowSize[0],
                    s2 = element.shadowSize[1],
                    s3 = element.shadowSize[2];
                htmlElement.style.boxShadow = '0 0 ' + s1 + 'px ' + s1 + 'px #e9e9eb';//, 0 0 ' + s2 + 'px ' + s2 + 'px #eaeebc, 0 0 ' + s3 + 'px ' + s3 + 'px #e9ecb0,0 0 300px 100px #e8d194';
            }
        }else{
            htmlElement = this.makeDisplayNode(element);
            this.element.appendChild(htmlElement);
            element.htmlElement = htmlElement;
        }
    };
    Screen.prototype.handleOut = function(ele){
        //  页面中删除元素
        var htmlElement = ele.htmlElement;
        if(htmlElement){
            this.element.removeChild(htmlElement);
        }

        //  array中删除元素
        var index = this.elementArray.indexOf(ele);
        this.elementArray.splice(index, 1);
    };
    Screen.prototype.start = function(){
        var self = this;
        this.window.requestAnimationFrame(function(mills){
            self.step(mills);
        });
    };


    //  元素生成器
    function Generator(plan){
        this.plan = plan;
        this.elementArray = [];
    }
    Generator.prototype.createFromPlan = function(){
        //  初始元素
        this.plan.initElement.forEach(function(props){
            this.elementArray.push(this.generateElement(props));
        }, this);

        //  后续随机生成元素
        this.plan.genElement.forEach(function(template){
            this.addElement(template);
        }, this);
        return this.elementArray;
    };

    //  根据指定的类型和属性生成一个元素
    Generator.prototype.generateElement = function(props){
        return new props.typeFunction(props);
    };
    //  在数组中增加元素
    Generator.prototype.addElement = function(template){
        this.elementArray.push(this.getRandomElement(template));
        var self = this;
        win.setTimeout(function(){
            self.addElement(template);
        }, template.generatorInterval);

    };
    //  根据模版生成一个随机元素
    Generator.prototype.getRandomElement = function(template){
        var size = template.size,
            posScope = template.pos.scope,
            speedScope = template.speed.scope;

        var width = size.scope[0] + Math.floor(Math.random() * (size.scope[1] - size.scope[0]));
        var height = width * size.ratio;
        var posX = posScope[0][0] + Math.floor(Math.random() * (posScope[0][1] - posScope[0][0]));
        var posY = posScope[1][0] + Math.floor(Math.random() * (posScope[1][1] - posScope[1][0]));
        var speedX = speedScope[0][0] + Math.floor(Math.random() * (speedScope[0][1] - speedScope[0][0]));
        var speedY = speedScope[1][0] + Math.floor(Math.random() * (speedScope[1][1] - speedScope[1][0]));

        return this.generateElement({
            typeFunction: template.typeFunction,
            size: [width, height],
            pos: [posX, posY],
            speed: [speedX, speedY]
        });
    };


    //  start the animation
    function start(plan){
        var g = new Generator(plan);
        var array = g.createFromPlan();

        screen.init(array);
        screen.start();

    }

    var screen = new Screen(win, {
        element: document.getElementById("loadingPanel")
    });


    // generator描述
    // initPlan
    var plan = {
        initElement: [
            {
                typeFunction: Cloud,
                size: [50, 24.5],
                pos: [screen.center.x - 150, screen.center.y - 10],
                speed: [0, 50]
            },
            {
                typeFunction: Cloud,
                size: [80, 39.2],
                pos: [screen.center.x + 100, screen.center.y - 100],
                speed: [0, 50]
            },
            {
                typeFunction: Dot,
                size: [5, 5],
                pos: [screen.left + 100, screen.bottom-200],
                speed: [0, 50]
            },
            {
                typeFunction: Dot,
                size: [8, 8],
                pos: [screen.center.x -100, screen.center.y + 20],
                speed: [0, 50]
            },
            {
                typeFunction: Logo,
                size: [115, 170],
                pos: [screen.center.x, screen.center.y],
                speed: [50, 0]
            },
            {
                typeFunction: StaticSun,
                size: [30, 30],
                pos: [screen.left + 160, screen.top + 160],
                speed: [0, 0]
            },
            {
                typeFunction: Sun,
                size: [1, 1],
                pos: [screen.left + 175, screen.top + 175],
                speed: [6, 6],
                shadowSize: [2,3,4],
                shadowSpeedBase: 8,
                shadowFactor: 1.25
            }
        ],
        genElement: [
            {
                typeFunction: Cloud,  //页面元素
                generatorInterval: 2000,
                size: {
                    scope: [30, 100],  //宽度范围
                    ratio: 0.49    //  高度/宽度
                },
                pos: {
                    scope: [[screen.left + 10, screen.right - 110],[0, 0]]  // [[x方向范围],[y方向范围]]
                },
                speed: {
                    scope: [[0, 0],[50, 100]]  //[[x方向速度范围] ,[y方向速度范围]]
                }
            },
            {
                typeFunction: Dot,  //页面元素
                generatorInterval: 1500,
                size: {
                    scope: [5, 15],  //宽度范围
                    ratio: 1    //  高度/宽度
                },
                pos: {
                    scope: [[screen.left + 10, screen.right - 25],[0, 0]]  // [[x方向范围],[y方向范围]]
                },
                speed: {
                    scope: [[0, 0],[20, 50]]  //[[x方向速度范围] ,[y方向速度范围]]
                }
            }
        ]
    };

    //  kick off
    start(plan);

})(window, document);
