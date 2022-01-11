var control = new wgllib.gameUtil.FirstPersonController(renderer.camera);

wgllib.createAnimation(function(currTime,elapsedTime){
    control.update(elapsedTime);
    renderer.draw(currTime,elapsedTime);
});