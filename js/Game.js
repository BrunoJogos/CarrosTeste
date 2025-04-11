class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false
  }

  getState(){
    var gamestateRef = database.ref("gameState")
    gamestateRef.on("value", function(data){
      gameState = data.val()
    })
  }

  start() {
    form = new Form();
    form.display();
    player = new Player();
    playerCount = player.getCount()

    car1 = createSprite(width / 2 - 50, height)
    car1.addImage("car1", car1_img)
    car1.scale = 0.07

    car2 = createSprite(width / 2 + 100, height)
    car2.addImage("car2", car2_img)
    car2.scale = 0.07
//           0     1
    cars = [car1, car2]

    fuels = new Group()
    powerCoins = new Group()
    obstacles = new Group()

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ]
    
    this.addSprites(fuels, 4, fuelImage, 0.02)
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09)
    this.addSprites(obstacles, obstaclesPositions.length, obstacle2Image,0.04,obstaclesPositions)
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []){
    for(var i=0; i < numberOfSprites; i++){
      var x,y;

      if(positions.length > 0){
        x = positions[i].x
        y = positions[i].y
        spriteImage = positions[i].image
      }else{
         x = random(width/2+150, width/2-150)
         y = random(-height*4.5, height-400)
      }

      var sprite = createSprite(x,y)
      sprite.addImage(spriteImage)
      sprite.scale = scale
      spriteGroup.add(sprite)
    }
  }

  Update(state){
    database.ref("/").update({
    gameState: state
    })}

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reinicar Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Placar");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play(){
    this.handleElements()
    this.handleResetButton()

    Player.getPlayersInfo()
    player.getCarsAtEnd()

    if(allPlayers !== undefined){
      image(track, 0, -height*5, width, height*6)
      this.showLeaderbord()
      var index = 0 //posição do jogador
      for (var plr in allPlayers){
        index += 1
        var x = allPlayers[plr].positionX
        var y = allPlayers[plr].positionY
        console.log(y)
        cars[index-1].position.x = x
        cars[index-1].position.y = y

        if(index === player.index){
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index)
          this.handlePowerCoins(index)

          camera.position.y = cars[index -1].position.y
        }
      }

      //if(this.playerMoving){
      //  player.positionY -= 5
      //  player.update()
      //}

      this.handlePlayerControls()

      //Linha de chegada
      const finishLine = height*6 - 100

      if(player.positionY>finishLine){
        gameState = 2 //0 cadastro, 1 jogar, 2 fim de jogo
        player.rank +=1
        Player.updateCarsAtEnd(player.rank)
        player.update()
        this.showRank()
      }

      drawSprites()
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(()=>{
      database.ref("/").set({
        players:{},
        playerCount: 0,
        gameState: 0,
        carsAtEnd: 0
      })
      window.location.reload()
    })
  }

  showLeaderbord(){
    var leader1,leader2
    var players = Object.values(allPlayers)
    if((players[0].rank === 0 && players[1].rank === 0) || players[0].rank === 1){
      leader1 =players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
      leader2 =players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
    }
    if( players[1].rank === 1){
      leader1 =players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score
      leader2 =players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score
    }
    this.leader1.html(leader1)
    this.leader2.html(leader2)
  }
    
  handlePlayerControls(){
    if (keyDown(UP_ARROW)){
      this.playerMoving = true
      player.positionY -= 10
      player.update()
    }
    if (keyDown(RIGHT_ARROW) && player.positionX < width / 2 + 300){
      player.positionX += 10
      player.update()
    }
    if (keyDown(LEFT_ARROW)&& player.positionX > width / 3 + 50){
      player.positionX -= 10
      player.update()
    }
  }

  handleFuel(index) {
    cars[index -1].overlap(fuels, function(collector, collected){
      player.fuel = 185
      collected.remove()
    })
  }

  handlePowerCoins(index) {
    cars[index -1].overlap(powerCoins, function(collector, collected){
      player.score += 2100000
      player.update()
      collected.remove()
    })
  }

  showRank(){
    swal({
      title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }
}
