
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const pointsEl = document.getElementById('points');
const livesEl = document.getElementById('lives');

let points = 0;
let lives = 5;
let enemies = [];
const jsonUrl = 'https://stianh11.github.io/spaceNukeJson/enemies.json'
//add highscore?

fetch(jsonUrl)
.then(response =>
{
    if (!response.ok)
    {
    throw new Error('Failed to load JSON');
    }
    return response.json();
})
.then(data =>
{
    enemies = data.enemies;
    nukes = data.nukes;
    console.log('Enemies loaded:', enemies);
    console.log('Nuke loaded:', nukes);
    
})
.catch(error => console.error('Error loading JSON:', error));


function movePlayer(offsetX = 0, offsetY = 0)
{
    const currentLeft = player.offsetLeft;
    const newLeft = Math.max(0, Math.min(gameArea.clientWidth - player.offsetWidth, currentLeft + offsetX));
    player.style.left = `${newLeft}px`; 
    const currentTop = player.offsetTop;
    const newTop = Math.max(0, Math.min(gameArea.clientHeight - player.offsetHeight, currentTop + offsetY));
    player.style.top =`${newTop}px`;
}
document.addEventListener('keydown', (e) =>
    {
        if (e.key === 'ArrowLeft') movePlayer(-50, 0);
        if (e.key === 'ArrowRight') movePlayer(50, 0);
        if (e.key === 'ArrowUp') movePlayer(0, -50);
        if (e.key === 'ArrowDown') movePlayer(0, 50);
        if (e.key === ' ') shootPewPew();
    });
//need a pewpewpew
function shootPewPew()
{
    const projectile = document.createElement('div'); //creates copys of projectile
    projectile.className = 'projectile';
    // adjust projectile position to spawn
    const playerTop = player.offsetTop;
    const playerCenterX = player.offsetLeft + player.offsetWidth / 10;
    projectile.style.left = `${playerCenterX + 2}px`; // center horizontally
    projectile.style.top = `${playerTop}px`; // align with the top of the player
    gameArea.appendChild(projectile); //spawns pewpew

    const interval = setInterval(() =>
    {
        const currentTop = parseInt(projectile.style.top);
        projectile.style.top = `${currentTop - 10}px`;
        if (currentTop < 0)
        {
        clearInterval(interval);
        projectile.remove();
        }
        document.querySelectorAll('.enemy, .nuke').forEach(target =>
        {
            if (checkCollision(projectile, target))
            {
                let hp = parseInt(target.dataset.hp);
                hp -= 1;
                target.dataset.hp = hp;
                if (hp <= 0)
                {
                points += parseInt(target.dataset.points);
                pointsEl.textContent = points;
                target.remove();
                }
                projectile.remove();
                clearInterval(interval);
            }
        });
    }, 50); //how often the code should run in ms
}

function spawnEnemy()
{
    if (enemies.length === 0) return;

    const enemyData = enemies[Math.floor(Math.random() * enemies.length)];
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.backgroundImage = `url('${enemyData.image}')`;
    enemy.style.left = `${Math.random() * (gameArea.clientWidth - 40)}px`;
    enemy.dataset.points = enemyData.points;
    enemy.dataset.damage = enemyData.damage;
    enemy.dataset.hp =  enemyData.hp;
    gameArea.appendChild(enemy);
  
    const interval = setInterval(() =>
    {
        const currentTop = parseInt(enemy.style.top || 0);
        enemy.style.top = `${currentTop + enemyData.speed}px`;
        if (checkCollision(enemy, player))
        {
            lives -= parseInt(enemy.dataset.damage);
            livesEl.textContent = lives;
            clearInterval(interval);
            enemy.remove();
            if (lives <= 0)
            {
                alert('You got fucked!');
                location.reload();
            }
       }
        if (currentTop > gameArea.clientHeight)
        {
            clearInterval(interval);
            enemy.remove();
        }
    }, 50);
}
setInterval(spawnEnemy, 500); //let it raaaaiiiin!!

// test
function spawnNuke()
{
    if (nukes.length === 0) return;

    const nukeData = nukes[Math.floor(Math.random() * nukes.length)];
    const nuke = document.createElement('div');
    nuke.className = 'nuke';
    nuke.style.backgroundImage = `url('${nukeData.image}')`;
    nuke.style.left = `${Math.random() * (gameArea.clientWidth - 40)}px`;
    nuke.dataset.points = nukeData.points;
    nuke.dataset.damage = nukeData.damage;
    nuke.dataset.hp = nukeData.hp;
    gameArea.appendChild(nuke);

    const interval = setInterval(() =>
    {
        if (!document.body.contains(nuke))
        {    // removes nuke from DOM so it cant shadowbomb the earth
            clearInterval(interval);
            return;
        }
        const currentTop = parseInt(nuke.style.top || 0);
        nuke.style.top = `${currentTop + nukeData.speed}px`;
        if (currentTop > gameArea.clientHeight)
            { //end game if nuke reach bottom
                clearInterval(interval);
                nuke.remove();
                alert('The world got fucked');
                location.reload(); 
            }
    }, 50);
}
setInterval(spawnNuke, 8000);
// add powerup hp++
function checkCollision(obj1, obj2)
{
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();
  return(
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top &&
    rect1.left < rect2.right &&
    rect1.right > rect2.left
    );
}
