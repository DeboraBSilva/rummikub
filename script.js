let players = [];
let currentPlayerIndex = 0;
loadData();

function saveData() {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('currentPlayerIndex', currentPlayerIndex);
}

function loadData() {
    const storedPlayers = localStorage.getItem('players');
    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
        updateScoreBoard();
    }
    const storedIndex = localStorage.getItem('currentPlayerIndex');

    if (storedIndex !== null) {
        currentPlayerIndex = parseInt(storedIndex);
    }
}

function addPlayer() {
    const playerName = document.getElementById('playerName').value;
    if (playerName !== '') {
        players.push({ name: playerName, scores: new Array(5).fill(0) });
        updateScoreBoard();
        saveData();
        document.getElementById('playerName').value = '';
    }
}

function updateScoreBoard() {
    const scoreBody = document.getElementById('scoreBody');
    scoreBody.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sticky-col ${index === currentPlayerIndex ? 'hand-player' : ''}" id="player-${index}" style="text-align: left;">
                <div style="display: flex; align-items: center; justify-content: flex-start; ">
                    <button onclick="removePlayer(${index})" class="button-table">
                        <i class="fas fa-trash" style="color: red;"></i>
                    </button>
                    <div style="margin-left: 8px;">
                        ${player.name}
                    </div>
                </div>
            </td>
            <td><input style="width: 40px;" type="number" id="score-${index}-0" placeholder="0" min="0" inputmode="numeric" value="${player.scores[0] || ''}" onchange="updateScore(${index}, 0)"></td>
            <td><input style="width: 40px;" type="number" id="score-${index}-1" placeholder="0" min="0" inputmode="numeric" value="${player.scores[1] || ''}" onchange="updateScore(${index}, 1)"></td>
            <td><input style="width: 40px;" type="number" id="score-${index}-2" placeholder="0" min="0" inputmode="numeric" value="${player.scores[2] || ''}" onchange="updateScore(${index}, 2)"></td>
            <td><input style="width: 40px;" type="number" id="score-${index}-3" placeholder="0" min="0" inputmode="numeric" value="${player.scores[3] || ''}" onchange="updateScore(${index}, 3)"></td>
            <td><input style="width: 40px;" type="number" id="score-${index}-4" placeholder="0" min="0" inputmode="numeric" value="${player.scores[4] || ''}" onchange="updateScore(${index}, 4)"></td>
            <td id="total-${index}">${player.scores.reduce((a, b) => a + b, 0)}</td>
        `;
        scoreBody.appendChild(row);
    });
    console.log("corrente", currentPlayerIndex)
}

function nextRound() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    players.forEach((player, index) => {
        const scoreInput = document.getElementById(`player-${index}`);

        scoreInput.classList.remove('hand-player');

        if (index === currentPlayerIndex) {
            scoreInput.classList.add('hand-player');
        }
    });

    saveData();
}

function removePlayer(index) {
    players.splice(index, 1);
    updateScoreBoard();
    saveData();
}

function calculateTotal() {
    players.forEach((player, index) => {
        let total = 0;
        for (let i = 0; i < 5; i++) {
            const scoreInput = document.getElementById(`score-${index}-${i}`);
            const score = parseInt(scoreInput.value) || 0;
            player.scores[i] = score;
            total += score;
        }
        const totalCell = document.getElementById(`total-${index}`);
        totalCell.innerText = total;
    });

    let scores = players.map((player, index) => ({
        index,
        total: player.scores.reduce((a, b) => a + b, 0)
    }));

    let maxScore = Math.max(...scores.map(score => score.total));
    let tieScores = scores.filter(score => score.total === maxScore);

    players.forEach((_, index) => {
        const totalCell = document.getElementById(`total-${index}`);
        totalCell.classList.remove('total-score', 'highest-score', 'tie-score');
    });

    tieScores.forEach(({ index }) => {
        const totalCell = document.getElementById(`total-${index}`);
        totalCell.classList.add('total-score');
        if (tieScores.length > 1) {
            totalCell.classList.add('tie-score');
        } else {
            totalCell.classList.add('highest-score');
        }
    });

    saveData();
}

function clearScores() {
    players.forEach(player => {
        player.scores = new Array(5).fill(0);
    });

    currentPlayerIndex = Math.floor(Math.random() * players.length);

    updateScoreBoard();
    saveData();
}

function calculateColumn(roundIndex) {
    let unmarkedPlayers = [];

    players.forEach((player, index) => {
        const scoreInput = document.getElementById(`score-${index}-${roundIndex}`);
        const score = parseInt(scoreInput.value) || 0;

        if (score === 0) {
            unmarkedPlayers.push(index);
        }
    });

    if (unmarkedPlayers.length > 1) {
        Swal.fire({
            text: 'Não é possível calcular a rodada. Ainda existem jogadores sem pontuação.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (unmarkedPlayers.length === 1) {
        const zeroIndex = unmarkedPlayers[0];
        let sum = 0;

        players.forEach((player, index) => {
            const scoreInput = document.getElementById(`score-${index}-${roundIndex}`);
            const score = parseInt(scoreInput.value) || 0;

            if (index !== zeroIndex) {
                scoreInput.value = -Math.abs(score);
                scoreInput.classList.add('negative-score');
                sum += Math.abs(score);
            }
        });

        const zeroInput = document.getElementById(`score-${zeroIndex}-${roundIndex}`);
        zeroInput.value = sum;
        zeroInput.classList.add('positive-score');
        nextRound();
    } else {
        Swal.fire({
            text: 'Essa rodada já foi calculada.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    calculateTotal();
    saveData();
}

function clearAllPlayers() {
    players = [];
    localStorage.removeItem('players');
    updateScoreBoard();
}

function showHelp() {
    document.getElementById('helpSection').style.display = 'block';
}

function hideHelp() {
    document.getElementById('helpSection').style.display = 'none';
}

window.onload = loadData;
