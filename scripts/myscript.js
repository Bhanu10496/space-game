// var canvasWidth = 480;
// var canvasHeight = 320;
var canvasWidth = window.innerWidth-10;
var canvasHeight = window.innerHeight-100;

console.log(canvasWidth);
console.log(canvasHeight);
var canvasElement = $("<canvas width ='"+canvasWidth+"' height = '"+canvasHeight+" '></canvas>");
var canvas=canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

document.body.style.background = "#f3f3f3 url('images/cloud.jpg') ";

var fps=30;
var time=0;
var level=1;

var myInterval=setInterval(function(){
    draw();
    update();
},1000/fps);

var x=50,y=50;

function update()
{
    time++;
    //level is increased with time
    if(time>200)
    {
        time=0;
        level++;
    }
    if(keydown.left)
    {
        player.x-=10;
    }
    if(keydown.right)
    {
        player.x+=10;
    }
    if(keydown.space)
    {
        player.shoot();
    }
    player.x=player.x.clamp(0,canvasWidth-player.width);

    //explosion graphics added
    explosions.forEach(function(ex){
        ex.update();
    });

    explosions=explosions.filter(function(ex){
        return ex.srcY<225;
    });

    playerBullets.forEach(function(bullet){
        bullet.update();
    });

    playerBullets=playerBullets.filter(function(bullet){
        return bullet.active;
    });

    enemies.forEach(function(enemy){
        enemy.update();
        //ending the game if more than 3 enemies cross the player
        if(!enemy.inBounds()&&enemy.x>=0 && enemy.x<= canvasWidth )
        {
            player.cross+=1;
        }
        if(player.cross>3)
           {
            player.lose();
           }
    });

    enemies=enemies.filter(function(enemy){
        return enemy.active;
    });
    var xr=Math.random();
    if(xr<0.1){
        if(xr<0.04){
        //Adding a new bonus enemy of score=20
        enemies.push(Enemy({type:"BigEnemy"}));
        }
        else
        {
            enemies.push(Enemy({type:"enemy"+(level%3)}));
        }
    }

    handleCollisions();
    canvas.font="20px Arial";
    canvas.fillText("LEVEL : "+level+" SCORE : "+player.score,canvasWidth-250,25);
}

function draw()
{
    canvas.clearRect(0,0,canvasWidth,canvasHeight);
    player.draw();

    //explosion graphics added
    explosions.forEach(function(ex){
        ex.draw();
    });

    playerBullets.forEach(function(bullet){
        bullet.draw();
    });

    enemies.forEach(function(enemy){
        enemy.draw();
    });
}

var player={
    color: "#00A",
    x: canvasWidth/2,
    y: canvasHeight-32,
    width: 32,
    height: 32,
    score: 0,
    cross:0,
    active:true,
    sprite:Sprite("player"),

    midpoint: function(){
        return {
                x:this.x+this.width/2,
                y:this.y+this.height/2
        };
    },

    draw: function(){
        //canvas.fillStyle=this.color;
        //canvas.fillRect(this.x,this.y,this.width,this.height);
        this.sprite.draw(canvas,this.x,this.y);
    },

    shoot: function(){
        var temp=this.midpoint();
        playerBullets.push(Bullet({
                speed:20,
                x:temp.x,
                y:temp.y
            }));
        //Sound.play("shoot");
    },

    explode:function(){
            this.active=false;
            explosions.push(Explosion(this));
            player.lose();
    },

    lose:function(){
        //alert("game over");
        document.body.style.background = "#f3f3f3 url('images/enemy.png') ";
        canvas.fillStyle="#00A";
        canvas.fillRect(0,0,canvasWidth,canvasHeight);
        canvas.fillStyle="#FF0000";
        canvas.font="30px Arial";
        canvas.fillText("GAME OVER !!!!!",canvasWidth/2-100,canvasHeight/2);
        canvas.font="20px Arial";
        canvas.fillText("LEVEL : "+level+" SCORE : "+player.score,canvasWidth-250,25);
        clearInterval(myInterval);
    }
};

var playerBullets=[];

function Bullet(I)
{
    I.active=true;
    I.xVelocity=0;
    I.yVelocity= -I.speed;
    I.width=3;
    I.height=3;
    I.color="#000";

    I.inBounds=function(){
        return I.x>=0 && I.x<= canvasWidth && I.y>=0 && I.y<= canvasHeight;
    };

    I.draw=function(){
        canvas.fillStyle=this.color;
        canvas.fillRect(this.x,this.y,this.width,this.height);
    };

    I.update=function()
    {
        I.x+=I.xVelocity;
        I.y+=I.yVelocity;
        I.active=I.active&&I.inBounds();
    };

    I.explode=function(){
        this.active=false;
    };
    return I;
}

var enemies=[];
function Enemy(I)
{
    //I=I||{};
    I.active=true;
    I.age=Math.floor(Math.random()*128);
    I.color="#A2B";
    I.x=canvasWidth/4+Math.random()*canvasWidth/2;
    I.y=0;
    I.xVelocity=0;
    I.yVelocity=1;
    I.width=32;
    I.height=32;
    I.sprite=Sprite(I.type);

    I.inBounds=function(){
            return I.x>=0&&I.x<=canvasWidth&&I.y>=0&&I.y<=canvasHeight;
    };

    I.draw=function(){
        //canvas.fillStyle=this.color;
        //canvas.fillRect(this.x,this.y,this.width,this.height);
        this.sprite.draw(canvas,this.x,this.y);
    };

    I.update=function(){
            I.x+=I.xVelocity;
            I.y=I.y+(I.yVelocity)*level;
            I.xVelocity=3*Math.sin(I.age*Math.PI/64);
            I.age++;
            I.active=I.active&&I.inBounds();
    };

    I.explode=function(){
        explosions.push(Explosion(I));
        I.active=false;
    };

    I.crossed=function()
    {
        return I.y+I.height>player.y;
    };

    return I;
}

var img=new Image();
img.src="images/explosion.jpg";
var explosions=[];

function Explosion(I)
{

    var ex={};
    ex.counter=0;
    ex.srcX=0;
    ex.srcY=0;
    ex.x=I.x;
    ex.y=I.y;

    ex.draw=function(){
        canvas.drawImage(img,this.srcX,this.srcY,45,45,this.x,this.y,45,45);
    };

    ex.update=function(){
        this.counter+=45;
        this.srcX=(this.counter)%225;
        this.srcY=Math.floor(this.counter/225)*45;
        console.log(this.srcX);
        console.log(this.srcY);
    };

    return ex;
}

function collides(a,b)
{
    return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
}

function handleCollisions()
{

    playerBullets.forEach(function(bullet){
        enemies.forEach(function(enemy){
            if(collides(bullet,enemy))
            {
                if(enemy.type=="enemy")
                    player.score+=10;
                if(enemy.type=="BigEnemy")
                    player.score+=20;
                enemy.explode();
                bullet.explode();
            }
        });
    });

    enemies.forEach(function(enemy){
        if(collides(enemy,player))
        {
            enemy.explode();
            player.explode();
        }
    });
}